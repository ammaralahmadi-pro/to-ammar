enum DoseStatus { pending, taken, skipped }

class Dose {
  final String id;
  final String medicationId;
  final DateTime scheduledAt;
  final DoseStatus status;
  final DateTime? takenAt;
  /// معرّف الإشعار المستخدم في flutter_local_notifications (32-bit int)
  final int notificationId;

  const Dose({
    required this.id,
    required this.medicationId,
    required this.scheduledAt,
    this.status = DoseStatus.pending,
    this.takenAt,
    required this.notificationId,
  });

  Dose copyWith({DoseStatus? status, DateTime? takenAt}) {
    return Dose(
      id: id,
      medicationId: medicationId,
      scheduledAt: scheduledAt,
      status: status ?? this.status,
      takenAt: takenAt ?? this.takenAt,
      notificationId: notificationId,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'medicationId': medicationId,
      'scheduledAt': scheduledAt.toIso8601String(),
      'status': status.name,
      'takenAt': takenAt?.toIso8601String(),
      'notificationId': notificationId,
    };
  }

  factory Dose.fromMap(Map<String, dynamic> map) {
    return Dose(
      id: map['id'] as String,
      medicationId: map['medicationId'] as String,
      scheduledAt: DateTime.parse(map['scheduledAt'] as String),
      status: DoseStatus.values.firstWhere(
        (e) => e.name == map['status'],
        orElse: () => DoseStatus.pending,
      ),
      takenAt:
          map['takenAt'] != null ? DateTime.parse(map['takenAt'] as String) : null,
      notificationId: map['notificationId'] as int,
    );
  }
}
