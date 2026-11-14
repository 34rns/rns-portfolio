import Foundation
import Security
import KeyGate

public struct KeychainStorage: Storage {
    let service: String
    public init(appId: String) { service = "keygate-\(appId)" }
    private var query: [String: Any] { [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service, kSecAttrAccount as String: "access"] }
    public func read() throws -> StoredAccess? {
        var request = query; request[kSecReturnData as String] = true; request[kSecMatchLimit as String] = kSecMatchLimitOne
        var value: CFTypeRef?; let status = SecItemCopyMatching(request as CFDictionary, &value)
        if status == errSecItemNotFound { return nil }
        guard status == errSecSuccess, let data = value as? Data else { throw KeyGateError("storage_unavailable") }
        return try JSONDecoder().decode(StoredAccess.self, from: data)
    }
    public func write(_ state: StoredAccess) throws {
        let data = try JSONEncoder().encode(state)
        let status = SecItemUpdate(query as CFDictionary, [kSecValueData as String: data] as CFDictionary)
        if status == errSecItemNotFound {
            var request = query; request[kSecValueData as String] = data; request[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
            guard SecItemAdd(request as CFDictionary, nil) == errSecSuccess else { throw KeyGateError("storage_unavailable") }
        } else if status != errSecSuccess { throw KeyGateError("storage_unavailable") }
    }
}
