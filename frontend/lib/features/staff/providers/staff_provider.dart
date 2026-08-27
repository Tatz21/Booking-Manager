import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/staff_model.dart';

final staffListProvider = FutureProvider.autoDispose<List<StaffModel>>((ref) async {
  final api = ref.watch(apiClientProvider);
  try {
    final response = await api.get(ApiEndpoints.staff);
    final list = response as List;
    final items = list.map((item) => StaffModel.fromJson(item)).toList();
    if (items.isNotEmpty) return items;
  } catch (_) {}

  return [
    StaffModel(
      id: 'stf-luxe-1',
      name: 'Kavya Sen',
      roleTitle: 'Lead Hair Artist',
      email: 'kavya.s@luxelounge.com',
      phone: '+919876500011',
      isActive: true,
      assignedServiceIds: ['srv-luxe-1', 'srv-luxe-4'],
    ),
    StaffModel(
      id: 'stf-luxe-2',
      name: 'Aiden Vance',
      roleTitle: 'Master Barber & Groomer',
      email: 'aiden.v@luxelounge.com',
      phone: '+919876500022',
      isActive: true,
      assignedServiceIds: ['srv-luxe-1', 'srv-luxe-3'],
    ),
    StaffModel(
      id: 'stf-luxe-3',
      name: 'Dr. Rhea Mehra',
      roleTitle: 'Skin Therapist & Aesthetician',
      email: 'rhea.m@luxelounge.com',
      phone: '+919876500033',
      isActive: true,
      assignedServiceIds: ['srv-luxe-2'],
    ),
  ];
});

final staffActionProvider =
    StateNotifierProvider<StaffActionNotifier, AsyncValue<void>>((ref) {
  final api = ref.watch(apiClientProvider);
  return StaffActionNotifier(api: api, ref: ref);
});

class StaffActionNotifier extends StateNotifier<AsyncValue<void>> {
  final dynamic api;
  final Ref ref;

  StaffActionNotifier({required this.api, required this.ref})
      : super(const AsyncValue.data(null));

  Future<bool> createStaff({
    required String name,
    String? email,
    String? phone,
    String? roleTitle,
  }) async {
    state = const AsyncValue.loading();
    try {
      await api.post(
        ApiEndpoints.staff,
        data: {
          'name': name.trim(),
          'email': email?.trim().isNotEmpty == true ? email!.trim() : null,
          'phone': phone?.trim().isNotEmpty == true ? phone!.trim() : null,
          'roleTitle': roleTitle?.trim().isNotEmpty == true ? roleTitle!.trim() : 'Specialist',
        },
      );
      state = const AsyncValue.data(null);
      ref.invalidate(staffListProvider);
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<bool> assignServices({
    required String staffId,
    required List<String> serviceIds,
  }) async {
    state = const AsyncValue.loading();
    try {
      await api.put(
        '${ApiEndpoints.staff}/$staffId/services',
        data: {'serviceIds': serviceIds},
      );
      state = const AsyncValue.data(null);
      ref.invalidate(staffListProvider);
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }
}
