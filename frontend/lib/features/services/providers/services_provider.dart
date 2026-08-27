import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/service_model.dart';

final servicesListProvider = FutureProvider.autoDispose<List<ServiceModel>>((ref) async {
  final api = ref.watch(apiClientProvider);
  try {
    final response = await api.get(ApiEndpoints.services);
    final list = response as List;
    final items = list.map((item) => ServiceModel.fromJson(item)).toList();
    if (items.isNotEmpty) return items;
  } catch (_) {}

  return [
    ServiceModel(
      id: 'srv-luxe-1',
      name: 'Signature Hair Sculpt & Blowout',
      description: 'Consultation, botanical wash, precision cut, and keratin blowout styling',
      durationMinutes: 45,
      price: 120000,
      currency: 'INR',
      isActive: true,
    ),
    ServiceModel(
      id: 'srv-luxe-2',
      name: 'Hydra-Dew Glow Facial',
      description: 'Deep pore detox, ultrasonic serum infusion, and chilled jade stone massage',
      durationMinutes: 60,
      price: 250000,
      currency: 'INR',
      isActive: true,
    ),
    ServiceModel(
      id: 'srv-luxe-3',
      name: 'Executive Beard Architecture & Hot Towel',
      description: 'Precision beard sculpting, straight razor lines, and organic sandalwood oil steam',
      durationMinutes: 30,
      price: 65000,
      currency: 'INR',
      isActive: true,
    ),
    ServiceModel(
      id: 'srv-luxe-4',
      name: 'Balayage & Gloss Therapy',
      description: 'Custom French balayage hand-painted lightening with gloss glaze sealant',
      durationMinutes: 90,
      price: 450000,
      currency: 'INR',
      isActive: true,
    ),
  ];
});

final servicesActionProvider =
    StateNotifierProvider<ServicesActionNotifier, AsyncValue<void>>((ref) {
  final api = ref.watch(apiClientProvider);
  return ServicesActionNotifier(api: api, ref: ref);
});

class ServicesActionNotifier extends StateNotifier<AsyncValue<void>> {
  final dynamic api;
  final Ref ref;

  ServicesActionNotifier({required this.api, required this.ref})
      : super(const AsyncValue.data(null));

  Future<bool> createService({
    required String name,
    String? description,
    required int durationMinutes,
    required int pricePaise,
  }) async {
    state = const AsyncValue.loading();
    try {
      await api.post(
        ApiEndpoints.services,
        data: {
          'name': name.trim(),
          'description': description?.trim(),
          'durationMinutes': durationMinutes,
          'price': pricePaise,
          'currency': 'INR',
        },
      );
      state = const AsyncValue.data(null);
      ref.invalidate(servicesListProvider);
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<bool> updateService({
    required String id,
    required String name,
    String? description,
    required int durationMinutes,
    required int pricePaise,
    required bool isActive,
  }) async {
    state = const AsyncValue.loading();
    try {
      await api.patch(
        '${ApiEndpoints.services}/$id',
        data: {
          'name': name.trim(),
          'description': description?.trim(),
          'durationMinutes': durationMinutes,
          'price': pricePaise,
          'isActive': isActive,
        },
      );
      state = const AsyncValue.data(null);
      ref.invalidate(servicesListProvider);
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<bool> deleteService(String id) async {
    state = const AsyncValue.loading();
    try {
      await api.delete('${ApiEndpoints.services}/$id');
      state = const AsyncValue.data(null);
      ref.invalidate(servicesListProvider);
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }
}
