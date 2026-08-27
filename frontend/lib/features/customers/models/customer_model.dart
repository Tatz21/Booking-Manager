class CustomerModel {
  final String id;
  final String name;
  final String email;
  final String phone;
  final int totalBookings;
  final String? notes;

  CustomerModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.totalBookings,
    this.notes,
  });

  factory CustomerModel.fromJson(Map<String, dynamic> json) {
    return CustomerModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      totalBookings: json['totalBookings'] ?? json['_count']?['appointments'] ?? 0,
      notes: json['notes'],
    );
  }
}
