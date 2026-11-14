package keygate

import (
	"bytes"
	"crypto/ed25519"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"sync"
	"time"
)

var ErrNetwork = errors.New("network_unavailable")

type Feature struct {
	Key       string     `json:"key"`
	ExpiresAt *time.Time `json:"expiresAt"`
}
type Access struct {
	LicenseID   string    `json:"licenseId"`
	AppID       string    `json:"appId"`
	Environment string    `json:"environment"`
	Status      string    `json:"status"`
	PlanKey     string    `json:"planKey"`
	Features    []Feature `json:"features"`
	Revision    int       `json:"revision"`
}
type State struct {
	DeviceID      string
	Token         string
	ActivationKey string
	LastSeen      time.Time
}
type Storage interface {
	Read() (*State, error)
	Write(State) error
}
type MemoryStorage struct{ Value *State }

func (s *MemoryStorage) Read() (*State, error) {
	if s.Value == nil {
		return nil, nil
	}
	value := *s.Value
	return &value, nil
}
func (s *MemoryStorage) Write(value State) error { s.Value = &value; return nil }

type jwk struct {
	KID string `json:"kid"`
	KTY string `json:"kty"`
	CRV string `json:"crv"`
	X   string `json:"x"`
}
type claims struct {
	Version  string    `json:"v"`
	Issuer   string    `json:"iss"`
	Audience string    `json:"aud"`
	Env      string    `json:"env"`
	KID      string    `json:"kid"`
	Device   string    `json:"dev"`
	Subject  string    `json:"sub"`
	Plan     string    `json:"plan"`
	Features []Feature `json:"features"`
	IAT      int64     `json:"iat"`
	EXP      int64     `json:"exp"`
	Offline  int64     `json:"offline_until"`
	Revision int       `json:"rev"`
}
type Client struct {
	AppID, Environment, APIURL, Issuer string
	Storage                            Storage
	HTTP                               *http.Client
	Clock                              func() time.Time
	keys                               map[string]jwk
	mu                                 sync.Mutex
	initialDevice                      string
}

