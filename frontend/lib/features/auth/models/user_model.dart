class UserModel {
  final String id;
  final String email;
  final String name;
  final String? phone;
  final String businessId;
  final String businessName;
  final String businessSlug;
  final String role;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.phone,
    required this.businessId,
    required this.businessName,
    required this.businessSlug,
    required this.role,
  });

  factory UserModel.fromJson(Map<String, dynamic> json, [Map<String, dynamic>? businessJson]) {
    final biz = businessJson ??
        (json['business'] is Map<String, dynamic>
            ? json['business']
            : json['business'] is Map
                ? Map<String, dynamic>.from(json['business'])
                : null);

    return UserModel(
      id: json['id']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      phone: json['phone']?.toString(),
      businessId: json['businessId']?.toString() ?? biz?['id']?.toString() ?? '',
      businessName: json['businessName']?.toString() ?? biz?['name']?.toString() ?? '',
      businessSlug: json['businessSlug']?.toString() ?? biz?['slug']?.toString() ?? '',
      role: json['role']?.toString() ?? 'OWNER',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'phone': phone,
      'businessId': businessId,
      'businessName': businessName,
      'businessSlug': businessSlug,
      'role': role,
    };
  }
}
