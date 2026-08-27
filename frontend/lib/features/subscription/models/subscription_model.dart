class SubscriptionModel {
  final String businessId;
  final String plan;
  final String status;
  final DateTime trialStart;
  final DateTime trialEnd;
  final DateTime? currentPeriodEnd;
  final bool isTrialActive;
  final bool isSubscriptionActive;
  final bool canAccessPlatform;
  final int daysRemaining;
  final int priceInr;

  SubscriptionModel({
    required this.businessId,
    required this.plan,
    required this.status,
    required this.trialStart,
    required this.trialEnd,
    this.currentPeriodEnd,
    required this.isTrialActive,
    required this.isSubscriptionActive,
    required this.canAccessPlatform,
    required this.daysRemaining,
    required this.priceInr,
  });

  factory SubscriptionModel.fromJson(Map<String, dynamic> json) {
    return SubscriptionModel(
      businessId: json['businessId'] ?? '',
      plan: json['plan'] ?? 'MONTHLY_STANDARD',
      status: json['status'] ?? 'TRIALING',
      trialStart: DateTime.parse(json['trialStart']),
      trialEnd: DateTime.parse(json['trialEnd']),
      currentPeriodEnd: json['currentPeriodEnd'] != null
          ? DateTime.parse(json['currentPeriodEnd'])
          : null,
      isTrialActive: json['isTrialActive'] ?? false,
      isSubscriptionActive: json['isSubscriptionActive'] ?? false,
      canAccessPlatform: json['canAccessPlatform'] ?? true,
      daysRemaining: json['daysRemaining'] ?? 0,
      priceInr: json['priceInr'] ?? 199,
    );
  }
}
