/// يوزّع عدد "مرات باليوم" بالتساوي على مدار اليوم (من 08:00 حتى 22:00)
/// ويعيد قائمة أوقات بصيغة "HH:mm".
List<String> distributeDoseTimesEvenly(int timesPerDay) {
  if (timesPerDay <= 0) return [];
  if (timesPerDay == 1) return ['09:00'];

  const startMinutes = 8 * 60; // 08:00
  const endMinutes = 22 * 60; // 22:00
  final span = endMinutes - startMinutes;
  final step = span ~/ (timesPerDay - 1);

  return List.generate(timesPerDay, (i) {
    final minutes = startMinutes + step * i;
    final hour = minutes ~/ 60;
    final minute = minutes % 60;
    return '${hour.toString().padLeft(2, '0')}:${minute.toString().padLeft(2, '0')}';
  });
}

/// يحوّل نص "HH:mm" إلى (hour, minute)
(int, int) parseTimeOfDay(String hhmm) {
  final parts = hhmm.split(':');
  return (int.parse(parts[0]), int.parse(parts[1]));
}