func New(appID, environment, apiURL string, storage Storage, deviceID string) (*Client, error) {
	parsed, e := url.Parse(apiURL)
	if e != nil || parsed.Scheme != "https" && parsed.Scheme != "http" || !regexp.MustCompile(`^[a-fA-F0-9-]{36}$`).MatchString(appID) || environment != "sandbox" && environment != "live" || storage == nil {
		return nil, errors.New("invalid_configuration")
	}
	apiURL = strings.TrimRight(apiURL, "/")
	return &Client{AppID: appID, Environment: environment, APIURL: apiURL, Issuer: regexp.MustCompile(`/(?:api/)?v1$`).ReplaceAllString(apiURL, ""), Storage: storage, HTTP: &http.Client{Timeout: 10 * time.Second}, Clock: time.Now, keys: map[string]jwk{}, initialDevice: deviceID}, nil
}
func (c *Client) state() (*State, error) {
	state, e := c.Storage.Read()
	if e != nil {
		return nil, errors.New("storage_unavailable")
	}
	if state == nil {
		device := c.initialDevice
		if device == "" {
			var b [16]byte
			if _, e = rand.Read(b[:]); e != nil {
				return nil, e
			}
			device = hex.EncodeToString(b[:])
		}
		state = &State{DeviceID: device, LastSeen: c.Clock()}
		if e = c.Storage.Write(*state); e != nil {
			return nil, errors.New("storage_unavailable")
		}
	}
	if len(state.DeviceID) < 8 || len(state.DeviceID) > 256 {
		return nil, errors.New("storage_unavailable")
	}
	if c.Clock().Before(state.LastSeen.Add(-30 * time.Second)) {
		return nil, errors.New("clock_rollback")
	}
	return state, nil
}
func (c *Client) request(path string, body map[string]any, idempotency string) (map[string]json.RawMessage, error) {
	var reader io.Reader
	method := "GET"
	if body != nil {
		raw, e := json.Marshal(body)
		if e != nil {
			return nil, e
		}
		reader = bytes.NewReader(raw)
		method = "POST"
	}
	request, e := http.NewRequest(method, c.APIURL+"/"+path, reader)
	if e != nil {
		return nil, e
	}
	request.Header.Set("Content-Type", "application/json")
	if idempotency != "" {
		request.Header.Set("Idempotency-Key", idempotency)
	}
	response, e := c.HTTP.Do(request)
	if e != nil {
		return nil, ErrNetwork
	}
	defer response.Body.Close()
	raw, e := io.ReadAll(io.LimitReader(response.Body, 32769))
	if e != nil || len(raw) > 32768 {
		return nil, errors.New("invalid_response")
	}
	var result map[string]json.RawMessage
	if e = json.Unmarshal(raw, &result); e != nil {
		return nil, errors.New("invalid_response")
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		state, _ := c.state()
		if state != nil {
			state.Token = ""
			if c.Storage.Write(*state) != nil {
				return nil, errors.New("storage_unavailable")
			}
		}
		var code string
		_ = json.Unmarshal(result["code"], &code)
		if code == "" {
			code = "access_rejected"
		}
		return nil, errors.New(code)
	}
	return result, nil
}
func (c *Client) verify(token string) (Access, error) {
	deny := errors.New("invalid_token")
	parts := strings.Split(token, ".")
	if len(parts) != 3 || len(token) > 16000 {
		return Access{}, deny
	}
	decode := base64.RawURLEncoding.DecodeString
	head, e := decode(parts[0])
	if e != nil {
		return Access{}, deny
	}
	var header struct{ Alg, Typ, KID string }
	if json.Unmarshal(head, &header) != nil || header.Alg != "EdDSA" || header.Typ != "JWT" || header.KID == "" {
		return Access{}, deny
	}
	key, ok := c.keys[header.KID]
	if !ok {
		result, e := c.request("public-key", nil, "")
		if e != nil {
			return Access{}, e
		}
		var keys []jwk
		if json.Unmarshal(result["keys"], &keys) != nil || len(keys) > 10 {
			return Access{}, deny
		}
		for _, k := range keys {
			c.keys[k.KID] = k
		}
		key, ok = c.keys[header.KID]
	}
	if !ok || key.KTY != "OKP" || key.CRV != "Ed25519" {
		return Access{}, deny
	}
	public, e := decode(key.X)
	if e != nil || len(public) != 32 {
		return Access{}, deny
	}
	signature, e := decode(parts[2])
	if e != nil || !ed25519.Verify(public, []byte(parts[0]+"."+parts[1]), signature) {
		return Access{}, deny
	}
	raw, e := decode(parts[1])
	if e != nil {
		return Access{}, deny
	}
	var payload claims
	if json.Unmarshal(raw, &payload) != nil {
		return Access{}, deny
	}
	state, e := c.state()
	if e != nil {
		return Access{}, e
	}
	fingerprint := sha256.Sum256([]byte(state.DeviceID))
	now := c.Clock().Unix()
	if payload.Version != "keygate.v1" || payload.Issuer != c.Issuer || payload.Audience != c.AppID || payload.Env != c.Environment || payload.KID != header.KID || payload.Device != base64.RawURLEncoding.EncodeToString(fingerprint[:])[:22] || payload.IAT > now+30 || payload.EXP != payload.Offline || payload.EXP < payload.IAT || payload.Subject == "" || payload.Revision < 1 || !regexp.MustCompile(`^[a-z][a-z0-9_-]{0,63}$`).MatchString(payload.Plan) || len(payload.Features) > 100 {
		return Access{}, deny
	}
	if payload.EXP <= now {
		return Access{}, errors.New("expired")
	}
	features := []Feature{}
	for _, f := range payload.Features {
		if !regexp.MustCompile(`^[a-z][a-z0-9_-]{0,63}$`).MatchString(f.Key) {
			return Access{}, deny
		}
		if f.ExpiresAt == nil || f.ExpiresAt.After(c.Clock()) {
			features = append(features, f)
		}
	}
	return Access{payload.Subject, c.AppID, c.Environment, "active", payload.Plan, features, payload.Revision}, nil
}
func (c *Client) VerifyToken(token string) (Access, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.verify(token)
}
func (c *Client) post(path string, fields map[string]any, idempotency string) (map[string]json.RawMessage, error) {
	state, e := c.state()
	if e != nil {
		return nil, e
	}
	fields["app_id"] = c.AppID
	fields["environment"] = c.Environment
	fields["device_id"] = state.DeviceID
	return c.request(path, fields, idempotency)
}
func (c *Client) save(result map[string]json.RawMessage, key string) (Access, error) {
	var token string
	if json.Unmarshal(result["token"], &token) != nil {
		return Access{}, errors.New("invalid_response")
	}
	access, e := c.verify(token)
	if e != nil {
		return Access{}, e
	}
	state, e := c.state()
	if e != nil {
		return Access{}, e
	}
	state.Token = token
	if key != "" {
		state.ActivationKey = key
	} else if value := result["activationKey"]; value != nil {
		_ = json.Unmarshal(value, &state.ActivationKey)
	}
	if observed := c.Clock(); observed.After(state.LastSeen) {
		state.LastSeen = observed
	}
	if c.Storage.Write(*state) != nil {
		return Access{}, errors.New("storage_unavailable")
	}
	return access, nil
}
func (c *Client) Redeem(code string) (Access, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	state, e := c.state()
	if e != nil {
		return Access{}, e
	}
	fields := map[string]any{"code": code}
	if state.ActivationKey != "" {
		fields["activation_key"] = state.ActivationKey
	}
	var random [16]byte
	if _, e = rand.Read(random[:]); e != nil {
		return Access{}, e
	}
	result, e := c.post("redeem", fields, hex.EncodeToString(random[:]))
	if e != nil {
		return Access{}, e
	}
	return c.save(result, "")
}
func (c *Client) Activate(key string) (Access, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	result, e := c.post("activate", map[string]any{"activation_key": key}, "")
	if e != nil {
		return Access{}, e
	}
	return c.save(result, key)
}
func (c *Client) validate() (Access, error) {
	state, e := c.state()
	if e != nil {
		return Access{}, e
	}
	if state.Token == "" {
		return Access{}, errors.New("locked")
	}
	result, e := c.post("validate", map[string]any{"token": state.Token}, "")
	if e != nil {
		return Access{}, e
	}
	return c.save(result, "")
}
func (c *Client) ValidateOnline() (Access, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.validate()
}
func (c *Client) cached() (Access, error) {
	state, e := c.state()
	if e != nil {
		return Access{}, e
	}
	if state.Token == "" {
		return Access{}, errors.New("locked")
	}
	access, e := c.verify(state.Token)
	if e != nil {
		return Access{}, e
	}
	if observed := c.Clock(); observed.After(state.LastSeen) {
		state.LastSeen = observed
	}
	if c.Storage.Write(*state) != nil {
		return Access{}, errors.New("storage_unavailable")
	}
	return access, nil
}
func (c *Client) Validate() (Access, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	access, e := c.validate()
	if errors.Is(e, ErrNetwork) {
		return c.cached()
	}
	return access, e
}
func (c *Client) GetAccess() (Access, error) { c.mu.Lock(); defer c.mu.Unlock(); return c.cached() }
func (c *Client) Can(key string) bool {
	access, e := c.GetAccess()
	if e != nil {
		return false
	}
	for _, f := range access.Features {
		if f.Key == key {
			return true
		}
	}
	return false
}
func (c *Client) Deactivate() error {
	c.mu.Lock()
	defer c.mu.Unlock()
	state, e := c.state()
	if e != nil {
		return e
	}
	if state.Token != "" {
		if _, e = c.post("deactivate", map[string]any{"token": state.Token}, ""); e != nil {
			return e
		}
	}
	state.Token = ""
	if observed := c.Clock(); observed.After(state.LastSeen) {
		state.LastSeen = observed
	}
	return c.Storage.Write(*state)
}
