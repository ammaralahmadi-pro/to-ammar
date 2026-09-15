import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../models/dose.dart';
import '../providers/medication_provider.dart';
import 'add_medication_screen.dart';

class MedicationDetailScreen extends StatelessWidget {
  final String medicationId;

  const MedicationDetailScreen({super.key, required this.medicationId});

  @override
  Widget build(BuildContext context) {
    return Consumer<MedicationProvider>(
      builder: (context, provider, _) {
        final matches = provider.medications.where((m) => m.id == medicationId);
        final medication = matches.isEmpty ? null : matches.first;

        if (medication == null) {
          return Scaffold(
            appBar: AppBar(),
            body: const Center(child: Text('تم حذف هذا الدواء')),
          );
        }

        final doses = provider.dosesFor(medicationId);
        final adherence = provider.adherenceFor(medicationId);
        final dateFormat = DateFormat('EEE d MMM، hh:mm a', 'ar');

        return Scaffold(
          appBar: AppBar(
            title: Text(medication.name),
            actions: [
              IconButton(
                icon: const Icon(Icons.edit_outlined),
                onPressed: () => Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => AddMedicationScreen(existing: medication),
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline),
                onPressed: () async {
                  final confirm = await showDialog<bool>(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      title: const Text('حذف الدواء'),
                      content: Text('هل تريد حذف "${medication.name}" وكل جرعاته؟'),
                      actions: [
                        TextButton(
                            onPressed: () => Navigator.pop(ctx, false),
                            child: const Text('إلغاء')),
                        TextButton(
                            onPressed: () => Navigator.pop(ctx, true),
                            child: const Text('حذف')),
                      ],
                    ),
                  );
                  if (confirm == true) {
                    await provider.deleteMedication(medicationId);
                    if (context.mounted) Navigator.of(context).pop();
                  }
                },
              ),
            ],
          ),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('الجرعة: ${medication.dosage}'),
                      Text('عدد المرات باليوم: ${medication.timesPerDay}'),
                      Text('مدة العلاج: ${medication.durationDays} يوم'),
                      if (medication.totalQuantity != null)
                        Text('الكمية المتوفرة: ${medication.totalQuantity}'),
                      if (medication.notes != null && medication.notes!.isNotEmpty)
                        Text('ملاحظات: ${medication.notes}'),
                      const SizedBox(height: 12),
                      Text('نسبة الالتزام: ${(adherence * 100).toStringAsFixed(0)}%'),
                      LinearProgressIndicator(value: adherence),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text('جدول الجرعات', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 8),
              ...doses.map((dose) => _DoseTile(
                    dose: dose,
                    formattedTime: dateFormat.format(dose.scheduledAt),
                    onMarkTaken: () => provider.markDoseTaken(dose.id),
                  )),
            ],
          ),
        );
      },
    );
  }
}

class _DoseTile extends StatelessWidget {
  final Dose dose;
  final String formattedTime;
  final VoidCallback onMarkTaken;

  const _DoseTile({
    required this.dose,
    required this.formattedTime,
    required this.onMarkTaken,
  });

  @override
  Widget build(BuildContext context) {
    final taken = dose.status == DoseStatus.taken;
    return ListTile(
      leading: Icon(
        taken ? Icons.check_circle : Icons.radio_button_unchecked,
        color: taken ? Colors.green : Colors.grey,
      ),
      title: Text(formattedTime),
      subtitle: taken ? const Text('تم أخذها') : const Text('لم تُؤخذ بعد'),
      trailing: taken
          ? null
          : TextButton(onPressed: onMarkTaken, child: const Text('تعليم كمأخوذة')),
    );
  }
}
