import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:rns_keygate/keygate.dart';

// Source example: add flutter_secure_storage and verify on your target device.
Storage appStorage(String appId) {
  const vault = FlutterSecureStorage();
  final key = 'keygate-$appId';
  return VaultStorage(() => vault.read(key: key), (state) => vault.write(key: key, value: state));
}
