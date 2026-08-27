import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../services/providers/services_provider.dart';
import '../models/staff_model.dart';
import '../providers/staff_provider.dart';

class StaffListScreen extends ConsumerWidget {
  const StaffListScreen({super.key});

  void _showAddStaffModal(BuildContext context, WidgetRef ref) {
    final nameCtrl = TextEditingController();
    final roleCtrl = TextEditingController(text: 'Specialist');
    final emailCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + 24,
            left: 24,
            right: 24,
            top: 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Add Team Member', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 16),
              const Text('Full Name *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(height: 6),
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(hintText: 'e.g. Alex Morgan'),
              ),
              const SizedBox(height: 12),
              const Text('Role / Title *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(height: 6),
              TextField(
                controller: roleCtrl,
                decoration: const InputDecoration(hintText: 'e.g. Senior Barber / Stylist'),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Email', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                        const SizedBox(height: 6),
                        TextField(
                          controller: emailCtrl,
                          keyboardType: TextInputType.emailAddress,
                          decoration: const InputDecoration(hintText: 'alex@example.com'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Phone', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                        const SizedBox(height: 6),
                        TextField(
                          controller: phoneCtrl,
                          keyboardType: TextInputType.phone,
                          decoration: const InputDecoration(hintText: '+91 9876543210'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () async {
                  if (nameCtrl.text.trim().isEmpty) return;
                  await ref.read(staffActionProvider.notifier).createStaff(
                        name: nameCtrl.text,
                        roleTitle: roleCtrl.text,
                        email: emailCtrl.text,
                        phone: phoneCtrl.text,
                      );
                  if (context.mounted) Navigator.pop(ctx);
                },
                child: const Text('Add Staff Member'),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showAssignServicesModal(BuildContext context, WidgetRef ref, StaffModel staff) {
    final servicesAsync = ref.read(servicesListProvider);
    final selectedIds = Set<String>.from(staff.assignedServiceIds);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Assign Services to ${staff.name}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                    ],
                  ),
                  const Text('Select the services this team member is qualified to perform:', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                  const SizedBox(height: 16),
                  servicesAsync.when(
                    data: (services) {
                      if (services.isEmpty) {
                        return const Padding(
                          padding: EdgeInsets.all(16.0),
                          child: Text('No services found. Create services first.'),
                        );
                      }
                      return ConstrainedBox(
                        constraints: const BoxConstraints(maxHeight: 280),
                        child: ListView.builder(
                          shrinkWrap: true,
                          itemCount: services.length,
                          itemBuilder: (context, index) {
                            final s = services[index];
                            final isChecked = selectedIds.contains(s.id);
                            return CheckboxListTile(
                              title: Text(s.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                              subtitle: Text('${s.durationMinutes} min • ${s.formattedPrice}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                              value: isChecked,
                              activeColor: AppColors.primary,
                              onChanged: (val) {
                                setModalState(() {
                                  if (val == true) {
                                    selectedIds.add(s.id);
                                  } else {
                                    selectedIds.remove(s.id);
                                  }
                                });
                              },
                            );
                          },
                        ),
                      );
                    },
                    loading: () => const Center(child: CircularProgressIndicator()),
                    error: (err, _) => Text('Error loading services: $err'),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () async {
                      await ref.read(staffActionProvider.notifier).assignServices(
                            staffId: staff.id,
                            serviceIds: selectedIds.toList(),
                          );
                      if (context.mounted) Navigator.pop(ctx);
                    },
                    child: const Text('Save Assigned Services'),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final staffAsync = ref.watch(staffListProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.go('/dashboard'),
        ),
        title: const Text('Staff & Team', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: staffAsync.when(
        data: (staffList) {
          if (staffList.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.primaryContainer,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.people_outline_rounded, size: 48, color: AppColors.primary),
                  ),
                  const SizedBox(height: 16),
                  const Text('No Staff Members Yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  const Text('Add your staff specialists and assign their services.', style: TextStyle(color: AppColors.textSecondary)),
                  const SizedBox(height: 20),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(minimumSize: const Size(200, 48)),
                    icon: const Icon(Icons.add_rounded),
                    label: const Text('Add Staff Member'),
                    onPressed: () => _showAddStaffModal(context, ref),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: staffList.length,
            itemBuilder: (context, index) {
              final staff = staffList[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundColor: AppColors.primary.withOpacity(0.12),
                        child: Text(
                          staff.name.isNotEmpty ? staff.name[0].toUpperCase() : 'S',
                          style: const TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              staff.name,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            Text(
                              staff.roleTitle ?? 'Specialist',
                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                            ),
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceVariant,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                '${staff.assignedServiceIds.length} services assigned',
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textSecondary),
                              ),
                            ),
                          ],
                        ),
                      ),
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(120, 36),
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                        ),
                        icon: const Icon(Icons.checklist_rounded, size: 16),
                        label: const Text('Services', style: TextStyle(fontSize: 13)),
                        onPressed: () => _showAssignServicesModal(context, ref, staff),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error loading staff: $err')),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Add Staff'),
        onPressed: () => _showAddStaffModal(context, ref),
      ),
    );
  }
}
