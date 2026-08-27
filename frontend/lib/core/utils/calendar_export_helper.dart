import 'package:url_launcher/url_launcher.dart';

class CalendarExportHelper {
  /// Generates a Google Calendar Web Intent URL
  static String generateGoogleCalendarUrl({
    required String title,
    required DateTime startAtUtc,
    required DateTime endAtUtc,
    required String description,
    required String location,
  }) {
    final startFormatted = _formatUtcForCalendar(startAtUtc);
    final endFormatted = _formatUtcForCalendar(endAtUtc);

    final uri = Uri.https('calendar.google.com', '/calendar/render', {
      'action': 'TEMPLATE',
      'text': title,
      'dates': '$startFormatted/$endFormatted',
      'details': description,
      'location': location,
    });

    return uri.toString();
  }

  /// Generates RFC 5545 iCalendar (.ics) content string
  static String generateIcsContent({
    required String title,
    required DateTime startAtUtc,
    required DateTime endAtUtc,
    required String description,
    required String location,
  }) {
    final startFormatted = _formatUtcForCalendar(startAtUtc);
    final endFormatted = _formatUtcForCalendar(endAtUtc);
    final nowFormatted = _formatUtcForCalendar(DateTime.now().toUtc());

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BookingApp SaaS//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:apt-${DateTime.now().millisecondsSinceEpoch}@bookingapp.com',
      'DTSTAMP:$nowFormatted',
      'DTSTART:$startFormatted',
      'DTEND:$endFormatted',
      'SUMMARY:$title',
      'DESCRIPTION:$description',
      'LOCATION:$location',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }

  /// Launches Google Calendar or triggers .ics download
  static Future<void> openGoogleCalendar({
    required String title,
    required DateTime startAtUtc,
    required DateTime endAtUtc,
    required String description,
    required String location,
  }) async {
    final url = generateGoogleCalendarUrl(
      title: title,
      startAtUtc: startAtUtc,
      endAtUtc: endAtUtc,
      description: description,
      location: location,
    );
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  /// Triggers .ics calendar file download via data URI
  static Future<void> downloadIcsFile({
    required String title,
    required DateTime startAtUtc,
    required DateTime endAtUtc,
    required String description,
    required String location,
  }) async {
    final icsData = generateIcsContent(
      title: title,
      startAtUtc: startAtUtc,
      endAtUtc: endAtUtc,
      description: description,
      location: location,
    );
    final encoded = Uri.encodeComponent(icsData);
    final dataUri = Uri.parse('data:text/calendar;charset=utf-8,$encoded');
    if (await canLaunchUrl(dataUri)) {
      await launchUrl(dataUri, mode: LaunchMode.externalApplication);
    }
  }

  static String _formatUtcForCalendar(DateTime dt) {
    final u = dt.toUtc();
    final y = u.year.toString().padLeft(4, '0');
    final m = u.month.toString().padLeft(2, '0');
    final d = u.day.toString().padLeft(2, '0');
    final h = u.hour.toString().padLeft(2, '0');
    final min = u.minute.toString().padLeft(2, '0');
    final s = u.second.toString().padLeft(2, '0');
    return '$y$m$d' 'T' '$h$min$s' 'Z';
  }
}
