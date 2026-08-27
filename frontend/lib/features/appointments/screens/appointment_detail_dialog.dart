import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../models/appointment_model.dart';
import '../providers/appointments_provider.dart';

class AppointmentDetailDialog extends ConsumerWidget {
  final AppointmentModel appointment;

  const AppointmentDetailDialog({super.key, required this.appointment});

  void _showCancelModal(BuildContext context, WidgetRef ref) {
    final reasonCtrl = TextEditingController(text: 'Customer requested cancellation');

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('Cancel Appointment'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Please state a cancellation reason (will be logged and sent to customer):'),
              const SizedBox(height: 12),
              TextField(
                controller: reasonCtrl,
                decoration: const InputDecoration(hintText: 'Reason for cancellation'),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Back')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
              onPressed: () async {
                await ref.read(appointmentActionProvider.notifier).cancelAppointment(
                      appointment.id,
                      reasonCtrl.text,
                    );
                if (ctx.mounted) Navigator.pop(ctx); // Close cancel dialog
                if (context.mounted) Navigator.pop(context); // Close detail dialog
              },
              child: const Text('Confirm Cancellation'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dateStr = DateFormat('EEEE, MMMM d, yyyy').format(appointment.startAt.toLocal());

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  appointment.serviceName,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                ),
                _buildStatusBadge(appointment.status),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(color: AppColors.border),
            const SizedBox(height: 12),

            _buildDetailRow(Icons.calendar_today_rounded, 'Date', dateStr),
            const SizedBox(height: 8),
            _buildDetailRow(Icons.access_time_rounded, 'Time', appointment.timeRangeFormatted),
            const SizedBox(height: 8),
            _buildDetailRow(Icons.person_outline_rounded, 'Specialist', appointment.staffName),
            const SizedBox(height: 8),
            _buildDetailRow(Icons.currency_rupee_rounded, 'Price', appointment.formattedPrice),
            const SizedBox(height: 16),

            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Customer Contact', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppColors.textSecondary)),
                  const SizedBox(height: 4),
                  Text(appointment.customerName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 2),
                  Text('📞 ${appointment.customerPhone}', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  if (appointment.customerEmail.isNotEmpty)
                    Text('✉️ ${appointment.customerEmail}', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                ],
              ),
            ),

            if (appointment.notes != null && appointment.notes!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text('Notes: ${appointment.notes}', style: const TextStyle(fontStyle: FontStyle.italic, fontSize: 13, color: AppColors.textSecondary)),
            ],

            const SizedBox(height: 24),
            Row(
              children: [
                if (appointment.status == 'CONFIRMED' || appointment.status == 'PENDING') ...[
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.error,
                        side: const BorderSide(color: AppColors.error),
                      ),
                      onPressed: () => _showCancelModal(context, ref),
                      child: const Text('Cancel Booking'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.success),
                      onPressed: () async {
                        await ref.read(appointmentActionProvider.notifier).updateStatus(
                              appointment.id,
                              'COMPLETED',
                            );
                        if (context.mounted) Navigator.pop(context);
                      },
                      child: const Text('Complete'),
                    ),
                  ),
                ] else ...[
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Close'),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.textSecondary),
        const SizedBox(width: 8),
        Text('$label: ', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
          ),
        ),
      ],
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bg;
    Color fg;

    switch (status) {
      case 'CONFIRMED':
        bg = AppColors.success.withOpacity(0.12);
        fg = AppColors.success;
        break;
      case 'COMPLETED':
        bg = AppColors.primary.withOpacity(0.12);
        fg = AppColors.primary;
        break;
      case 'CANCELLED':
        bg = AppColors.error.withOpacity(0.12);
        fg = AppColors.error;
        break;
      default:
        bg = AppColors.warning.withOpacity(0.12);
        fg = AppColors.warning;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
      child: Text(status, style: TextStyle(color: fg, fontWeight: FontWeight.bold, fontSize: 11)),
    );
  }
}
