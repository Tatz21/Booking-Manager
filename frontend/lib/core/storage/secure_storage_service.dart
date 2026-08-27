import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SecureStorageService {
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static const String _keyAccessToken = 'access_token';
  static const String _keyRefreshToken = 'refresh_token';
  static const String _keyBusinessId = 'business_id';
  static const String _keyBusinessSlug = 'business_slug';
  static const String _keyUserJson = 'user_json';

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _secureStorage.write(key: _keyAccessToken, value: accessToken);
    await _secureStorage.write(key: _keyRefreshToken, value: refreshToken);
  }

  Future<String?> getAccessToken() async {
    return await _secureStorage.read(key: _keyAccessToken);
  }

  Future<String?> getRefreshToken() async {
    return await _secureStorage.read(key: _keyRefreshToken);
  }

  Future<void> saveBusinessDetails({
    required String businessId,
    required String businessSlug,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyBusinessId, businessId);
    await prefs.setString(_keyBusinessSlug, businessSlug);
  }

  Future<String?> getBusinessId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyBusinessId);
  }

  Future<String?> getBusinessSlug() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyBusinessSlug);
  }

  Future<void> saveUserJson(String json) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUserJson, json);
  }

  Future<String?> getUserJson() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyUserJson);
  }

  Future<void> clearAll() async {
    await _secureStorage.deleteAll();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyBusinessId);
    await prefs.remove(_keyBusinessSlug);
    await prefs.remove(_keyUserJson);
  }
}
