import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/features/auth/models/user_model.dart';
import 'package:frontend/features/services/models/service_model.dart';
import 'package:frontend/features/subscription/models/subscription_model.dart';

void main() {
  group('Frontend Models & Logic Unit Tests', () {
    test('UserModel fromJson maps correctly', () {
      final json = {
        'id': 'user-1',
        'email': 'owner@example.com',
        'name': 'Alex Johnson',
        'businessId': 'biz-1',
        'businessName': 'Apex Barber Studio',
        'businessSlug': 'apex-barber-studio-7a8b',
        'role': 'OWNER',
      };

      final user = UserModel.fromJson(json);
      expect(user.id, 'user-1');
      expect(user.email, 'owner@example.com');
      expect(user.businessSlug, 'apex-barber-studio-7a8b');
      expect(user.role, 'OWNER');
    });

    test('ServiceModel formats minor unit prices (paise) into INR correctly', () {
      final s1 = ServiceModel(
        id: 's-1',
        name: 'Haircut',
        durationMinutes: 30,
        price: 49900, // 49900 paise = ₹499
        currency: 'INR',
        isActive: true,
      );
      expect(s1.formattedPrice, '₹499');

      final s2 = ServiceModel(
        id: 's-2',
        name: 'Shave',
        durationMinutes: 15,
        price: 19950, // 19950 paise = ₹199.50
        currency: 'INR',
        isActive: true,
      );
      expect(s2.formattedPrice, '₹199.50');
    });

    test('SubscriptionModel evaluates trial remaining days', () {
      final now = DateTime.now();
      final sub = SubscriptionModel(
        businessId: 'biz-1',
        plan: 'MONTHLY_STANDARD',
        status: 'TRIALING',
        trialStart: now.subtract(const Duration(days: 2)),
        trialEnd: now.add(const Duration(days: 5)),
        isTrialActive: true,
        isSubscriptionActive: false,
        canAccessPlatform: true,
        daysRemaining: 5,
        priceInr: 199,
      );

      expect(sub.isTrialActive, true);
      expect(sub.daysRemaining, 5);
      expect(sub.priceInr, 199);
    });
  });
}
