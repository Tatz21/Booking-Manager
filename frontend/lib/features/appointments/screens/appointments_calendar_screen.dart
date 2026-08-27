import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/websocket_service.dart';
import '../providers/appointments_provider.dart';
import 'appointment_detail_dialog.dart';

class AppointmentsCalendarScreen extends ConsumerStatefulWidget {
  const AppointmentsCalendarScreen({super.key});

  @override
  ConsumerState<AppointmentsCalendarScreen> createState() => _AppointmentsCalendarScreenState();
}

class _AppointmentsCalendarScreenState extends ConsumerState<AppointmentsCalendarScreen> {
  CalendarFormat _calendarFormat = CalendarFormat.twoWeeks;
  DateTime _focusedDay = DateTime.now();

  @override
  Widget build(BuildContext context) {
    final selectedDate = ref.watch(selectedDateProvider);
    final selectedStatus = ref.watch(selectedStatusFilterProvider);
    final appointmentsAsync = ref.watch(appointmentsListProvider);

    // Live WebSockets listener: auto refresh list on new booking or status change
    ref.listen<AsyncValue<RealtimeEvent>>(realtimeEventsStreamProvider, (previous, next) {
      next.whenData((event) {
        ref.invalidate(appointmentsListProvider);
      });
    });

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.go('/dashboard'),
        ),
        title: const Text('Appointments Calendar', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.invalidate(appointmentsListProvider),
          ),
        ],
      ),
      body: Column(
        children: [
          // 1. Interactive Calendar
          Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TableCalendar(
              firstDay: DateTime.now().subtract(const Duration(days: 365)),
              lastDay: DateTime.now().add(const Duration(days: 365)),
              focusedDay: _focusedDay,
              calendarFormat: _calendarFormat,
              selectedDayPredicate: (day) => isSameDay(selectedDate, day),
              onDaySelected: (selectedDay, focusedDay) {
                setState(() {
                  _focusedDay = focusedDay;
                });
                ref.read(selectedDateProvider.notifier).state = selectedDay;
              },
              onFormatChanged: (format) {
                setState(() {
                  _calendarFormat = format;
                });
              },
              calendarStyle: const CalendarStyle(
                selectedDecoration: BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                todayDecoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  shape: BoxShape.circle,
                ),
              ),
              headerStyle: const HeaderStyle(
                formatButtonVisible: true,
                titleCentered: true,
                formatButtonShowsNext: false,
              ),
            ),
          ),

          // 2. Status Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Row(
              children: [
                _buildFilterChip('All', null, selectedStatus),
                _buildFilterChip('Confirmed', 'CONFIRMED', selectedStatus),
                _buildFilterChip('Completed', 'COMPLETED', selectedStatus),
                _buildFilterChip('Pending', 'PENDING', selectedStatus),
                _buildFilterChip('Cancelled', 'CANCELLED', selectedStatus),
              ],
            ),
          ),

          // 3. Appointments List for Selected Date
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  DateFormat('EEEE, MMM d').format(selectedDate),
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                appointmentsAsync.when(
                  data: (list) => Text('${list.length} bookings', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                  loading: () => const SizedBox.shrink(),
                  error: (_, __) => const SizedBox.shrink(),
                ),
              ],
            ),
          ),

          Expanded(
            child: appointmentsAsync.when(
              data: (appointments) {
                if (appointments.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.event_busy_outlined, size: 48, color: Colors.grey.shade400),
                        const SizedBox(height: 12),
                        const Text('No Appointments Scheduled', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        const SizedBox(height: 4),
                        const Text('There are no bookings for this date.', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: appointments.length,
                  itemBuilder: (context, index) {
                    final app = appointments[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 10),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(16),
                        onTap: () {
                          showDialog(
                            context: context,
                            builder: (_) => AppointmentDetailDialog(appointment: app),
                          );
                        },
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    DateFormat('hh:mm a').format(app.startAt.toLocal()),
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.primary),
                                  ),
                                  Text(
                                    DateFormat('hh:mm a').format(app.endAt.toLocal()),
                                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                  ),
                                ],
                              ),
                              const SizedBox(width: 16),
                              Container(width: 2, height: 40, color: AppColors.border),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      app.serviceName,
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${app.customerName} • with ${app.staffName}',
                                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                                    ),
                                  ],
                                ),
                              ),
                              _buildStatusDot(app.status),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, _) => Center(child: Text('Error loading appointments: $err')),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String? value, String? currentSelected) {
    final isSelected = currentSelected == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        selectedColor: AppColors.primary.withOpacity(0.15),
        checkmarkColor: AppColors.primary,
        labelStyle: TextStyle(
          color: isSelected ? AppColors.primary : AppColors.textPrimary,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          fontSize: 13,
        ),
        onSelected: (_) {
          ref.read(selectedStatusFilterProvider.notifier).state = value;
        },
      ),
    );
  }

  Widget _buildStatusDot(String status) {
    Color color = AppColors.warning;
    if (status == 'CONFIRMED') color = AppColors.success;
    if (status == 'COMPLETED') color = AppColors.primary;
    if (status == 'CANCELLED') color = AppColors.error;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        status,
        style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold),
      ),
    );
  }
}
