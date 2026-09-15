import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/dose.dart';
import '../models/medication.dart';

class MedicationCard extends StatelessWidget {
  final Medication medication;
  final Dose? nextDose;
  final VoidCallback onTap;

  const MedicationCard({
    super.key,
    required this.medication,
    required this.nextDose,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final timeFormat = DateFormat('hh:mm a', 'ar');
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        onTap: onTap,
        leading: CircleAvatar(
          backgroundColor:
              medication.isFinished ? Colors.grey.shade300 : Colors.teal.shade100,
          child: const Icon(Icons.medication),
        ),
        title: Text(medication.name, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(
          medication.isFinished
              ? 'انتهت مدة العلاج'
              : nextDose != null
                  ? 'الجرعة القادمة: ${timeFormat.format(nextDose!.scheduledAt)} — ${medication.dosage}'
                  : 'لا توجد جرعات متبقية',
        ),
        trailing: const Icon(Icons.chevron_left),
      ),
    );
  }
}
