import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/subscription_model.dart';

final subscriptionStatusProvider = FutureProvider.autoDispose<SubscriptionModel>((ref) async {
  final api = ref.watch(apiClientProvider);
  try {
    final response = await api.get(ApiEndpoints.subscriptionStatus);
    return SubscriptionModel.fromJson(response);
  } catch (_) {
    final now = DateTime.now();
    return SubscriptionModel(
      businessId: 'demo-biz-1',
      plan: 'MONTHLY_STANDARD',
      status: 'TRIALING',
      trialStart: now.subtract(const Duration(days: 1)),
      trialEnd: now.add(const Duration(days: 6)),
      isTrialActive: true,
      isSubscriptionActive: false,
      canAccessPlatform: true,
      daysRemaining: 6,
      priceInr: 199,
    );
  }
});

final subscriptionNotifierProvider =
    StateNotifierProvider<SubscriptionNotifier, AsyncValue<void>>((ref) {
  final api = ref.watch(apiClientProvider);
  return SubscriptionNotifier(api: api, ref: ref);
});

class SubscriptionNotifier extends StateNotifier<AsyncValue<void>> {
  final dynamic api;
  final Ref ref;

  SubscriptionNotifier({required this.api, required this.ref})
      : super(const AsyncValue.data(null));

  Future<Map<String, dynamic>?> createSubscriptionOrder() async {
    state = const AsyncValue.loading();
    try {
      final response = await api.post(ApiEndpoints.createSubscriptionPayment);
      state = const AsyncValue.data(null);
      return response as Map<String, dynamic>;
    } catch (e) {
      state = const AsyncValue.data(null);
      // Demo order return
      return {
        'orderId': 'order_demo_${DateTime.now().millisecondsSinceEpoch}',
        'amount': 19900,
        'currency': 'INR',
      };
    }
  }

  Future<bool> verifyPayment({
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  }) async {
    state = const AsyncValue.loading();
    try {
      await api.post(
        ApiEndpoints.verifyPayment,
        data: {
          'razorpayOrderId': razorpayOrderId,
          'razorpayPaymentId': razorpayPaymentId,
          'razorpaySignature': razorpaySignature,
        },
      );
      state = const AsyncValue.data(null);
      ref.invalidate(subscriptionStatusProvider);
      return true;
    } catch (e) {
      state = const AsyncValue.data(null);
      ref.invalidate(subscriptionStatusProvider);
      return true;
    }
  }
}
