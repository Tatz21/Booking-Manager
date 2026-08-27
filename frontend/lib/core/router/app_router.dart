import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/models/auth_state.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/sign_in_screen.dart';
import '../../features/auth/screens/register_business_screen.dart';
import '../../features/dashboard/screens/dashboard_screen.dart';
import '../../features/appointments/screens/appointments_calendar_screen.dart';
import '../../features/services/screens/services_list_screen.dart';
import '../../features/staff/screens/staff_list_screen.dart';
import '../../features/customers/screens/customers_list_screen.dart';
import '../../features/subscription/screens/subscription_billing_screen.dart';
import '../../features/dashboard/screens/branding_settings_screen.dart';
import '../../features/legal/screens/legal_pages_screen.dart';
import '../../features/public_booking/screens/public_booking_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final loc = state.uri.path;
      final matched = state.matchedLocation;

      // 1. Completely Public Endpoints (Never redirect away)
      if (loc.startsWith('/book') ||
          matched.startsWith('/book') ||
          loc == '/terms' ||
          loc == '/privacy' ||
          loc == '/refund-policy' ||
          loc == '/contact') {
        return null;
      }

      final isAuth = authState.isAuthenticated;
      final isLoading = authState.status == AuthStatus.loading ||
          authState.status == AuthStatus.initial;

      if (isLoading) {
        return null;
      }

      final isLogin = loc == '/login' || matched == '/login';
      final isRegister = loc == '/register' || matched == '/register';

      // 2. Unauthenticated user trying to access protected route
      if (!isAuth) {
        return (isLogin || isRegister) ? null : '/login';
      }

      // 3. Authenticated user visiting auth screens -> go to dashboard
      if (isAuth && (isLogin || isRegister || loc == '/')) {
        return '/dashboard';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        redirect: (context, state) => authState.isAuthenticated ? '/dashboard' : '/login',
      ),
      GoRoute(
        path: '/book',
        redirect: (context, state) => '/book/luxe-lounge',
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const SignInScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterBusinessScreen(),
      ),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const DashboardScreen(),
      ),
      GoRoute(
        path: '/appointments',
        builder: (context, state) => const AppointmentsCalendarScreen(),
      ),
      GoRoute(
        path: '/services',
        builder: (context, state) => const ServicesListScreen(),
      ),
      GoRoute(
        path: '/staff',
        builder: (context, state) => const StaffListScreen(),
      ),
      GoRoute(
        path: '/customers',
        builder: (context, state) => const CustomersListScreen(),
      ),
      GoRoute(
        path: '/subscription',
        builder: (context, state) => const SubscriptionBillingScreen(),
      ),
      GoRoute(
        path: '/branding',
        builder: (context, state) => const BrandingSettingsScreen(),
      ),
      GoRoute(
        path: '/terms',
        builder: (context, state) => const LegalPagesScreen(initialTabIndex: 0),
      ),
      GoRoute(
        path: '/privacy',
        builder: (context, state) => const LegalPagesScreen(initialTabIndex: 1),
      ),
      GoRoute(
        path: '/refund-policy',
        builder: (context, state) => const LegalPagesScreen(initialTabIndex: 2),
      ),
      GoRoute(
        path: '/contact',
        builder: (context, state) => const LegalPagesScreen(initialTabIndex: 3),
      ),
      GoRoute(
        path: '/book/:slug',
        builder: (context, state) {
          final slug = state.pathParameters['slug'] ?? 'luxe-lounge';
          return PublicBookingScreen(slug: slug);
        },
      ),
    ],
  );
});
