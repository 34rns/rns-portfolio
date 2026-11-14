import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:cryptography/cryptography.dart';
import 'package:http/http.dart' as http;

class KeyGateError implements Exception {
  final String code;
  KeyGateError(this.code);
  @override
  String toString() => code;
}

abstract interface class Storage {
  Future<Map<String, dynamic>?> read();
  Future<void> write(Map<String, dynamic> state);
}

class MemoryStorage implements Storage {
  Map<String, dynamic>? value;
  @override
  Future<Map<String, dynamic>?> read() async =>
      value == null ? null : Map.of(value!);
  @override
  Future<void> write(Map<String, dynamic> state) async {
    value = Map.of(state);
  }
}

class VaultStorage implements Storage {
  final Future<String?> Function() readText;
  final Future<void> Function(String) writeText;
  VaultStorage(this.readText, this.writeText);
  @override
  Future<Map<String, dynamic>?> read() async {
    final text = await readText();
    return text == null ? null : jsonDecode(text) as Map<String, dynamic>;
  }

  @override
  Future<void> write(Map<String, dynamic> state) =>
      writeText(jsonEncode(state));
}

class KeyGateClient {
  final String appId, environment, apiUrl;
  final Storage storage;
  final String? deviceId;
  final DateTime Function() clock;
  final http.Client httpClient;
  final Map<String, dynamic> _keys = {};
  KeyGateClient({
    required this.appId,
    required this.environment,
    required String apiUrl,
    required this.storage,
    this.deviceId,
    DateTime Function()? clock,
    http.Client? httpClient,
  }) : apiUrl = apiUrl.replaceAll(RegExp(r'/$'), ''),
       clock = clock ?? DateTime.now,
       httpClient = httpClient ?? http.Client() {
    if (!RegExp(r'^[a-f0-9-]{36}$', caseSensitive: false).hasMatch(appId) ||
        !['sandbox', 'live'].contains(environment) ||
        !['http', 'https'].contains(Uri.parse(apiUrl).scheme))
      throw KeyGateError('invalid_configuration');
  }
  String get issuer => apiUrl.replaceAll(RegExp(r'/(?:api/)?v1$'), '');
  Future<Map<String, dynamic>> _state() async {
    try {
      var state = await storage.read();
      if (state == null) {
        final random = Random.secure();
        state = {
          'deviceId':
              deviceId ??
              List.generate(
                16,
                (_) => random.nextInt(256).toRadixString(16).padLeft(2, '0'),
              ).join(),
          'token': null,
          'activationKey': null,
          'lastSeenAt': clock().millisecondsSinceEpoch,
        };
        await storage.write(state);
      }
      if (state['deviceId'] is! String ||
          state['deviceId'].length < 8 ||
          state['deviceId'].length > 256 ||
          state['lastSeenAt'] is! num)
        throw KeyGateError('storage_unavailable');
      if (clock().millisecondsSinceEpoch < state['lastSeenAt'] - 30000)
        throw KeyGateError('clock_rollback');
      return state;
    } on KeyGateError {
      rethrow;
    } catch (_) {
      throw KeyGateError('storage_unavailable');
    }
  }

  Future<void> _write(Map<String, dynamic> state) async {
    try {
      await storage.write(state);
    } catch (_) {
      throw KeyGateError('storage_unavailable');
    }
  }

  List<int> _decode(String value) {
    if (!RegExp(r'^[A-Za-z0-9_-]+$').hasMatch(value))
      throw KeyGateError('invalid_token');
    return base64Url.decode(base64Url.normalize(value));
  }

