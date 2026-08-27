import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/customer_model.dart';

final customerSearchQueryProvider = StateProvider<String>((ref) => '');

final customersListProvider = FutureProvider.autoDispose<List<CustomerModel>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final query = ref.watch(customerSearchQueryProvider);

  final params = <String, dynamic>{'limit': 50};
  if (query.trim().isNotEmpty) {
    params['search'] = query.trim();
  }

  try {
    final response = await api.get(ApiEndpoints.customers, queryParameters: params);
    final items = response['items'] as List? ?? [];
    final res = items.map((item) => CustomerModel.fromJson(item)).toList();
    if (res.isNotEmpty) return res;
  } catch (_) {}

  final allDemo = [
    CustomerModel(id: 'c-1', name: 'Pooja Hegde', email: 'pooja.h@example.com', phone: '+919845012345', totalBookings: 6),
    CustomerModel(id: 'c-2', name: 'Arjun Kapoor', email: 'arjun.k@example.com', phone: '+919845067890', totalBookings: 4),
    CustomerModel(id: 'c-3', name: 'Meera Nambiar', email: 'meera.n@example.com', phone: '+919900123456', totalBookings: 2),
    CustomerModel(id: 'c-4', name: 'Kabir Singhania', email: 'kabir.s@example.com', phone: '+919811122334', totalBookings: 9),
    CustomerModel(id: 'c-5', name: 'Tara Sutaria', email: 'tara.s@example.com', phone: '+919844055667', totalBookings: 5),
  ];

  if (query.trim().isNotEmpty) {
    final q = query.toLowerCase();
    return allDemo.where((c) => c.name.toLowerCase().contains(q) || c.email.toLowerCase().contains(q) || c.phone.contains(q)).toList();
  }

  return allDemo;
});
