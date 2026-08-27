import 'package:intl/intl.dart';

class AppointmentModel {
  final String id;
  final String status;
  final DateTime startAt;
  final DateTime endAt;
  final String serviceName;
  final int price;
  final String currency;
  final String staffName;
  final String customerName;
  final String customerEmail;
  final String customerPhone;
  final String? notes;

  AppointmentModel({
    required this.id,
    required this.status,
    required this.startAt,
    required this.endAt,
    required this.serviceName,
    required this.price,
    required this.currency,
    required this.staffName,
    required this.customerName,
    required this.customerEmail,
    required this.customerPhone,
    this.notes,
  });

  String get timeRangeFormatted {
    final startFmt = DateFormat('hh:mm a').format(startAt.toLocal());
    final endFmt = DateFormat('hh:mm a').format(endAt.toLocal());
    return '$startFmt - $endFmt';
  }

  String get formattedPrice {
    final rupees = (price / 100).toStringAsFixed(price % 100 == 0 ? 0 : 2);
    return '₹$rupees';
  }

  factory AppointmentModel.fromJson(Map<String, dynamic> json) {
    return AppointmentModel(
      id: json['id'] ?? '',
      status: json['status'] ?? 'CONFIRMED',
      startAt: DateTime.parse(json['startAt']),
      endAt: DateTime.parse(json['endAt']),
      serviceName: json['service']?['name'] ?? json['serviceName'] ?? 'Service',
      price: json['price'] ?? 0,
      currency: json['currency'] ?? 'INR',
      staffName: json['staff']?['name'] ?? json['staffName'] ?? 'Staff',
      customerName: json['customer']?['name'] ?? json['customerName'] ?? 'Customer',
      customerEmail: json['customer']?['email'] ?? json['customerEmail'] ?? '',
      customerPhone: json['customer']?['phone'] ?? json['customerPhone'] ?? '',
      notes: json['notes'],
    );
  }
}