  Future<Map<String, dynamic>> _request(
    String path,
    Map<String, dynamic>? body, {
    String? idempotency,
  }) async {
    http.Response response;
    try {
      final headers = {
        'content-type': 'application/json',
        if (idempotency != null) 'idempotency-key': idempotency,
      };
      response =
          await (body == null
                  ? httpClient.get(Uri.parse('$apiUrl/$path'))
                  : httpClient.post(
                      Uri.parse('$apiUrl/$path'),
                      headers: headers,
                      body: jsonEncode(body),
                    ))
              .timeout(const Duration(seconds: 10));
    } on http.ClientException {
      throw KeyGateError('network_unavailable');
    } on TimeoutException {
      throw KeyGateError('network_unavailable');
    }
    if (response.bodyBytes.length > 32768)
      throw KeyGateError('invalid_response');
    final result = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode < 200 || response.statusCode >= 300) {
      final state = await _state();
      await _write({
        ...state,
        'token': null,
        'lastSeenAt': max(
          state['lastSeenAt'] as num,
          clock().millisecondsSinceEpoch,
        ),
      });
      throw KeyGateError(result['code'] ?? 'access_rejected');
    }
    return result;
  }

  Future<Map<String, dynamic>> verifyToken(String token) async {
    try {
      final parts = token.split('.');
      if (parts.length != 3 || token.length > 16000)
        throw KeyGateError('invalid_token');
      final head =
          jsonDecode(utf8.decode(_decode(parts[0]))) as Map<String, dynamic>;
      if (head['alg'] != 'EdDSA' ||
          head['typ'] != 'JWT' ||
          head['kid'] is! String)
        throw KeyGateError('invalid_token');
      if (!_keys.containsKey(head['kid'])) {
        final data = await _request('public-key', null);
        final keys = data['keys'] as List;
        if (keys.length > 10) throw KeyGateError('invalid_token');
        for (final key in keys) {
          _keys[key['kid']] = key;
        }
      }
      final key = _keys[head['kid']];
      if (key == null || key['kty'] != 'OKP' || key['crv'] != 'Ed25519')
        throw KeyGateError('invalid_token');
      final valid = await Ed25519().verify(
        utf8.encode('${parts[0]}.${parts[1]}'),
        signature: Signature(
          _decode(parts[2]),
          publicKey: SimplePublicKey(
            _decode(key['x']),
            type: KeyPairType.ed25519,
          ),
        ),
      );
      if (!valid) throw KeyGateError('invalid_token');
      final c =
              jsonDecode(utf8.decode(_decode(parts[1])))
                  as Map<String, dynamic>,
          state = await _state();
      final hash = await Sha256().hash(utf8.encode(state['deviceId']));
      final fingerprint = base64Url
          .encode(hash.bytes)
          .replaceAll('=', '')
          .substring(0, 22);
      final now = clock().millisecondsSinceEpoch / 1000;
      if (c['v'] != 'keygate.v1' ||
          c['iss'] != issuer ||
          c['aud'] != appId ||
          c['env'] != environment ||
          c['kid'] != head['kid'] ||
          c['dev'] != fingerprint ||
          c['sub'] is! String ||
          c['rev'] is! int ||
          c['rev'] < 1 ||
          !RegExp(r'^[a-z][a-z0-9_-]{0,63}$').hasMatch(c['plan']))
        throw KeyGateError('invalid_token');
      for (final field in ['iat', 'exp', 'offline_until', 'refresh_after']) {
        if (c[field] is! num || !(c[field] as num).isFinite)
          throw KeyGateError('invalid_token');
      }
      if (c['exp'] != c['offline_until'] ||
          c['exp'] < c['iat'] ||
          c['iat'] > now + 30 ||
          c['features'] is! List ||
          c['features'].length > 100)
        throw KeyGateError('invalid_token');
      for (final f in c['features']) {
        if (!RegExp(r'^[a-z][a-z0-9_-]{0,63}$').hasMatch(f['key']))
          throw KeyGateError('invalid_token');
        if (f['expiresAt'] != null) DateTime.parse(f['expiresAt']);
      }
      if (c['exp'] <= now) throw KeyGateError('expired');
      return c;
    } on KeyGateError {
      rethrow;
    } catch (_) {
      throw KeyGateError('invalid_token');
    }
  }

  Map<String, dynamic> _access(Map<String, dynamic> c) => {
    'licenseId': c['sub'],
    'appId': appId,
    'environment': environment,
    'planKey': c['plan'],
    'status': 'active',
    'features': (c['features'] as List)
        .where(
          (f) =>
              f['expiresAt'] == null ||
              DateTime.parse(f['expiresAt']).isAfter(clock()),
        )
        .toList(),
    'expiresAt': c['le'],
    'revision': c['rev'],
  };
  Future<Map<String, dynamic>> _post(
    String path,
    Map<String, dynamic> fields, {
    String? idempotency,
  }) async {
    final state = await _state();
    return _request(path, {
      'app_id': appId,
      'environment': environment,
      'device_id': state['deviceId'],
      ...fields,
    }, idempotency: idempotency);
  }

  Future<Map<String, dynamic>> _save(
    Map<String, dynamic> result, {
    String? activation,
  }) async {
    if (result['token'] is! String) throw KeyGateError('invalid_response');
    final claims = await verifyToken(result['token']), state = await _state();
    await _write({
      ...state,
      'token': result['token'],
      'activationKey':
          activation ?? result['activationKey'] ?? state['activationKey'],
      'lastSeenAt': max(
        state['lastSeenAt'] as num,
        clock().millisecondsSinceEpoch,
      ),
    });
    return _access(claims);
  }

  Future<Map<String, dynamic>> redeem(String code) async {
    final state = await _state(), random = Random.secure();
    return _save(
      await _post(
        'redeem',
        {
          'code': code,
          if (state['activationKey'] != null)
            'activation_key': state['activationKey'],
        },
        idempotency: List.generate(
          16,
          (_) => random.nextInt(256).toRadixString(16).padLeft(2, '0'),
        ).join(),
      ),
    );
  }

  Future<Map<String, dynamic>> activate(String key) async =>
      _save(await _post('activate', {'activation_key': key}), activation: key);
  Future<Map<String, dynamic>> validateOnline() async {
    final state = await _state();
    if (state['token'] == null) throw KeyGateError('locked');
    return _save(await _post('validate', {'token': state['token']}));
  }

  Future<Map<String, dynamic>> validate() async {
    try {
      return await validateOnline();
    } on KeyGateError catch (e) {
      if (e.code != 'network_unavailable') rethrow;
      return getAccess();
    }
  }

  Future<Map<String, dynamic>> getAccess() async {
    final state = await _state();
    if (state['token'] == null) throw KeyGateError('locked');
    final access = _access(await verifyToken(state['token']));
    await _write({
      ...state,
      'lastSeenAt': max(
        state['lastSeenAt'] as num,
        clock().millisecondsSinceEpoch,
      ),
    });
    return access;
  }

  Future<bool> can(String feature) async {
    try {
      return ((await getAccess())['features'] as List).any(
        (f) => f['key'] == feature,
      );
    } catch (_) {
      return false;
    }
  }

  Future<void> deactivate() async {
    final state = await _state();
    if (state['token'] != null)
      await _post('deactivate', {'token': state['token']});
    await _write({
      ...state,
      'token': null,
      'lastSeenAt': max(
        state['lastSeenAt'] as num,
        clock().millisecondsSinceEpoch,
      ),
    });
  }
}
