import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/dose.dart';
import '../models/medication.dart';
import '../theme/app_theme.dart';

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
      margin: const EdgeInsets.only(bottom: 14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              CircleAvatar(
                radius: 26,
                backgroundColor: medication.isFinished
                    ? Colors.grey.shade200
                    : AppTheme.accentOrange.withOpacity(0.18),
                child: Icon(
                  Icons.medication_rounded,
                  color: medication.isFinished ? Colors.grey : AppTheme.accentOrange,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(medication.name,
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                    const SizedBox(height: 6),
                    if (medication.isFinished)
                      const Text('انتهت مدة العلاج', style: TextStyle(color: Colors.grey))
                    else if (nextDose != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryBlue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '${timeFormat.format(nextDose!.scheduledAt)} · ${medication.dosage}',
                          style: const TextStyle(
                            color: AppTheme.primaryBlueDark,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                        ),
                      )
                    else
                      const Text('لا توجد جرعات متبقية', style: TextStyle(color: Colors.grey)),
                  ],
                ),
              ),
              const Icon(Icons.chevron_left, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }
}
