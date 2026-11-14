package keygate

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strings"
	"testing"
	"time"
)

type transport func(*http.Request) (*http.Response, error)

func (f transport) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }
func TestSignedContract(t *testing.T) {
	raw, e := os.ReadFile("../fixtures/contract.json")
	if e != nil {
		t.Fatal(e)
	}
	var fixture struct {
		AppID       string `json:"appId"`
		Environment string
		DeviceID    string `json:"deviceId"`
		APIURL      string `json:"apiUrl"`
		Now         int64
		JWKS        json.RawMessage
		Response    struct {
			Token string `json:"token"`
		}
		WrongEnvironment string
	}
	if e = json.Unmarshal(raw, &fixture); e != nil {
		t.Fatal(e)
	}
	now := time.UnixMilli(fixture.Now)
	offline := false
	c, e := New(fixture.AppID, fixture.Environment, fixture.APIURL, &MemoryStorage{}, fixture.DeviceID)
	if e != nil {
		t.Fatal(e)
	}
	c.Clock = func() time.Time { return now }
	c.HTTP = &http.Client{Transport: transport(func(r *http.Request) (*http.Response, error) {
		if offline {
			return nil, ErrNetwork
		}
		body := string(fixture.JWKS)
		if !strings.HasSuffix(r.URL.Path, "public-key") {
			b, _ := json.Marshal(fixture.Response)
			body = string(b)
		}
		return &http.Response{StatusCode: 200, Body: io.NopCloser(strings.NewReader(body)), Header: make(http.Header)}, nil
	})}
	if _, e = c.Redeem("SYNTHETIC-CODE"); e != nil {
		t.Fatal(e)
	}
	if !c.Can("export") {
		t.Fatal("feature should unlock")
	}
	if _, e = c.VerifyToken(fixture.WrongEnvironment); e == nil {
		t.Fatal("wrong environment accepted")
	}
	offline = true
	now = now.Add(2 * time.Hour)
	if c.Can("export") {
		t.Fatal("expired feature accepted")
	}
	if _, e = c.Validate(); e != nil {
		t.Fatal(e)
	}
	if _, e = c.ValidateOnline(); e == nil {
		t.Fatal("online gate accepted offline")
	}
	for i := 0; i < 220; i++ {
		now = now.Add(-20 * time.Second)
		if c.Can("export") {
			t.Fatal("stepped rollback restored expired feature")
		}
	}
	now = time.UnixMilli(fixture.Now).Add(-time.Minute)
	if _, e = c.GetAccess(); e == nil {
		t.Fatal("rollback accepted")
	}
	now = time.UnixMilli(fixture.Now).Add(72 * time.Hour)
	if _, e = c.Validate(); e == nil {
		t.Fatal("offline deadline accepted")
	}
}
