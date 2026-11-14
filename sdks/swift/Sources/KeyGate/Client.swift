import Foundation
import CryptoKit

public struct KeyGateError: Error { public let code: String; public init(_ code: String) { self.code = code } }
public struct StoredAccess: Codable, Sendable {
    public var deviceId: String
    public var token: String?
    public var activationKey: String?
    public var lastSeen: Double
    public init(deviceId: String, token: String? = nil, activationKey: String? = nil, lastSeen: Double) { self.deviceId = deviceId; self.token = token; self.activationKey = activationKey; self.lastSeen = lastSeen }
}
public protocol Storage: Sendable { func read() throws -> StoredAccess?; func write(_ state: StoredAccess) throws }
public struct Feature: Codable, Sendable { public let key: String; public let expiresAt: String? }
public struct Access: Sendable { public let licenseId: String; public let planKey: String; public let features: [Feature] }
private struct Header: Decodable { let alg: String; let typ: String; let kid: String }
private struct Key: Decodable { let kid: String; let kty: String; let crv: String; let x: String }
private struct KeySet: Decodable { let keys: [Key] }
private struct Claims: Decodable {
    let v: String; let iss: String; let aud: String; let env: String; let kid: String; let sub: String; let dev: String
    let plan: String; let features: [Feature]; let iat: Int; let exp: Int; let offline_until: Int; let rev: Int
}
private struct Result: Decodable { let token: String; let activationKey: String? }

