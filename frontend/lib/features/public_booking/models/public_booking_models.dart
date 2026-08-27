class PublicBusinessModel {
  final String name;
  final String slug;
  final String? type;
  final String? description;
  final String? phone;
  final String? email;
  final String? location;
  final String timezone;
  final String currency;
  final String? logoUrl;
  final String primaryColor;
  final String secondaryColor;
  final String? customDomain;
  final String? tagline;
  final String? bannerUrl;

  PublicBusinessModel({
    required this.name,
    required this.slug,
    this.type,
    this.description,
    this.phone,
    this.email,
    this.location,
    required this.timezone,
    required this.currency,
    this.logoUrl,
    this.primaryColor = '#4F46E5',
    this.secondaryColor = '#6366F1',
    this.customDomain,
    this.tagline,
    this.bannerUrl,
  });

  factory PublicBusinessModel.fromJson(Map<String, dynamic> json) {
    return PublicBusinessModel(
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      type: json['type'],
      description: json['description'],
      phone: json['phone'],
      email: json['email'],
      location: json['location'],
      timezone: json['timezone'] ?? 'Asia/Kolkata',
      currency: json['currency'] ?? 'INR',
      logoUrl: json['logoUrl'],
      primaryColor: json['primaryColor'] ?? '#4F46E5',
      secondaryColor: json['secondaryColor'] ?? '#6366F1',
      customDomain: json['customDomain'],
      tagline: json['tagline'],
      bannerUrl: json['bannerUrl'],
    );
  }
}

class PublicSlotModel {
  final DateTime startAt;
  final DateTime endAt;
  final String? staffId;

  PublicSlotModel({
    required this.startAt,
    required this.endAt,
    this.staffId,
  });

  factory PublicSlotModel.fromJson(Map<String, dynamic> json) {
    return PublicSlotModel(
      startAt: DateTime.parse(json['startAt']),
      endAt: DateTime.parse(json['endAt']),
      staffId: json['staffId'],
    );
  }
}
