import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../models/service_model.dart';
import '../providers/services_provider.dart';

class ServicesListScreen extends ConsumerWidget {
  const ServicesListScreen({super.key});

  void _showServiceModal(BuildContext context, WidgetRef ref, [ServiceModel? service]) {
    final nameCtrl = TextEditingController(text: service?.name ?? '');
    final descCtrl = TextEditingController(text: service?.description ?? '');
    final durationCtrl = TextEditingController(text: service != null ? '${service.durationMinutes}' : '30');
    final priceRupeesCtrl = TextEditingController(text: service != null ? '${service.price ~/ 100}' : '499');
    bool isActive = service?.isActive ?? true;

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
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
                left: 24,
                right: 24,
                top: 24,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          service == null ? 'Add New Service' : 'Edit Service',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Text('Service Name *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: nameCtrl,
                      decoration: const InputDecoration(hintText: 'e.g. Classic Haircut & Beard Grooming'),
                    ),
                    const SizedBox(height: 12),
                    const Text('Description', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: descCtrl,
                      maxLines: 2,
                      decoration: const InputDecoration(hintText: 'Includes wash, styling, and hot towel finish'),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Duration (Minutes) *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                              const SizedBox(height: 6),
                              TextField(
                                controller: durationCtrl,
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(hintText: '30', suffixText: 'min'),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Price (₹ INR) *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                              const SizedBox(height: 6),
                              TextField(
                                controller: priceRupeesCtrl,
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(hintText: '499', prefixText: '₹ '),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    if (service != null)
                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        title: const Text('Service Active for Booking', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        value: isActive,
                        activeThumbColor: AppColors.primary,
                        onChanged: (v) => setModalState(() => isActive = v),
                      ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: () async {
                        if (nameCtrl.text.trim().isEmpty) return;
                        final duration = int.tryParse(durationCtrl.text) ?? 30;
                        final priceRupees = int.tryParse(priceRupeesCtrl.text) ?? 0;
                        final pricePaise = priceRupees * 100;

                        if (service == null) {
                          await ref.read(servicesActionProvider.notifier).createService(
                                name: nameCtrl.text,
                                description: descCtrl.text.isNotEmpty ? descCtrl.text : null,
                                durationMinutes: duration,
                                pricePaise: pricePaise,
                              );
                        } else {
                          await ref.read(servicesActionProvider.notifier).updateService(
                                id: service.id,
                                name: nameCtrl.text,
                                description: descCtrl.text.isNotEmpty ? descCtrl.text : null,
                                durationMinutes: duration,
                                pricePaise: pricePaise,
                                isActive: isActive,
                              );
                        }
                        if (context.mounted) Navigator.pop(ctx);
                      },
                      child: Text(service == null ? 'Create Service' : 'Save Changes'),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final servicesAsync = ref.watch(servicesListProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.go('/dashboard'),
        ),
        title: const Text('Services & Catalog', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: servicesAsync.when(
        data: (services) {
          if (services.isEmpty) {
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
                    child: const Icon(Icons.design_services_outlined, size: 48, color: AppColors.primary),
                  ),
                  const SizedBox(height: 16),
                  const Text('No Services Created Yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  const Text('Add your first bookable service to start accepting bookings.', style: TextStyle(color: AppColors.textSecondary)),
                  const SizedBox(height: 20),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(minimumSize: const Size(200, 48)),
                    icon: const Icon(Icons.add_rounded),
                    label: const Text('Add First Service'),
                    onPressed: () => _showServiceModal(context, ref),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: services.length,
            itemBuilder: (context, index) {
              final s = services[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: s.isActive
                              ? AppColors.primary.withOpacity(0.1)
                              : Colors.grey.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          Icons.content_cut_rounded,
                          color: s.isActive ? AppColors.primary : Colors.grey,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    s.name,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                  ),
                                ),
                                if (!s.isActive)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Colors.grey.shade200,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: const Text('Inactive', style: TextStyle(fontSize: 11, color: Colors.grey)),
                                  ),
                              ],
                            ),
                            if (s.description != null && s.description!.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: Text(
                                  s.description!,
                                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: AppColors.surfaceVariant,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.timer_outlined, size: 14, color: AppColors.textSecondary),
                                      const SizedBox(width: 4),
                                      Text('${s.durationMinutes} min', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  s.formattedPrice,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                    color: AppColors.success,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.edit_outlined, color: AppColors.textSecondary),
                        onPressed: () => _showServiceModal(context, ref, s),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error loading services: $err')),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('New Service'),
        onPressed: () => _showServiceModal(context, ref),
      ),
    );
  }
}
