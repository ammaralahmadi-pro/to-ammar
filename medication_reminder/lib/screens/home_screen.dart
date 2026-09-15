import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/medication_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/medication_card.dart';
import 'add_medication_screen.dart';
import 'medication_detail_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('أدويتي')),
      body: Consumer<MedicationProvider>(
        builder: (context, provider, _) {
          final active = provider.medications.where((m) => !m.isFinished).toList();
          final finished = provider.medications.where((m) => m.isFinished).toList();

          if (provider.medications.isEmpty) {
            return const _EmptyState();
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (active.isNotEmpty) ...[
                const Text('الأدوية الحالية',
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primaryBlueDark)),
                const SizedBox(height: 8),
                ...active.map((med) => MedicationCard(
                      medication: med,
                      nextDose: provider.nextDoseFor(med.id),
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => MedicationDetailScreen(medicationId: med.id),
                        ),
                      ),
                    )),
              ],
              if (finished.isNotEmpty) ...[
                const SizedBox(height: 24),
                const Text('أدوية منتهية',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                ...finished.map((med) => MedicationCard(
                      medication: med,
                      nextDose: null,
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => MedicationDetailScreen(medicationId: med.id),
                        ),
                      ),
                    )),
              ],
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const AddMedicationScreen()),
        ),
        icon: const Icon(Icons.add),
        label: const Text('إضافة دواء'),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.medication_outlined, size: 72, color: AppTheme.primaryBlue),
            SizedBox(height: 16),
            Text(
              'لا توجد أدوية مضافة بعد.\nاضغط "إضافة دواء" للبدء بتنظيم جدول علاجك.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontSize: 15),
            ),
          ],
        ),
      ),
    );
  }
}
