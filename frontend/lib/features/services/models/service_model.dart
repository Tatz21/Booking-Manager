class ServiceModel {
  final String id;
  final String name;
  final String? description;
  final int durationMinutes;
  final int price; // In minor units (paise: ₹199 = 19900)
  final String currency;
  final bool isActive;

  ServiceModel({
    required this.id,
    required this.name,
    this.description,
    required this.durationMinutes,
    required this.price,
    required this.currency,
    required this.isActive,
  });

  String get formattedPrice {
    final rupees = (price / 100).toStringAsFixed(price % 100 == 0 ? 0 : 2);
    return '₹$rupees';
  }

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    return ServiceModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      durationMinutes: json['durationMinutes'] ?? 30,
      price: json['price'] ?? 0,
      currency: json['currency'] ?? 'INR',
      isActive: json['isActive'] ?? true,
    );
  }
}
