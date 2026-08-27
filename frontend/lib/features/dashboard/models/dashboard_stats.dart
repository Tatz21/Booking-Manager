class DashboardStats {
  final int todayAppointmentsCount;
  final int confirmedCount;
  final int completedCount;
  final int totalCustomersCount;
  final int totalServicesCount;
  final int totalStaffCount;
  final int estimatedRevenuePaise;

  DashboardStats({
    required this.todayAppointmentsCount,
    required this.confirmedCount,
    required this.completedCount,
    required this.totalCustomersCount,
    required this.totalServicesCount,
    required this.totalStaffCount,
    required this.estimatedRevenuePaise,
  });

  String get formattedRevenueInr {
    final rupees = (estimatedRevenuePaise / 100).toStringAsFixed(0);
    return '₹$rupees';
  }
}
