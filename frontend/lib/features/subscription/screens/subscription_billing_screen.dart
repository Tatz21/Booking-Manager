import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../providers/subscription_provider.dart';

class SubscriptionBillingScreen extends ConsumerWidget {
  const SubscriptionBillingScreen({super.key});

  void _showRazorpayCheckoutModal(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Razorpay Secure Checkout', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text('Monthly Standard Plan', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                    Text('₹199 / month', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.primary)),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const Text('Includes unlimited bookings, unlimited staff, full CRM, and email notifications.'),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () async {
                  final order = await ref.read(subscriptionNotifierProvider.notifier).createSubscriptionOrder();
                  if (order != null && ctx.mounted) {
                    // Simulate client Razorpay payment checkout verification
                    final orderId = order['orderId'] as String;
                    final paymentId = 'pay_${DateTime.now().millisecondsSinceEpoch}';
                    final signature = 'simulated_client_signature';

                    final success = await ref.read(subscriptionNotifierProvider.notifier).verifyPayment(
                          razorpayOrderId: orderId,
                          razorpayPaymentId: paymentId,
                          razorpaySignature: signature,
                        );

                    if (success && context.mounted) {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Subscription activated successfully for ₹199/month!'),
                          backgroundColor: AppColors.success,
                        ),
                      );
                    }
                  }
                },
                child: const Text('Pay ₹199 via Razorpay'),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final subAsync = ref.watch(subscriptionStatusProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.go('/dashboard'),
        ),
        title: const Text('Subscription & Billing', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: subAsync.when(
        data: (sub) {
          final trialEndFmt = DateFormat('MMMM d, yyyy').format(sub.trialEnd);

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Plan Status Card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Current Subscription', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: sub.canAccessPlatform ? AppColors.success.withOpacity(0.15) : AppColors.error.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                sub.status,
                                style: TextStyle(
                                  color: sub.canAccessPlatform ? AppColors.success : AppColors.error,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          sub.isSubscriptionActive ? 'Monthly Standard Plan (Active)' : '7-Day Free Trial',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
                        ),
                        const SizedBox(height: 12),
                        const Divider(color: AppColors.border),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            const Icon(Icons.hourglass_top_rounded, color: AppColors.primary, size: 20),
                            const SizedBox(width: 8),
                            Text(
                              sub.isTrialActive
                                  ? '${sub.daysRemaining} days left in free trial (Ends $trialEndFmt)'
                                  : sub.isSubscriptionActive
                                      ? 'Active subscription renewed monthly'
                                      : 'Trial ended on $trialEndFmt',
                              style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Pricing Tier Card
                Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: const BorderSide(color: AppColors.primary, width: 2),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Standard Plan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.primaryContainer,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text('₹199 / mo', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        _buildFeatureRow('Unlimited appointments & calendar scheduling'),
                        _buildFeatureRow('Unlimited services and staff specialists'),
                        _buildFeatureRow('Customer CRM & booking history'),
                        _buildFeatureRow('Slug-based public customer booking page'),
                        _buildFeatureRow('Email confirmations & reminders'),
                        _buildFeatureRow('Transactional double-booking protection'),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () => _showRazorpayCheckoutModal(context, ref),
                          child: Text(sub.isSubscriptionActive ? 'Extend / Manage Subscription' : 'Upgrade for ₹199/month'),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error loading subscription: $err')),
      ),
    );
  }

  Widget _buildFeatureRow(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 18),
          const SizedBox(width: 10),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 14))),
        ],
      ),
    );
  }
}
