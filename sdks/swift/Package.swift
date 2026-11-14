// swift-tools-version: 6.0
import PackageDescription
let package = Package(name: "KeyGate", platforms: [.iOS(.v15), .macOS(.v12)], products: [.library(name: "KeyGate", targets: ["KeyGate"])], targets: [.target(name: "KeyGate"), .testTarget(name: "KeyGateTests", dependencies: ["KeyGate"])])
