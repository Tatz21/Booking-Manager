import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/calendar_export_helper.dart';
import '../../services/models/service_model.dart';
import '../../staff/models/staff_model.dart';
import '../models/public_booking_models.dart';
import '../providers/public_booking_provider.dart';

class PublicBookingScreen extends ConsumerStatefulWidget {
  final String slug;

  const PublicBookingScreen({super.key, required this.slug});

  @override
  ConsumerState<PublicBookingScreen> createState() => _PublicBookingScreenState();
}

class _PublicBookingScreenState extends ConsumerState<PublicBookingScreen> {
  int _currentStep = 0;

  ServiceModel? _selectedService;
  StaffModel? _selectedStaff;
  DateTime _selectedDate = DateTime.now();
  PublicSlotModel? _selectedSlot;

  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  String _selectedPaymentMethod = 'VENUE';

  Map<String, dynamic>? _bookingConfirmation;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleConfirmBooking() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedService == null || _selectedSlot == null) return;

    final staffId = _selectedSlot!.staffId ?? _selectedStaff?.id;
    if (staffId == null) return;

    final confirmation = await ref.read(publicBookingActionProvider.notifier).bookAppointment(
          slug: widget.slug,
          serviceId: _selectedService!.id,
          staffId: staffId,
          startAt: _selectedSlot!.startAt.toUtc().toIso8601String(),
          customerName: _nameCtrl.text,
          customerEmail: _emailCtrl.text,
          customerPhone: _phoneCtrl.text,
          notes: _notesCtrl.text.isNotEmpty ? _notesCtrl.text : null,
        );

    if (confirmation != null && mounted) {
      setState(() {
        _bookingConfirmation = confirmation;
        _currentStep = 4; // Confirmation view
      });
    }
  }

  Color _parseHex(String hex) {
    try {
      final buffer = StringBuffer();
      if (hex.length == 6 || hex.length == 7) buffer.write('ff');
      buffer.write(hex.replaceFirst('#', ''));
      return Color(int.parse(buffer.toString(), radix: 16));
    } catch (_) {
      return AppColors.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final businessAsync = ref.watch(publicBusinessProvider(widget.slug));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: businessAsync.when(
          data: (biz) => Text(biz.name, style: const TextStyle(fontWeight: FontWeight.bold)),
          loading: () => const Text('Booking Portal'),
          error: (_, __) => const Text('Booking Portal'),
        ),
      ),
      body: businessAsync.when(
        data: (biz) {
          final brandColor = _parseHex(biz.primaryColor);

          if (_bookingConfirmation != null) {
            return _buildConfirmationView(biz, brandColor);
          }

          return Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 680),
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Business Header Info with custom logo/tagline
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: brandColor.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(Icons.storefront_rounded, color: brandColor, size: 28),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(biz.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                                  if (biz.tagline != null && biz.tagline!.isNotEmpty)
                                    Text(biz.tagline!, style: TextStyle(color: brandColor, fontWeight: FontWeight.w600, fontSize: 12)),
                                  if (biz.location != null)
                                    Text(biz.location!, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                                  Text('Timezone: ${biz.timezone}', style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        const Divider(color: AppColors.border),
                        const SizedBox(height: 16),

                        // Step Indicator
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildStepChip(0, '1. Service', Icons.content_cut_rounded, brandColor),
                            _buildStepChip(1, '2. Specialist', Icons.person_rounded, brandColor),
                            _buildStepChip(2, '3. Time Slot', Icons.schedule_rounded, brandColor),
                            _buildStepChip(3, '4. Details', Icons.contact_mail_rounded, brandColor),
                          ],
                        ),
                        const SizedBox(height: 24),

                        // Step Content
                        if (_currentStep == 0) _buildServiceStep(biz, brandColor),
                        if (_currentStep == 1) _buildStaffStep(biz, brandColor),
                        if (_currentStep == 2) _buildSlotStep(biz, brandColor),
                        if (_currentStep == 3) _buildContactStep(biz, brandColor),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.search_off_rounded, size: 64, color: Colors.grey),
              const SizedBox(height: 16),
              const Text('Booking Page Not Found', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text('Slug "${widget.slug}" does not exist.', style: const TextStyle(color: AppColors.textSecondary)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepChip(int stepIndex, String title, IconData icon, Color brandColor) {
    final isActive = _currentStep == stepIndex;
    final isDone = _currentStep > stepIndex;

    return Column(
      children: [
        CircleAvatar(
          radius: 16,
          backgroundColor: isDone
              ? AppColors.success
              : isActive
                  ? brandColor
                  : AppColors.surfaceVariant,
          child: Icon(
            isDone ? Icons.check_rounded : icon,
            size: 16,
            color: isDone || isActive ? Colors.white : AppColors.textMuted,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          title,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            color: isActive ? brandColor : AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildServiceStep(PublicBusinessModel biz, Color brandColor) {
    final servicesAsync = ref.watch(publicServicesProvider(widget.slug));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Select a Service', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 12),
        servicesAsync.when(
          data: (services) {
            if (services.isEmpty) return const Text('No services available at this time.');
            return ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: services.length,
              itemBuilder: (context, index) {
                final s = services[index];
                final isSelected = _selectedService?.id == s.id;
                return Card(
                  color: isSelected ? brandColor.withValues(alpha: 0.15) : AppColors.surfaceElevated,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(
                      color: isSelected ? brandColor : AppColors.border,
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                    title: Text(
                      s.name,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary),
                    ),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        '${s.durationMinutes} min • ${s.description ?? ''}',
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                    ),
                    trailing: Text(
                      s.formattedPrice,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: AppColors.success),
                    ),
                    onTap: () {
                      setState(() {
                        _selectedService = s;
                        _currentStep = 1;
                      });
                    },
                  ),
                );
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, _) => Text('Error loading services: $err'),
        ),
      ],
    );
  }

  Widget _buildStaffStep(PublicBusinessModel biz, Color brandColor) {
    final staffAsync = ref.watch(publicStaffProvider(widget.slug));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Choose a Specialist', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            TextButton(
              onPressed: () => setState(() => _currentStep = 0),
              child: Text('Change Service', style: TextStyle(color: brandColor)),
            ),
          ],
        ),
        const SizedBox(height: 12),
        staffAsync.when(
          data: (staffList) {
            final eligibleStaff = staffList.where((s) =>
                s.assignedServiceIds.isEmpty ||
                (_selectedService != null && s.assignedServiceIds.contains(_selectedService!.id))).toList();

            return Column(
              children: [
                // Option: Any Available Specialist
                Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: AppColors.border),
                  ),
                  margin: const EdgeInsets.only(bottom: 10),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: brandColor.withOpacity(0.12),
                      child: Icon(Icons.bolt_rounded, color: brandColor),
                    ),
                    title: const Text('Any Available Specialist', style: TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: const Text('Automatically assigns first open slot'),
                    onTap: () {
                      setState(() {
                        _selectedStaff = null;
                        _currentStep = 2;
                      });
                    },
                  ),
                ),
                ...eligibleStaff.map((staff) {
                  return Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: const BorderSide(color: AppColors.border),
                    ),
                    margin: const EdgeInsets.only(bottom: 10),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: brandColor.withOpacity(0.12),
                        child: Text(staff.name[0], style: TextStyle(fontWeight: FontWeight.bold, color: brandColor)),
                      ),
                      title: Text(staff.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text(staff.roleTitle ?? 'Specialist'),
                      onTap: () {
                        setState(() {
                          _selectedStaff = staff;
                          _currentStep = 2;
                        });
                      },
                    ),
                  );
                }),
              ],
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, _) => Text('Error loading staff: $err'),
        ),
      ],
    );
  }

  Widget _buildSlotStep(PublicBusinessModel biz, Color brandColor) {
    final dateStr = _selectedDate.toIso8601String().split('T')[0];
    final params = AvailabilityQueryParams(
      slug: widget.slug,
      date: dateStr,
      serviceId: _selectedService?.id ?? '',
      staffId: _selectedStaff?.id,
    );

    final slotsAsync = ref.watch(publicSlotsProvider(params));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Pick Date & Time', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            TextButton(
              onPressed: () => setState(() => _currentStep = 1),
              child: Text('Change Specialist', style: TextStyle(color: brandColor)),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Date selection chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: List.generate(7, (i) {
              final date = DateTime.now().add(Duration(days: i));
              final isSelected = DateFormat('yyyy-MM-dd').format(date) == dateStr;

              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Column(
                    children: [
                      Text(DateFormat('E').format(date), style: const TextStyle(fontSize: 11)),
                      Text(DateFormat('d MMM').format(date), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    ],
                  ),
                  selected: isSelected,
                  selectedColor: brandColor.withOpacity(0.15),
                  onSelected: (selected) {
                    if (selected) {
                      setState(() {
                        _selectedDate = date;
                        _selectedSlot = null;
                      });
                    }
                  },
                ),
              );
            }),
          ),
        ),
        const SizedBox(height: 20),

        const Text('Available Time Slots', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
        const SizedBox(height: 10),

        slotsAsync.when(
          data: (slots) {
            if (slots.isEmpty) {
              return Container(
                padding: const EdgeInsets.all(20),
                alignment: Alignment.center,
                child: const Text('No slots available on this date. Please select another date.', style: TextStyle(color: AppColors.textSecondary)),
              );
            }

            return Wrap(
              spacing: 8,
              runSpacing: 8,
              children: slots.map((slot) {
                final timeFmt = DateFormat('hh:mm a').format(slot.startAt.toLocal());
                final isSelected = _selectedSlot?.startAt == slot.startAt;

                return ChoiceChip(
                  label: Text(timeFmt),
                  selected: isSelected,
                  selectedColor: brandColor,
                  labelStyle: TextStyle(color: isSelected ? Colors.white : AppColors.textPrimary, fontWeight: FontWeight.bold),
                  onSelected: (val) {
                    if (val) {
                      setState(() {
                        _selectedSlot = slot;
                        _currentStep = 3;
                      });
                    }
                  },
                );
              }).toList(),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, _) => Text('Error loading slots: $err'),
        ),
      ],
    );
  }

  Widget _buildContactStep(PublicBusinessModel biz, Color brandColor) {
    final slotFmt = _selectedSlot != null
        ? '${DateFormat('EEEE, MMMM d').format(_selectedSlot!.startAt.toLocal())} at ${DateFormat('hh:mm a').format(_selectedSlot!.startAt.toLocal())}'
        : '';

    final bookingAction = ref.watch(publicBookingActionProvider);
    final isLoading = bookingAction.isLoading;

    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Your Contact Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              TextButton(
                onPressed: () => setState(() => _currentStep = 2),
                child: Text('Change Time', style: TextStyle(color: brandColor)),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Booking Summary Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(_selectedService?.name ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    Text(_selectedService?.formattedPrice ?? '', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.success, fontSize: 15)),
                  ],
                ),
                const SizedBox(height: 4),
                Text('🕒 $slotFmt', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                if (_selectedStaff != null)
                  Text('👤 Specialist: ${_selectedStaff!.name}', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
              ],
            ),
          ),
          const SizedBox(height: 20),

          const Text('Your Full Name *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
          const SizedBox(height: 6),
          TextFormField(
            controller: _nameCtrl,
            decoration: const InputDecoration(hintText: 'e.g. Alex Johnson'),
            validator: (v) => v == null || v.trim().isEmpty ? 'Please enter your name' : null,
          ),
          const SizedBox(height: 14),

          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Email Address *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _emailCtrl,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(hintText: 'alex@example.com'),
                      validator: (v) => v != null && v.contains('@') ? null : 'Valid email required',
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Phone Number *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _phoneCtrl,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(hintText: '+91 9876543210'),
                      validator: (v) => v == null || v.trim().length < 8 ? 'Valid phone required' : null,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          const Text('Special Notes / Requests', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
          const SizedBox(height: 6),
          TextFormField(
            controller: _notesCtrl,
            maxLines: 2,
            decoration: const InputDecoration(hintText: 'Any special requests or instructions'),
          ),
          const SizedBox(height: 20),

          // Payment Option Selector
          const Text('Payment Preference', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => setState(() => _selectedPaymentMethod = 'VENUE'),
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _selectedPaymentMethod == 'VENUE' ? brandColor.withOpacity(0.12) : Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: _selectedPaymentMethod == 'VENUE' ? brandColor : AppColors.border,
                        width: _selectedPaymentMethod == 'VENUE' ? 2 : 1,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.storefront_outlined, size: 18, color: _selectedPaymentMethod == 'VENUE' ? brandColor : AppColors.textSecondary),
                            const SizedBox(width: 6),
                            const Text('Pay at Venue', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        const Text('Pay with Cash, Card, or UPI after service', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: InkWell(
                  onTap: () => setState(() => _selectedPaymentMethod = 'ONLINE'),
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _selectedPaymentMethod == 'ONLINE' ? brandColor.withOpacity(0.12) : Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: _selectedPaymentMethod == 'ONLINE' ? brandColor : AppColors.border,
                        width: _selectedPaymentMethod == 'ONLINE' ? 2 : 1,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.bolt_rounded, size: 18, color: _selectedPaymentMethod == 'ONLINE' ? brandColor : AppColors.textSecondary),
                            const SizedBox(width: 6),
                            const Text('Pay Online', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        const Text('Instant UPI / Card booking deposit', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          ElevatedButton(
            onPressed: isLoading ? null : _handleConfirmBooking,
            style: ElevatedButton.styleFrom(backgroundColor: brandColor),
            child: isLoading
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : Text(_selectedPaymentMethod == 'ONLINE' ? 'Pay Online & Confirm Booking' : 'Confirm Appointment Booking'),
          ),
        ],
      ),
    );
  }

  Widget _buildConfirmationView(PublicBusinessModel biz, Color brandColor) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 520),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.success.withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 64),
                  ),
                  const SizedBox(height: 20),
                  const Text('Booking Confirmed!', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 24)),
                  const SizedBox(height: 8),
                  Text(
                    'Your appointment at ${biz.name} has been successfully reserved.',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 14),
                  ),
                  const SizedBox(height: 24),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Booking Reference: ${_bookingConfirmation?['appointmentId'] ?? 'Confirmed'}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        const SizedBox(height: 8),
                        Text('Service: ${_bookingConfirmation?['serviceName'] ?? _selectedService?.name}'),
                        Text('Specialist: ${_bookingConfirmation?['staffName'] ?? _selectedStaff?.name ?? 'Assigned Specialist'}'),
                        Text('Price: ${_selectedService?.formattedPrice ?? '₹0'}'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Calendar Sync Actions
                  const Text('Save to your personal calendar:', style: TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            final startAt = _selectedSlot?.startAt ?? DateTime.now().add(const Duration(days: 1));
                            final duration = _selectedService?.durationMinutes ?? 30;
                            final endAt = startAt.add(Duration(minutes: duration));

                            CalendarExportHelper.openGoogleCalendar(
                              title: '${_selectedService?.name ?? 'Appointment'} at ${biz.name}',
                              startAtUtc: startAt.toUtc(),
                              endAtUtc: endAt.toUtc(),
                              description: 'Appointment with ${_selectedStaff?.name ?? 'Specialist'} at ${biz.name}. Reference: ${_bookingConfirmation?['appointmentId'] ?? ''}',
                              location: biz.location ?? biz.name,
                            );
                          },
                          icon: const Icon(Icons.event_available_rounded, size: 18),
                          label: const Text('Google Calendar', style: TextStyle(fontSize: 12)),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            final startAt = _selectedSlot?.startAt ?? DateTime.now().add(const Duration(days: 1));
                            final duration = _selectedService?.durationMinutes ?? 30;
                            final endAt = startAt.add(Duration(minutes: duration));

                            CalendarExportHelper.downloadIcsFile(
                              title: '${_selectedService?.name ?? 'Appointment'} at ${biz.name}',
                              startAtUtc: startAt.toUtc(),
                              endAtUtc: endAt.toUtc(),
                              description: 'Appointment with ${_selectedStaff?.name ?? 'Specialist'} at ${biz.name}. Reference: ${_bookingConfirmation?['appointmentId'] ?? ''}',
                              location: biz.location ?? biz.name,
                            );
                          },
                          icon: const Icon(Icons.download_rounded, size: 18),
                          label: const Text('Apple / Outlook (.ics)', style: TextStyle(fontSize: 12)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  ElevatedButton(
                    onPressed: () {
                      setState(() {
                        _bookingConfirmation = null;
                        _currentStep = 0;
                        _selectedSlot = null;
                      });
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: brandColor),
                    child: const Text('Book Another Appointment'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
