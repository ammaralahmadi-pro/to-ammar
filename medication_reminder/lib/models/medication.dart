class Medication {
  final String id;
  final String name;
  final String dosage;
  final double? totalQuantity;
  final int timesPerDay;
  /// أوقات الجرعات خلال اليوم، كل عنصر بصيغة "HH:mm"
  final List<String> doseTimes;
  final int durationDays;
  final DateTime startDate;
  final String? notes;
  final bool isActive;

  const Medication({
    required this.id,
    required this.name,
    required this.dosage,
    this.totalQuantity,
    required this.timesPerDay,
    required this.doseTimes,
    required this.durationDays,
    required this.startDate,
    this.notes,
    this.isActive = true,
  });

  DateTime get endDate =>
      DateTime(startDate.year, startDate.month, startDate.day)
          .add(Duration(days: durationDays));

  bool get isFinished => DateTime.now().isAfter(endDate);

  Medication copyWith({
    String? name,
    String? dosage,
    double? totalQuantity,
    int? timesPerDay,
    List<String>? doseTimes,
    int? durationDays,
    DateTime? startDate,
    String? notes,
    bool? isActive,
  }) {
    return Medication(
      id: id,
      name: name ?? this.name,
      dosage: dosage ?? this.dosage,
      totalQuantity: totalQuantity ?? this.totalQuantity,
      timesPerDay: timesPerDay ?? this.timesPerDay,
      doseTimes: doseTimes ?? this.doseTimes,
      durationDays: durationDays ?? this.durationDays,
      startDate: startDate ?? this.startDate,
      notes: notes ?? this.notes,
      isActive: isActive ?? this.isActive,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'dosage': dosage,
      'totalQuantity': totalQuantity,
      'timesPerDay': timesPerDay,
      'doseTimes': doseTimes.join(','),
      'durationDays': durationDays,
      'startDate': startDate.toIso8601String(),
      'notes': notes,
      'isActive': isActive ? 1 : 0,
    };
  }

  factory Medication.fromMap(Map<String, dynamic> map) {
    return Medication(
      id: map['id'] as String,
      name: map['name'] as String,
      dosage: map['dosage'] as String,
      totalQuantity: map['totalQuantity'] as double?,
      timesPerDay: map['timesPerDay'] as int,
      doseTimes: (map['doseTimes'] as String)
          .split(',')
          .where((e) => e.isNotEmpty)
          .toList(),
      durationDays: map['durationDays'] as int,
      startDate: DateTime.parse(map['startDate'] as String),
      notes: map['notes'] as String?,
      isActive: (map['isActive'] as int) == 1,
    );
  }
}
