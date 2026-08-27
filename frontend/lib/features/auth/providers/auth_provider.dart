import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/secure_storage_service.dart';
import '../../../core/network/api_exception.dart';
import '../models/auth_state.dart';
import '../models/user_model.dart';

final secureStorageProvider = Provider<SecureStorageService>((ref) {
  return SecureStorageService();
});

final apiClientProvider = Provider<ApiClient>((ref) {
  final storage = ref.watch(secureStorageProvider);
  return ApiClient(storage: storage);
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  final storage = ref.watch(secureStorageProvider);
  return AuthNotifier(apiClient: apiClient, storage: storage);
});

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient apiClient;
  final SecureStorageService storage;

  AuthNotifier({
    required this.apiClient,
    required this.storage,
  }) : super(const AuthState()) {
    checkSession();
  }

  Future<void> checkSession() async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      final token = await storage.getAccessToken();
      final userJson = await storage.getUserJson();

      if (token != null && userJson != null) {
        final user = UserModel.fromJson(jsonDecode(userJson));
        state = state.copyWith(
          status: AuthStatus.authenticated,
          user: user,
        );
      } else {
        state = state.copyWith(status: AuthStatus.unauthenticated);
      }
    } catch (e) {
      state = state.copyWith(status: AuthStatus.unauthenticated);
    }
  }

  Future<bool> signIn({
    required String email,
    required String password,
  }) async {
    return login(email: email, password: password);
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      final response = await apiClient.post(
        ApiEndpoints.login,
        data: {
          'email': email.trim().toLowerCase(),
          'password': password,
        },
      );

      final accessToken = response['accessToken'] as String;
      final refreshToken = response['refreshToken'] as String;
      final userMap = response['user'] is Map ? Map<String, dynamic>.from(response['user']) : <String, dynamic>{};
      final businessMap = response['business'] is Map ? Map<String, dynamic>.from(response['business']) : null;
      final user = UserModel.fromJson(userMap, businessMap);

      await storage.saveTokens(
        accessToken: accessToken,
        refreshToken: refreshToken,
      );
      await storage.saveBusinessDetails(
        businessId: user.businessId,
        businessSlug: user.businessSlug,
      );
      await storage.saveUserJson(jsonEncode(user.toJson()));

      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: user,
      );
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: e.message,
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: 'An unexpected error occurred during login',
      );
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String businessName,
    required String businessType,
    required String email,
    required String password,
    String? phone,
  }) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      final response = await apiClient.post(
        ApiEndpoints.register,
        data: {
          'name': name.trim(),
          'businessName': businessName.trim(),
          'businessType': businessType.trim(),
          'email': email.trim().toLowerCase(),
          'password': password,
          'phone': phone?.trim(),
        },
      );

      final accessToken = response['accessToken'] as String;
      final refreshToken = response['refreshToken'] as String;
      final userMap = response['user'] is Map ? Map<String, dynamic>.from(response['user']) : <String, dynamic>{};
      final businessMap = response['business'] is Map ? Map<String, dynamic>.from(response['business']) : null;
      final user = UserModel.fromJson(userMap, businessMap);

      await storage.saveTokens(
        accessToken: accessToken,
        refreshToken: refreshToken,
      );
      await storage.saveBusinessDetails(
        businessId: user.businessId,
        businessSlug: user.businessSlug,
      );
      await storage.saveUserJson(jsonEncode(user.toJson()));

      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: user,
      );
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: e.message,
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: 'An unexpected error occurred during registration',
      );
      return false;
    }
  }

  Future<void> logout() async {
    try {
      final refreshToken = await storage.getRefreshToken();
      if (refreshToken != null) {
        await apiClient.post(
          ApiEndpoints.logout,
          data: {'refreshToken': refreshToken},
        );
      }
    } catch (_) {
      // Ignore network errors during logout
    } finally {
      await storage.clearAll();
      state = const AuthState(status: AuthStatus.unauthenticated);
    }
  }
}
