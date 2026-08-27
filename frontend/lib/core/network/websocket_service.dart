import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../../features/auth/providers/auth_provider.dart';

enum RealtimeEventType {
  appointmentCreated,
  appointmentStatusUpdated,
  unknown,
}

class RealtimeEvent {
  final RealtimeEventType type;
  final String businessId;
  final Map<String, dynamic> data;
  final DateTime timestamp;

  RealtimeEvent({
    required this.type,
    required this.businessId,
    required this.data,
    required this.timestamp,
  });

  factory RealtimeEvent.fromJson(String eventName, dynamic raw) {
    final map = raw is Map<String, dynamic>
        ? raw
        : raw is Map
            ? Map<String, dynamic>.from(raw)
            : <String, dynamic>{};

    RealtimeEventType type = RealtimeEventType.unknown;
    if (eventName == 'appointment:created') {
      type = RealtimeEventType.appointmentCreated;
    } else if (eventName == 'appointment:status_updated') {
      type = RealtimeEventType.appointmentStatusUpdated;
    }

    return RealtimeEvent(
      type: type,
      businessId: map['businessId']?.toString() ?? '',
      data: map['appointment'] is Map<String, dynamic>
          ? map['appointment']
          : map['appointment'] is Map
              ? Map<String, dynamic>.from(map['appointment'])
              : map,
      timestamp: DateTime.tryParse(map['timestamp']?.toString() ?? '') ?? DateTime.now(),
    );
  }
}

class RealtimeWebSocketService {
  IO.Socket? _socket;
  final String serverUrl;
  final String? businessId;
  final _eventController = StreamController<RealtimeEvent>.broadcast();

  Stream<RealtimeEvent> get eventsStream => _eventController.stream;
  bool get isConnected => _socket?.connected ?? false;

  RealtimeWebSocketService({
    this.serverUrl = 'http://localhost:3000/ws',
    this.businessId,
  }) {
    if (businessId != null && businessId!.isNotEmpty) {
      _initSocket();
    }
  }

  void _initSocket() {
    try {
      _socket = IO.io(
        serverUrl,
        IO.OptionBuilder()
            .setTransports(['websocket', 'polling'])
            .disableAutoConnect()
            .enableReconnection()
            .setReconnectionAttempts(10)
            .setReconnectionDelay(2000)
            .build(),
      );

      _socket?.onConnect((_) {
        debugPrint('🟢 [WebSocket] Connected to $serverUrl');
        if (businessId != null) {
          _socket?.emit('join:business', {'businessId': businessId});
          debugPrint('🚪 [WebSocket] Joined business room: business:$businessId');
        }
      });

      _socket?.onDisconnect((_) {
        debugPrint('🔴 [WebSocket] Disconnected from server');
      });

      _socket?.onConnectError((err) {
        debugPrint('⚠️ [WebSocket] Connection Error: $err');
      });

      // Listen for appointment created
      _socket?.on('appointment:created', (data) {
        debugPrint('⚡ [WebSocket] Received appointment:created: $data');
        final event = RealtimeEvent.fromJson('appointment:created', data);
        _eventController.add(event);
      });

      // Listen for appointment status updated
      _socket?.on('appointment:status_updated', (data) {
        debugPrint('⚡ [WebSocket] Received appointment:status_updated: $data');
        final event = RealtimeEvent.fromJson('appointment:status_updated', data);
        _eventController.add(event);
      });

      _socket?.connect();
    } catch (e) {
      debugPrint('⚠️ [WebSocket] Socket initialization failed: $e');
    }
  }

  void dispose() {
    _socket?.disconnect();
    _socket?.dispose();
    _eventController.close();
  }
}

final realtimeWebSocketServiceProvider = Provider<RealtimeWebSocketService>((ref) {
  final authState = ref.watch(authProvider);
  final businessId = authState.user?.businessId;

  final service = RealtimeWebSocketService(
    serverUrl: 'http://localhost:3000/ws',
    businessId: businessId,
  );

  ref.onDispose(() {
    service.dispose();
  });

  return service;
});

final realtimeEventsStreamProvider = StreamProvider.autoDispose<RealtimeEvent>((ref) {
  final wsService = ref.watch(realtimeWebSocketServiceProvider);
  return wsService.eventsStream;
});
