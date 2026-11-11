import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';

import '../models/dose.dart';
import '../models/medication.dart';
import '../services/database_service.dart';
import '../services/notification_service.dart';
import '../utils/dose_time_utils.dart';

const _uuid = Uuid();

class MedicationProvider extends ChangeNotifier {
  final _db = DatabaseService.instance;
  final _notifications = NotificationService.instance;

  List<Medication> _medications = [];
  final Map<String, List<Dose>> _dosesByMedication = {};

  List<Medication> get medications => List.unmodifiable(_medications);

  List<Dose> dosesFor(String medicationId) =>
      List.unmodifiable(_dosesByMedication[medicationId] ?? const []);

  /// أقرب جرعة قادمة (لم تُؤخذ بعد) لكل دواء نشط
  Dose? nextDoseFor(String medicationId) {
    final doses = _dosesByMedication[medicationId] ?? const [];
    final now = DateTime.now();
    final pending = doses
        .where((d) => d.status == DoseStatus.pending)
        .toList()
      ..sort((a, b) => a.scheduledAt.compareTo(b.scheduledAt));
    if (pending.isEmpty) return null;
    // أقرب جرعة سواء كانت فائتة أو قادمة
    return pending.firstWhere(
      (d) => d.scheduledAt.isAfter(now),
      orElse: () => pending.first,
    );
  }

  Future<void> load() async {
    _medications = await _db.getAllMedications();
    for (final med in _medications) {
      _dosesByMedication[med.id] = await _db.getDosesForMedication(med.id);
    }
    notifyListeners();
  }

  int _notificationIdFor(String doseId) => doseId.hashCode & 0x7FFFFFFF;

  List<Dose> _buildDoseSchedule(Medication medication) {
    final doses = <Dose>[];
    final startDay = DateTime(
      medication.startDate.year,
      medication.startDate.month,
      medication.startDate.day,
    );

    for (var day = 0; day < medication.durationDays; day++) {
      final date = startDay.add(Duration(days: day));
      for (final timeStr in medication.doseTimes) {
        final (hour, minute) = parseTimeOfDay(timeStr);
        final scheduledAt =
            DateTime(date.year, date.month, date.day, hour, minute);
        final doseId = _uuid.v4();
        doses.add(Dose(
          id: doseId,
          medicationId: medication.id,
          scheduledAt: scheduledAt,
          notificationId: _notificationIdFor(doseId),
        ));
      }
    }
    return doses;
  }

  Future<void> addMedication(Medication medication) async {
    await _db.insertMedication(medication);
    final doses = _buildDoseSchedule(medication);
    await _db.insertDoses(doses);

    for (final dose in doses) {
      await _notifications.scheduleDoseNotification(
        notificationId: dose.notificationId,
        doseId: dose.id,
        medicationName: medication.name,
        dosage: medication.dosage,
        scheduledAt: dose.scheduledAt,
      );
    }

    await load();
  }

  Future<void> updateMedication(Medication medication) async {
    // أعد بناء الجدول بالكامل عند التعديل: أبسط وأكثر أمانًا من محاولة
    // مطابقة الجرعات القديمة (تُلغى الإشعارات المعلّقة القديمة وتُنشأ جديدة).
    final oldDoses = _dosesByMedication[medication.id] ?? const [];
    for (final dose in oldDoses) {
      if (dose.status == DoseStatus.pending) {
        await _notifications.cancelNotification(dose.notificationId);
      }
    }
    await _db.deleteDosesForMedication(medication.id);
    await _db.updateMedication(medication);

    final doses = _buildDoseSchedule(medication);
    await _db.insertDoses(doses);
    for (final dose in doses) {
      await _notifications.scheduleDoseNotification(
        notificationId: dose.notificationId,
        doseId: dose.id,
        medicationName: medication.name,
        dosage: medication.dosage,
        scheduledAt: dose.scheduledAt,
      );
    }

    await load();
  }

  Future<void> deleteMedication(String medicationId) async {
    final doses = _dosesByMedication[medicationId] ?? const [];
    for (final dose in doses) {
      await _notifications.cancelNotification(dose.notificationId);
    }
    await _db.deleteMedication(medicationId);
    _medications.removeWhere((m) => m.id == medicationId);
    _dosesByMedication.remove(medicationId);
    notifyListeners();
  }

  Future<void> markDoseTaken(String doseId) async {
    final now = DateTime.now();
    for (final entry in _dosesByMedication.entries) {
      final idx = entry.value.indexWhere((d) => d.id == doseId);
      if (idx != -1) {
        final dose = entry.value[idx];
        await _db.updateDoseStatus(doseId, DoseStatus.taken, takenAt: now);
        await _notifications.cancelNotification(dose.notificationId);
        entry.value[idx] = dose.copyWith(status: DoseStatus.taken, takenAt: now);
        notifyListeners();
        return;
      }
    }
  }

  Future<void> snoozeDose(String doseId, {Duration by = const Duration(minutes: 10)}) async {
    for (final entry in _dosesByMedication.entries) {
      final idx = entry.value.indexWhere((d) => d.id == doseId);
      if (idx != -1) {
        final dose = entry.value[idx];
        final medication = _medications.firstWhere((m) => m.id == dose.medicationId);
        final newTime = DateTime.now().add(by);
        await _notifications.scheduleDoseNotification(
          notificationId: dose.notificationId,
          doseId: dose.id,
          medicationName: medication.name,
          dosage: medication.dosage,
          scheduledAt: newTime,
        );
        return;
      }
    }
  }

  /// نسبة الالتزام لدواء معيّن (الجرعات المأخوذة من إجمالي الجرعات التي حان وقتها بالفعل)
  double adherenceFor(String medicationId) {
    final doses = _dosesByMedication[medicationId] ?? const [];
    final now = DateTime.now();
    final due = doses.where((d) => d.scheduledAt.isBefore(now)).toList();
    if (due.isEmpty) return 0;
    final taken = due.where((d) => d.status == DoseStatus.taken).length;
    return taken / due.length;
  }
}
