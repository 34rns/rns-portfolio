import 'dart:convert';
import 'dart:io';
import 'package:test/test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:rns_keygate/keygate.dart';

void main() {
  test(
    'server-signed fixtures enforce scope, feature, clock and offline deadlines',
    () async {
      final f =
          jsonDecode(File('../fixtures/contract.json').readAsStringSync())
              as Map<String, dynamic>;
      var now = f['now'] as int;
      var online = true;
      final transport = MockClient((request) async {
        if (!online) throw http.ClientException('offline');
        return http.Response(
          jsonEncode(
            request.url.path.endsWith('public-key') ? f['jwks'] : f['response'],
          ),
          200,
        );
      });
      final client = KeyGateClient(
        appId: f['appId'],
        environment: 'sandbox',
        apiUrl: f['apiUrl'],
        storage: MemoryStorage(),
        deviceId: f['deviceId'],
        clock: () => DateTime.fromMillisecondsSinceEpoch(now, isUtc: true),
        httpClient: transport,
      );
      await client.redeem('SYNTHETIC-CODE');
      expect(await client.can('export'), true);
      await expectLater(
        client.verifyToken(f['wrongEnvironment']),
        throwsA(isA<KeyGateError>()),
      );
      online = false;
      now += 7200000;
      expect(await client.can('export'), false);
      expect((await client.validate())['planKey'], 'pro');
      await expectLater(client.validateOnline(), throwsA(isA<KeyGateError>()));
      now = (f['now'] as int) - 60000;
      await expectLater(client.getAccess(), throwsA(isA<KeyGateError>()));
      now = (f['now'] as int) + 72 * 3600000;
      expect(await client.can('export'), false);
    },
  );
}
