import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/websocket_service.dart';
import '../../../core/utils/audio_alert_helper.dart';

class InAppNotificationItem {
  final String id;
  final String title;
  final String message;
  final RealtimeEventType type;
  final DateTime timestamp;
  final bool isRead;
  final Map<String, dynamic>? appointmentData;

  InAppNotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.timestamp,
    this.isRead = false,
    this.appointmentData,
  });

  InAppNotificationItem copyWith({
    String? id,
    String? title,
    String? message,
    RealtimeEventType? type,
    DateTime? timestamp,
    bool? isRead,
    Map<String, dynamic>? appointmentData,
  }) {
    return InAppNotificationItem(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      type: type ?? this.type,
      timestamp: timestamp ?? this.timestamp,
      isRead: isRead ?? this.isRead,
      appointmentData: appointmentData ?? this.appointmentData,
    );
  }
}

class NotificationCenterState {
  final List<InAppNotificationItem> notifications;
  final bool soundEnabled;

  int get unreadCount => notifications.where((n) => !n.isRead).length;

  NotificationCenterState({
    this.notifications = const [],
    this.soundEnabled = true,
  });

  NotificationCenterState copyWith({
    List<InAppNotificationItem>? notifications,
    bool? soundEnabled,
  }) {
    return NotificationCenterState(
      notifications: notifications ?? this.notifications,
      soundEnabled: soundEnabled ?? this.soundEnabled,
    );
  }
}

class NotificationCenterNotifier extends StateNotifier<NotificationCenterState> {
  NotificationCenterNotifier(Ref ref) : super(NotificationCenterState()) {
    // Listen to real-time WebSocket events
    ref.listen<AsyncValue<RealtimeEvent>>(realtimeEventsStreamProvider, (previous, next) {
      next.whenData((event) {
        _handleIncomingEvent(event);
      });
    });
  }

  void _handleIncomingEvent(RealtimeEvent event) {
    String title = 'Notification';
    String message = 'New activity in your business';

    final appt = event.data;
    final customerName = appt['customer']?['name'] ?? appt['customerName'] ?? 'A customer';
    final serviceName = appt['service']?['name'] ?? appt['serviceName'] ?? 'Service';

    if (event.type == RealtimeEventType.appointmentCreated) {
      title = '🎉 New Booking Received!';
      message = '$customerName booked "$serviceName"';
    } else if (event.type == RealtimeEventType.appointmentStatusUpdated) {
      final status = appt['status']?.toString() ?? 'UPDATED';
      title = '📅 Appointment $status';
      message = '$customerName\'s "$serviceName" booking status changed to $status';
    }

    final item = InAppNotificationItem(
      id: 'notif-${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      message: message,
      type: event.type,
      timestamp: event.timestamp,
      isRead: false,
      appointmentData: appt,
    );

    // Prepend to notifications list (max 50)
    final updatedList = [item, ...state.notifications].take(50).toList();
    state = state.copyWith(notifications: updatedList);

    // Play chime sound if enabled
    if (state.soundEnabled) {
      AudioAlertHelper.playNotificationChime();
    }
  }

  void markAsRead(String id) {
    state = state.copyWith(
      notifications: state.notifications.map((n) {
        return n.id == id ? n.copyWith(isRead: true) : n;
      }).toList(),
    );
  }

  void markAllAsRead() {
    state = state.copyWith(
      notifications: state.notifications.map((n) => n.copyWith(isRead: true)).toList(),
    );
  }

  void clearAll() {
    state = state.copyWith(notifications: []);
  }

  void toggleSound() {
    state = state.copyWith(soundEnabled: !state.soundEnabled);
  }
}

final notificationCenterProvider =
    StateNotifierProvider<NotificationCenterNotifier, NotificationCenterState>((ref) {
  return NotificationCenterNotifier(ref);
});
