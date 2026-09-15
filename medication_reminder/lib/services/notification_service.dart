import 'dart:async';

import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest_all.dart' as tz_data;

import '../models/dose.dart';
import 'database_service.dart';

/// معرّفات إجراءات الإشعار (تظهر كأزرار داخل الإشعار نفسه)
const String actionTaken = 'DOSE_TAKEN';
const String actionSnooze = 'DOSE_SNOOZE';

/// يُستدعى عند الضغط على زر إشعار والتطبيق مغلق تمامًا (isolate خلفي منفصل).
/// يكتب مباشرة في قاعدة البيانات المحلية دون الحاجة لفتح التطبيق.
@pragma('vm:entry-point')
void _onBackgroundNotificationResponse(NotificationResponse response) async {
  await _handleDoseAction(response.payload, response.actionId);
}

/// منطق مشترك للتعامل مع أزرار الإشعار، يعمل سواء كان التطبيق مفتوحًا
/// أو مغلقًا تمامًا (isolate خلفي)، لأنه يعتمد فقط على قاعدة البيانات المحلية.
Future<void> _handleDoseAction(String? doseId, String? actionId) async {
  if (doseId == null) return;
  final db = DatabaseService.instance;
  final dose = await db.getDoseById(doseId);
  if (dose == null) return;

  if (actionId == actionTaken) {
    await db.updateDoseStatus(doseId, DoseStatus.taken, takenAt: DateTime.now());
    await FlutterLocalNotificationsPlugin().cancel(dose.notificationId);
  } else if (actionId == actionSnooze) {
    final medications = await db.getAllMedications();
    final medication = medications.where((m) => m.id == dose.medicationId);
    if (medication.isEmpty) return;
    final newTime = DateTime.now().add(const Duration(minutes: 10));
    await NotificationService.instance.scheduleDoseNotification(
      notificationId: dose.notificationId,
      doseId: dose.id,
      medicationName: medication.first.name,
      dosage: medication.first.dosage,
      scheduledAt: newTime,
    );
  }
}

const String _channelId = 'medication_doses';
const String _channelName = 'مواعيد الجرعات';
const String _channelDescription = 'تنبيهات بمواعيد أخذ الأدوية';

class NotificationService {
  NotificationService._internal();
  static final NotificationService instance = NotificationService._internal();

  final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  /// دفق يبث معرّف الجرعة كلما تغيّرت حالتها بسبب ضغط زر داخل الإشعار
  /// (تُستخدم في الواجهة لتحديث القائمة فورًا دون انتظار إعادة تحميل يدوية)
  final StreamController<String> doseChangedFromNotification =
      StreamController<String>.broadcast();

  Future<void> init() async {
    tz_data.initializeTimeZones();
    tz.setLocalLocation(tz.local);

    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    await _plugin.initialize(
      const InitializationSettings(android: androidSettings, iOS: iosSettings),
      onDidReceiveNotificationResponse: _onNotificationResponse,
      onDidReceiveBackgroundNotificationResponse: _onBackgroundNotificationResponse,
    );

    const androidChannel = AndroidNotificationChannel(
      _channelId,
      _channelName,
      description: _channelDescription,
      importance: Importance.max,
    );
    await _plugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(androidChannel);

    await _requestPermissions();
  }

  Future<void> _requestPermissions() async {
    final androidImpl = _plugin.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    await androidImpl?.requestNotificationsPermission();
    await androidImpl?.requestExactAlarmsPermission();

    final iosImpl = _plugin.resolvePlatformSpecificImplementation<
        IOSFlutterLocalNotificationsPlugin>();
    await iosImpl?.requestPermissions(alert: true, badge: true, sound: true);
  }

  void _onNotificationResponse(NotificationResponse response) async {
    await _handleDoseAction(response.payload, response.actionId);
    if (response.payload != null) {
      doseChangedFromNotification.add(response.payload!);
    }
  }

  /// يجدول إشعارًا واحدًا لجرعة دواء في وقت محدد
  Future<void> scheduleDoseNotification({
    required int notificationId,
    required String doseId,
    required String medicationName,
    required String dosage,
    required DateTime scheduledAt,
  }) async {
    if (scheduledAt.isBefore(DateTime.now())) return;

    final tzTime = tz.TZDateTime.from(scheduledAt, tz.local);

    final androidDetails = AndroidNotificationDetails(
      _channelId,
      _channelName,
      channelDescription: _channelDescription,
      importance: Importance.max,
      priority: Priority.high,
      category: AndroidNotificationCategory.reminder,
      actions: const [
        AndroidNotificationAction(actionTaken, 'تم أخذها'),
        AndroidNotificationAction(actionSnooze, 'تأجيل 10 دقائق'),
      ],
    );
    const iosDetails = DarwinNotificationDetails(
      categoryIdentifier: 'DOSE_REMINDER',
    );

    await _plugin.zonedSchedule(
      notificationId,
      'حان وقت الدواء: $medicationName',
      'الجرعة: $dosage',
      tzTime,
      NotificationDetails(android: androidDetails, iOS: iosDetails),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      payload: doseId,
    );
  }

  Future<void> cancelNotification(int notificationId) async {
    await _plugin.cancel(notificationId);
  }

  Future<void> cancelAll() async {
    await _plugin.cancelAll();
  }
}
