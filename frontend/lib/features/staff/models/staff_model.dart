class StaffModel {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String? roleTitle;
  final bool isActive;
  final List<String> assignedServiceIds;

  StaffModel({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.roleTitle,
    required this.isActive,
    required this.assignedServiceIds,
  });

  factory StaffModel.fromJson(Map<String, dynamic> json) {
    final staffServices = json['staffServices'] as List? ?? [];
    final serviceIds = staffServices
        .map((s) => s['serviceId']?.toString() ?? s['service']?['id']?.toString() ?? '')
        .where((id) => id.isNotEmpty)
        .toList();

    return StaffModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'],
      phone: json['phone'],
      roleTitle: json['roleTitle'] ?? 'Staff Specialist',
      isActive: json['isActive'] ?? true,
      assignedServiceIds: serviceIds,
    );
  }
}
