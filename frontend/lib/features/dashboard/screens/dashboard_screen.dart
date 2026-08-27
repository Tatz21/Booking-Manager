import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/websocket_service.dart';
import '../../../core/widgets/glassmorphic_card.dart';
import '../../auth/providers/auth_provider.dart';
import '../../subscription/providers/subscription_provider.dart';
import '../providers/dashboard_provider.dart';
import '../providers/notification_center_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final statsAsync = ref.watch(dashboardStatsProvider);
    final subscriptionAsync = ref.watch(subscriptionStatusProvider);

    // Live Real-Time WebSockets Listener
    ref.listen<AsyncValue<RealtimeEvent>>(realtimeEventsStreamProvider, (previous, next) {
      next.whenData((event) {
        ref.invalidate(dashboardStatsProvider);

        final custName = event.data['customerName'] ??
            event.data['customer']?['name'] ??
            'A customer';
        final srvName = event.data['serviceName'] ??
            event.data['service']?['name'] ??
            'an appointment';

        if (event.type == RealtimeEventType.appointmentCreated) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              behavior: SnackBarBehavior.floating,
              backgroundColor: AppColors.primary,
              duration: const Duration(seconds: 5),
              content: Row(
                children: [
                  const Icon(Icons.notifications_active_rounded, color: Colors.white),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      '🔔 New Live Booking: $custName booked $srvName!',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
          );
        }
      });
    });

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      body: GlassmorphicBackground(
        child: Column(
          children: [
            // Glassmorphic Top Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: GlassmorphicCard(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                borderRadius: 24,
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          colors: [
                            AppColors.primary,
                            AppColors.primaryDark,
                          ],
                        ),
                      ),
                      child: const Center(
                        child: Icon(Icons.storefront_rounded, color: Colors.white, size: 22),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user?.businessName ?? 'Booking Dashboard',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 17,
                              color: AppColors.textPrimary,
                              letterSpacing: -0.01,
                            ),
                          ),
                          Text(
                            user?.role != null ? 'Studio • Role: ${user!.role}' : 'Studio Manager',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      tooltip: 'Copy Public Booking Link',
                      icon: const Icon(Icons.link_rounded, color: AppColors.primary),
                      onPressed: () {
                        final slug = (user?.businessSlug != null && user!.businessSlug.isNotEmpty)
                            ? user.businessSlug
                            : 'luxe-lounge';
                        final url = 'http://localhost:5050/book/$slug';
                        Clipboard.setData(ClipboardData(text: url));
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Public booking link copied: $url'),
                            backgroundColor: AppColors.success,
                          ),
                        );
                      },
                    ),
                    // Notification Bell with Badge
                    Consumer(
                      builder: (context, ref, _) {
                        final notifState = ref.watch(notificationCenterProvider);
                        final unread = notifState.unreadCount;

                        return Stack(
                          alignment: Alignment.center,
                          children: [
                            IconButton(
                              tooltip: 'Notification Center',
                              icon: Icon(
                                unread > 0
                                    ? Icons.notifications_active_rounded
                                    : Icons.notifications_none_rounded,
                                color: unread > 0 ? AppColors.accent : AppColors.textSecondary,
                              ),
                              onPressed: () => _showNotificationCenter(context, ref),
                            ),
                            if (unread > 0)
                              Positioned(
                                top: 8,
                                right: 8,
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: const BoxDecoration(
                                    color: AppColors.error,
                                    shape: BoxShape.circle,
                                  ),
                                  constraints: const BoxConstraints(
                                    minWidth: 16,
                                    minHeight: 16,
                                  ),
                                  child: Center(
                                    child: Text(
                                      unread > 9 ? '9+' : '$unread',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        );
                      },
                    ),
                    IconButton(
                      tooltip: 'Sign Out',
                      icon: const Icon(Icons.logout_rounded, color: AppColors.textSecondary),
                      onPressed: () async {
                        await ref.read(authProvider.notifier).logout();
                        if (context.mounted) context.go('/login');
                      },
                    ),
                  ],
                ),
              ),
            ),

            // Scrollable Dashboard Body
            Expanded(
              child: RefreshIndicator(
                onRefresh: () async {
                  ref.invalidate(dashboardStatsProvider);
                  ref.invalidate(subscriptionStatusProvider);
                },
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 1. Glassmorphic Subscription & Trial Banner
                      subscriptionAsync.when(
                        data: (sub) {
                          if (sub.isTrialActive) {
                            return GlassmorphicCard(
                              margin: const EdgeInsets.only(bottom: 20),
                              padding: const EdgeInsets.all(18),
                              backgroundColor: AppColors.primary.withValues(alpha: 0.88),
                              borderColor: Colors.white.withValues(alpha: 0.3),
                              child: Row(
                                children: [
                                  const Icon(Icons.stars_rounded, color: Colors.white, size: 36),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          '7-Day Free Trial: ${sub.daysRemaining} days remaining',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        const Text(
                                          'Upgrade anytime for ₹199/month for uninterrupted live bookings.',
                                          style: TextStyle(color: Colors.white70, fontSize: 13),
                                        ),
                                      ],
                                    ),
                                  ),
                                  ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.white,
                                      foregroundColor: AppColors.primary,
                                      minimumSize: const Size(100, 38),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(999),
                                      ),
                                    ),
                                    onPressed: () => context.go('/subscription'),
                                    child: const Text('Upgrade'),
                                  ),
                                ],
                              ),
                            );
                          } else if (!sub.canAccessPlatform) {
                            return GlassmorphicCard(
                              margin: const EdgeInsets.only(bottom: 20),
                              padding: const EdgeInsets.all(18),
                              backgroundColor: AppColors.error.withValues(alpha: 0.1),
                              borderColor: AppColors.error.withValues(alpha: 0.3),
                              child: Row(
                                children: [
                                  const Icon(Icons.warning_amber_rounded, color: AppColors.error, size: 36),
                                  const SizedBox(width: 14),
                                  const Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Trial Expired',
                                          style: TextStyle(
                                            color: AppColors.error,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16,
                                          ),
                                        ),
                                        Text(
                                          'Subscribe for ₹199/month to unlock booking and team management.',
                                          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                                        ),
                                      ],
                                    ),
                                  ),
                                  ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.error,
                                      minimumSize: const Size(100, 38),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(999),
                                      ),
                                    ),
                                    onPressed: () => context.go('/subscription'),
                                    child: const Text('Subscribe'),
                                  ),
                                ],
                              ),
                            );
                          }
                          return const SizedBox.shrink();
                        },
                        loading: () => const SizedBox.shrink(),
                        error: (_, __) => const SizedBox.shrink(),
                      ),

                      // 2. Glassmorphic Metrics KPI Grid
                      statsAsync.when(
                        data: (stats) => LayoutBuilder(
                          builder: (context, constraints) {
                            final isWide = constraints.maxWidth > 600;
                            return GridView.count(
                              crossAxisCount: isWide ? 4 : 2,
                              shrinkWrap: true,
                              crossAxisSpacing: 14,
                              mainAxisSpacing: 14,
                              physics: const NeverScrollableScrollPhysics(),
                              childAspectRatio: isWide ? 1.5 : 1.25,
                              children: [
                                _buildGlassKpiCard(
                                  title: "Today's Bookings",
                                  value: '${stats.todayAppointmentsCount}',
                                  icon: Icons.event_available_rounded,
                                  color: AppColors.primary,
                                ),
                                _buildGlassKpiCard(
                                  title: 'Confirmed',
                                  value: '${stats.confirmedCount}',
                                  icon: Icons.check_circle_outline_rounded,
                                  color: AppColors.success,
                                ),
                                _buildGlassKpiCard(
                                  title: 'Total Customers',
                                  value: '${stats.totalCustomersCount}',
                                  icon: Icons.people_outline_rounded,
                                  color: AppColors.secondary,
                                ),
                                _buildGlassKpiCard(
                                  title: 'Est. Revenue',
                                  value: stats.formattedRevenueInr,
                                  icon: Icons.currency_rupee_rounded,
                                  color: const Color(0xFFD97706),
                                ),
                              ],
                            );
                          },
                        ),
                        loading: () => const Center(
                          child: Padding(
                            padding: EdgeInsets.all(24.0),
                            child: CircularProgressIndicator(),
                          ),
                        ),
                        error: (err, _) => Text('Error loading stats: $err'),
                      ),

                      const SizedBox(height: 28),
                      const Text(
                        'Studio Management',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                          color: AppColors.textPrimary,
                          letterSpacing: -0.01,
                        ),
                      ),
                      const SizedBox(height: 14),

                      // 3. Glassmorphic Quick Navigation Cards
                      ListView(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        children: [
                          _buildGlassNavTile(
                            context,
                            title: 'Appointments Calendar',
                            subtitle: 'View bookings schedule, confirm, or cancel appointments',
                            icon: Icons.calendar_month_rounded,
                            color: AppColors.primary,
                            route: '/appointments',
                          ),
                          _buildGlassNavTile(
                            context,
                            title: 'Services & Pricing',
                            subtitle: 'Manage bookable services, durations, and prices (₹ / paise)',
                            icon: Icons.design_services_rounded,
                            color: AppColors.secondary,
                            route: '/services',
                          ),
                          _buildGlassNavTile(
                            context,
                            title: 'Staff & Working Shifts',
                            subtitle: 'Manage team members, service assignments, and working hours',
                            icon: Icons.badge_outlined,
                            color: AppColors.success,
                            route: '/staff',
                          ),
                          _buildGlassNavTile(
                            context,
                            title: 'Customer Directory',
                            subtitle: 'View customer contact info, booking history, and profiles',
                            icon: Icons.contacts_outlined,
                            color: AppColors.info,
                            route: '/customers',
                          ),
                          _buildGlassNavTile(
                            context,
                            title: 'Subscription & Billing',
                            subtitle: '7-day trial status and ₹199/month Razorpay plan checkout',
                            icon: Icons.credit_card_rounded,
                            color: const Color(0xFFD97706),
                            route: '/subscription',
                          ),
                          _buildGlassNavTile(
                            context,
                            title: 'Brand Styling & Custom Subdomains',
                            subtitle: 'Customize theme colors, logo, and verified vanity CNAME domain',
                            icon: Icons.palette_outlined,
                            color: const Color(0xFF7C3AED),
                            route: '/branding',
                          ),
                          _buildGlassNavTile(
                            context,
                            title: 'Preview Public Customer Booking Page',
                            subtitle: 'Test unauthenticated customer booking flow in new tab',
                            icon: Icons.open_in_new_rounded,
                            color: AppColors.primaryDark,
                            onTap: () {
                              final slug = user?.businessSlug ?? '';
                              context.go('/book/$slug');
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 30),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGlassKpiCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return GlassmorphicCard(
      padding: const EdgeInsets.all(18),
      borderRadius: 20,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(7),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 18, color: color),
              ),
            ],
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
              letterSpacing: -0.02,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGlassNavTile(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    String? route,
    VoidCallback? onTap,
  }) {
    return GlassmorphicCard(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
      borderRadius: 18,
      onTap: onTap ?? (route != null ? () => context.go(route) : null),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 24),
        ],
      ),
    );
  }

  void _showNotificationCenter(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        return Consumer(
          builder: (context, ref, _) {
            final notifState = ref.watch(notificationCenterProvider);
            final notifs = notifState.notifications;
            final unread = notifState.unreadCount;

            return Container(
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.75,
                maxWidth: 600,
              ),
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B).withValues(alpha: 0.96),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black45,
                    blurRadius: 30,
                    offset: Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Header
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 18, 16, 14),
                    child: Row(
                      children: [
                        const Icon(Icons.notifications_active_rounded, color: AppColors.accent, size: 22),
                        const SizedBox(width: 10),
                        const Text(
                          'Notification Center',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (unread > 0) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.error,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              '$unread new',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                        const Spacer(),
                        // Sound toggle
                        IconButton(
                          tooltip: notifState.soundEnabled ? 'Mute Alert Chime' : 'Unmute Alert Chime',
                          icon: Icon(
                            notifState.soundEnabled ? Icons.volume_up_rounded : Icons.volume_off_rounded,
                            color: Colors.white70,
                            size: 20,
                          ),
                          onPressed: () {
                            ref.read(notificationCenterProvider.notifier).toggleSound();
                          },
                        ),
                        if (notifs.isNotEmpty) ...[
                          IconButton(
                            tooltip: 'Mark all as read',
                            icon: const Icon(Icons.done_all_rounded, color: Colors.white70, size: 20),
                            onPressed: () {
                              ref.read(notificationCenterProvider.notifier).markAllAsRead();
                            },
                          ),
                          IconButton(
                            tooltip: 'Clear all',
                            icon: const Icon(Icons.clear_all_rounded, color: Colors.white70, size: 20),
                            onPressed: () {
                              ref.read(notificationCenterProvider.notifier).clearAll();
                            },
                          ),
                        ],
                      ],
                    ),
                  ),
                  const Divider(color: Color(0xFF334155), height: 1),

                  // Content List or Empty State
                  Flexible(
                    child: notifs.isEmpty
                        ? Padding(
                            padding: const EdgeInsets.all(40),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.notifications_none_rounded, color: Colors.white.withValues(alpha: 0.3), size: 48),
                                const SizedBox(height: 12),
                                const Text(
                                  'All caught up!',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Live bookings, reminders, and cancellations will appear here in real time.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.6),
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                          )
                        : ListView.separated(
                            shrinkWrap: true,
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            itemCount: notifs.length,
                            separatorBuilder: (ctx, i) => const Divider(color: Color(0xFF334155), height: 1),
                            itemBuilder: (ctx, i) {
                              final item = notifs[i];
                              return ListTile(
                                tileColor: item.isRead ? Colors.transparent : Colors.white.withValues(alpha: 0.05),
                                leading: Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: (item.type == RealtimeEventType.appointmentCreated
                                            ? AppColors.success
                                            : AppColors.primary)
                                        .withValues(alpha: 0.2),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    item.type == RealtimeEventType.appointmentCreated
                                        ? Icons.calendar_today_rounded
                                        : Icons.update_rounded,
                                    color: item.type == RealtimeEventType.appointmentCreated
                                        ? AppColors.success
                                        : AppColors.primary,
                                    size: 18,
                                  ),
                                ),
                                title: Text(
                                  item.title,
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 14,
                                    fontWeight: item.isRead ? FontWeight.normal : FontWeight.bold,
                                  ),
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const SizedBox(height: 2),
                                    Text(
                                      item.message,
                                      style: TextStyle(
                                        color: Colors.white.withValues(alpha: 0.7),
                                        fontSize: 12,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      _formatRelativeTime(item.timestamp),
                                      style: TextStyle(
                                        color: Colors.white.withValues(alpha: 0.4),
                                        fontSize: 11,
                                      ),
                                    ),
                                  ],
                                ),
                                trailing: !item.isRead
                                    ? Container(
                                        width: 8,
                                        height: 8,
                                        decoration: const BoxDecoration(
                                          color: AppColors.accent,
                                          shape: BoxShape.circle,
                                        ),
                                      )
                                    : null,
                                onTap: () {
                                  ref.read(notificationCenterProvider.notifier).markAsRead(item.id);
                                },
                              );
                            },
                          ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  static String _formatRelativeTime(DateTime time) {
    final diff = DateTime.now().difference(time);
    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }
}
