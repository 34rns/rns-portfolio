import Foundation
import XCTest
@testable import KeyGate

private final class Memory: Storage, @unchecked Sendable {
    private let lock = NSLock(); private var value: StoredAccess?
    func read() -> StoredAccess? { lock.lock(); defer { lock.unlock() }; return value }
    func write(_ state: StoredAccess) { lock.lock(); defer { lock.unlock() }; value = state }
}
final class ContractTests: XCTestCase {
    func testSignedScopeAndFeature() async throws {
        let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().appendingPathComponent("../../../fixtures/contract.json")
        let fixture = try JSONSerialization.jsonObject(with: Data(contentsOf: root)) as! [String: Any]
        let jwks = try JSONSerialization.data(withJSONObject: fixture["jwks"]!)
        let response = try JSONSerialization.data(withJSONObject: fixture["response"]!)
        let now = Date(timeIntervalSince1970: (fixture["now"] as! Double) / 1000)
        let vault = Memory(); vault.write(StoredAccess(deviceId: fixture["deviceId"] as! String, lastSeen: now.timeIntervalSince1970))
        let client = try KeyGateClient(appId: fixture["appId"] as! String, environment: "sandbox", apiUrl: URL(string: fixture["apiUrl"] as! String)!, storage: vault, clock: { now }, transport: { request in (request.url!.path.hasSuffix("public-key") ? jwks : response, 200) })
        _ = try await client.redeem("SYNTHETIC-CODE")
        let unlocked = await client.can("export"); XCTAssertTrue(unlocked)
        // Exercise the watermark when this prepared SDK runs on macOS.
        var watermark = vault.read()!; watermark.lastSeen = now.timeIntervalSince1970 + 20; vault.write(watermark)
        _ = try await client.getAccess()
        XCTAssertEqual(vault.read()!.lastSeen, watermark.lastSeen)
        do { _ = try await client.verifyToken(fixture["wrongEnvironment"] as! String); XCTFail("Wrong environment accepted") } catch let error as KeyGateError { XCTAssertEqual(error.code, "invalid_token") }
        var state = vault.read()!; state.lastSeen = now.timeIntervalSince1970 + 60; vault.write(state)
        let rollback = await client.can("export"); XCTAssertFalse(rollback)
    }
}
