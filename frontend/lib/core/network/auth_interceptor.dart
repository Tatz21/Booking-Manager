import 'package:dio/dio.dart';
import '../storage/secure_storage_service.dart';
import '../constants/api_endpoints.dart';

class AuthInterceptor extends QueuedInterceptor {
  final Dio dio;
  final SecureStorageService storage;

  AuthInterceptor({
    required this.dio,
    required this.storage,
  });

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Public routes don't require access token
    if (options.path.startsWith('/public') ||
        options.path == ApiEndpoints.login ||
        options.path == ApiEndpoints.register ||
        options.path == ApiEndpoints.refresh) {
      return handler.next(options);
    }

    final token = await storage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    return handler.next(options);
  }

  @override
  void onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401 &&
        !err.requestOptions.path.contains('/auth/login') &&
        !err.requestOptions.path.contains('/auth/refresh')) {
      // Attempt token refresh
      final refreshToken = await storage.getRefreshToken();
      if (refreshToken != null && refreshToken.isNotEmpty) {
        try {
          final refreshResponse = await Dio(
            BaseOptions(
              baseUrl: ApiEndpoints.baseUrl,
              headers: {'Content-Type': 'application/json'},
            ),
          ).post(
            ApiEndpoints.refresh,
            data: {'refreshToken': refreshToken},
          );

          if (refreshResponse.statusCode == 200) {
            final data = refreshResponse.data['data'] ?? refreshResponse.data;
            final newAccessToken = data['accessToken'] as String;
            final newRefreshToken = data['refreshToken'] as String;

            await storage.saveTokens(
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            );

            // Retry original request with new access token
            final options = err.requestOptions;
            options.headers['Authorization'] = 'Bearer $newAccessToken';

            final response = await dio.fetch(options);
            return handler.resolve(response);
          }
        } catch (e) {
          // Token refresh failed - clear tokens
          await storage.clearAll();
        }
      }
    }

    return handler.next(err);
  }
}