public actor KeyGateClient {
    public typealias Transport = @Sendable (URLRequest) async throws -> (Data, Int)
    private let appId: String, environment: String, apiUrl: URL, issuer: String
    private let storage: any Storage
    private let clock: @Sendable () -> Date
    private let transport: Transport
    private var keys: [Key] = []
    private let decoder = JSONDecoder()
    public init(appId: String, environment: String, apiUrl: URL, storage: any Storage, issuer: String? = nil, clock: @escaping @Sendable () -> Date = { Date() }, transport: Transport? = nil) throws {
        guard UUID(uuidString: appId) != nil, ["sandbox", "live"].contains(environment), ["http", "https"].contains(apiUrl.scheme) else { throw KeyGateError("invalid_configuration") }
        self.appId = appId; self.environment = environment; self.apiUrl = apiUrl; self.storage = storage; self.clock = clock
        self.issuer = issuer ?? apiUrl.absoluteString.replacingOccurrences(of: #"/(api/)?v1/?$"#, with: "", options: .regularExpression)
        self.transport = transport ?? { request in
            do { let (data, response) = try await URLSession.shared.data(for: request); return (data, (response as? HTTPURLResponse)?.statusCode ?? 0) }
            catch { throw KeyGateError("network_unavailable") }
        }
    }
    private func write(_ state: StoredAccess) throws { do { try storage.write(state) } catch { throw KeyGateError("storage_unavailable") } }
    private func read() throws -> StoredAccess {
        do {
            if let state = try storage.read() {
                guard state.deviceId.count >= 8, state.lastSeen.isFinite else { throw KeyGateError("storage_unavailable") }
                guard clock().timeIntervalSince1970 >= state.lastSeen - 30 else { throw KeyGateError("clock_rollback") }
                return state
            }
            let state = StoredAccess(deviceId: UUID().uuidString, lastSeen: clock().timeIntervalSince1970); try write(state); return state
        } catch let error as KeyGateError { throw error } catch { throw KeyGateError("storage_unavailable") }
    }
    private func decode(_ text: String) throws -> Data {
        guard !text.isEmpty, text.range(of: #"^[A-Za-z0-9_-]+$"#, options: .regularExpression) != nil else { throw KeyGateError("invalid_token") }
        let normalized = text.replacingOccurrences(of: "-", with: "+").replacingOccurrences(of: "_", with: "/")
        guard let bytes = Data(base64Encoded: normalized + String(repeating: "=", count: (4 - normalized.count % 4) % 4)) else { throw KeyGateError("invalid_token") }; return bytes
    }
    private func fetchKeys() async throws {
        var request = URLRequest(url: apiUrl.appendingPathComponent("public-key")); request.timeoutInterval = 10
        let (data, status) = try await transport(request)
        guard status == 200, data.count <= 100000 else { throw KeyGateError("invalid_key") }
        keys = try decoder.decode(KeySet.self, from: data).keys
        guard keys.count <= 10 else { throw KeyGateError("invalid_key") }
    }
    public func verifyToken(_ token: String) async throws -> Access {
        do {
            let state = try read(), parts = token.split(separator: ".", omittingEmptySubsequences: false).map(String.init)
            guard token.count <= 16000, parts.count == 3 else { throw KeyGateError("invalid_token") }
            let header = try decoder.decode(Header.self, from: decode(parts[0]))
            guard header.alg == "EdDSA", header.typ == "JWT" else { throw KeyGateError("invalid_token") }
            if !keys.contains(where: { $0.kid == header.kid }) { try await fetchKeys() }
            guard let key = keys.first(where: { $0.kid == header.kid }), key.kty == "OKP", key.crv == "Ed25519" else { throw KeyGateError("invalid_token") }
            let publicKey = try Curve25519.Signing.PublicKey(rawRepresentation: decode(key.x))
            guard publicKey.isValidSignature(try decode(parts[2]), for: Data((parts[0] + "." + parts[1]).utf8)) else { throw KeyGateError("invalid_token") }
            let claims = try decoder.decode(Claims.self, from: decode(parts[1])), now = Int(clock().timeIntervalSince1970)
            let fingerprint = Data(SHA256.hash(data: Data(state.deviceId.utf8))).base64EncodedString().replacingOccurrences(of: "+", with: "-").replacingOccurrences(of: "/", with: "_").replacingOccurrences(of: "=", with: "").prefix(22)
            guard claims.v == "keygate.v1", claims.iss == issuer, claims.aud == appId, claims.env == environment, claims.kid == key.kid, claims.dev == fingerprint, UUID(uuidString: claims.sub) != nil, claims.rev >= 1, claims.iat >= 0, claims.iat <= now + 30, claims.exp == claims.offline_until, claims.exp >= claims.iat, claims.features.count <= 100, claims.plan.range(of: #"^[a-z][a-z0-9_-]{0,63}$"#, options: .regularExpression) != nil else { throw KeyGateError("invalid_token") }
            guard now < claims.exp else { throw KeyGateError("expired") }
            let iso = ISO8601DateFormatter(); iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            var features: [Feature] = []
            for feature in claims.features {
                guard feature.key.range(of: #"^[a-z][a-z0-9_-]{0,63}$"#, options: .regularExpression) != nil else { throw KeyGateError("invalid_token") }
                if let expiry = feature.expiresAt { guard let date = iso.date(from: expiry) else { throw KeyGateError("invalid_token") }; if date > clock() { features.append(feature) } } else { features.append(feature) }
            }
            return Access(licenseId: claims.sub, planKey: claims.plan, features: features)
        } catch let error as KeyGateError { throw error } catch { throw KeyGateError("invalid_token") }
    }
    private func post(_ path: String, _ fields: [String: String], idempotency: String? = nil) async throws -> Data {
        let state = try read(); var body = fields; body["app_id"] = appId; body["environment"] = environment; body["device_id"] = state.deviceId
        var request = URLRequest(url: apiUrl.appendingPathComponent(path)); request.httpMethod = "POST"; request.timeoutInterval = 10
        request.setValue("application/json", forHTTPHeaderField: "Content-Type"); request.setValue(idempotency, forHTTPHeaderField: "Idempotency-Key"); request.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (data, status) = try await transport(request)
        guard (200..<300).contains(status) else { var locked = try read(); locked.token = nil; try write(locked); let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]; throw KeyGateError(json?["code"] as? String ?? "request_failed") }
        guard data.count <= 100000 else { throw KeyGateError("invalid_response") }; return data
    }
    private func save(_ data: Data, activation: String? = nil) async throws -> Access {
        let result = try decoder.decode(Result.self, from: data), access = try await verifyToken(result.token)
        var state = try read(); state.token = result.token; state.activationKey = activation ?? result.activationKey ?? state.activationKey; state.lastSeen = max(state.lastSeen, clock().timeIntervalSince1970); try write(state); return access
    }
    public func redeem(_ code: String, idempotencyKey: String = UUID().uuidString) async throws -> Access { var fields = ["code": code]; if let key = try read().activationKey { fields["activation_key"] = key }; return try await save(post("redeem", fields, idempotency: idempotencyKey)) }
    public func activate(_ key: String) async throws -> Access { try await save(post("activate", ["activation_key": key]), activation: key) }
    public func validateOnline() async throws -> Access { guard let token = try read().token else { throw KeyGateError("locked") }; return try await save(post("validate", ["token": token])) }
    public func validate() async throws -> Access { do { return try await validateOnline() } catch let error as KeyGateError where error.code == "network_unavailable" { return try await getAccess() } }
    public func getAccess() async throws -> Access { guard let token = try read().token else { throw KeyGateError("locked") }; let access = try await verifyToken(token); var state = try read(); state.lastSeen = max(state.lastSeen, clock().timeIntervalSince1970); try write(state); return access }
    public func can(_ feature: String) async -> Bool { do { return try await getAccess().features.contains(where: { $0.key == feature }) } catch { return false } }
    public func deactivate() async throws { if let token = try read().token { _ = try await post("deactivate", ["token": token]) }; var state = try read(); state.token = nil; try write(state) }
}
