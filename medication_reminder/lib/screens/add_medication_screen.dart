import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';

import '../models/medication.dart';
import '../providers/medication_provider.dart';
import '../utils/dose_time_utils.dart';

const _uuid = Uuid();

class AddMedicationScreen extends StatefulWidget {
  final Medication? existing;

  const AddMedicationScreen({super.key, this.existing});

  @override
  State<AddMedicationScreen> createState() => _AddMedicationScreenState();
}

class _AddMedicationScreenState extends State<AddMedicationScreen> {
  final _formKey = GlobalKey<FormState>();

  late final TextEditingController _nameController;
  late final TextEditingController _dosageController;
  late final TextEditingController _quantityController;
  late final TextEditingController _durationController;
  late final TextEditingController _notesController;

  int _timesPerDay = 1;
  List<TimeOfDay> _doseTimes = [const TimeOfDay(hour: 9, minute: 0)];
  DateTime _startDate = DateTime.now();
  bool _autoDistribute = true;

  bool get _isEditing => widget.existing != null;

  @override
  void initState() {
    super.initState();
    final med = widget.existing;
    _nameController = TextEditingController(text: med?.name ?? '');
    _dosageController = TextEditingController(text: med?.dosage ?? '');
    _quantityController =
        TextEditingController(text: med?.totalQuantity?.toString() ?? '');
    _durationController =
        TextEditingController(text: med?.durationDays.toString() ?? '7');
    _notesController = TextEditingController(text: med?.notes ?? '');

    if (med != null) {
      _timesPerDay = med.timesPerDay;
      _startDate = med.startDate;
      _doseTimes = med.doseTimes.map((t) {
        final (h, m) = parseTimeOfDay(t);
        return TimeOfDay(hour: h, minute: m);
      }).toList();
      _autoDistribute = false;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _dosageController.dispose();
    _quantityController.dispose();
    _durationController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _syncDoseTimesCount() {
    if (!_autoDistribute) {
      setState(() {
        if (_doseTimes.length < _timesPerDay) {
          _doseTimes.addAll(List.generate(
            _timesPerDay - _doseTimes.length,
            (_) => const TimeOfDay(hour: 9, minute: 0),
          ));
        } else if (_doseTimes.length > _timesPerDay) {
          _doseTimes = _doseTimes.sublist(0, _timesPerDay);
        }
      });
    }
  }

  List<String> _resolveDoseTimes() {
    if (_autoDistribute) {
      return distributeDoseTimesEvenly(_timesPerDay);
    }
    return _doseTimes
        .map((t) =>
            '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}')
        .toList();
  }

  Future<void> _pickTime(int index) async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _doseTimes[index],
    );
    if (picked != null) {
      setState(() => _doseTimes[index] = picked);
    }
  }

  Future<void> _pickStartDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _startDate,
      firstDate: DateTime.now().subtract(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() => _startDate = picked);
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    final medication = Medication(
      id: widget.existing?.id ?? _uuid.v4(),
      name: _nameController.text.trim(),
      dosage: _dosageController.text.trim(),
      totalQuantity: _quantityController.text.trim().isEmpty
          ? null
          : double.tryParse(_quantityController.text.trim()),
      timesPerDay: _timesPerDay,
      doseTimes: _resolveDoseTimes(),
      durationDays: int.parse(_durationController.text.trim()),
      startDate: _startDate,
      notes: _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
    );

    final provider = context.read<MedicationProvider>();
    if (_isEditing) {
      await provider.updateMedication(medication);
    } else {
      await provider.addMedication(medication);
    }

    if (mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_isEditing ? 'تعديل الدواء' : 'إضافة دواء جديد')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'اسم الدواء *'),
              validator: (v) => (v == null || v.trim().isEmpty) ? 'مطلوب' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _dosageController,
              decoration: const InputDecoration(
                labelText: 'الجرعة *',
                hintText: 'مثال: 500 ملغ، حبة واحدة، 5 مل',
              ),
              validator: (v) => (v == null || v.trim().isEmpty) ? 'مطلوب' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _quantityController,
              decoration: const InputDecoration(
                labelText: 'الكمية الكلية المتوفرة (اختياري)',
              ),
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
            ),
            const SizedBox(height: 20),
            Text('عدد المرات في اليوم', style: Theme.of(context).textTheme.titleSmall),
            Slider(
              value: _timesPerDay.toDouble(),
              min: 1,
              max: 6,
              divisions: 5,
              label: '$_timesPerDay',
              onChanged: (v) {
                setState(() => _timesPerDay = v.round());
                _syncDoseTimesCount();
              },
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('توزيع الأوقات تلقائيًا بالتساوي'),
              value: _autoDistribute,
              onChanged: (v) {
                setState(() => _autoDistribute = v);
                _syncDoseTimesCount();
              },
            ),
            if (!_autoDistribute) ...[
              const SizedBox(height: 8),
              Text('أوقات الجرعات', style: Theme.of(context).textTheme.titleSmall),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: List.generate(_doseTimes.length, (i) {
                  final t = _doseTimes[i];
                  return ActionChip(
                    label: Text(t.format(context)),
                    avatar: const Icon(Icons.access_time, size: 18),
                    onPressed: () => _pickTime(i),
                  );
                }),
              ),
            ],
            const SizedBox(height: 20),
            TextFormField(
              controller: _durationController,
              decoration: const InputDecoration(labelText: 'عدد أيام العلاج *'),
              keyboardType: TextInputType.number,
              validator: (v) {
                final n = int.tryParse(v?.trim() ?? '');
                if (n == null || n <= 0) return 'أدخل عددًا صحيحًا أكبر من صفر';
                return null;
              },
            ),
            const SizedBox(height: 12),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('تاريخ البدء'),
              subtitle: Text('${_startDate.year}/${_startDate.month}/${_startDate.day}'),
              trailing: const Icon(Icons.calendar_today),
              onTap: _pickStartDate,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _notesController,
              decoration: const InputDecoration(
                labelText: 'ملاحظات (اختياري)',
                hintText: 'قبل الأكل / بعد الأكل / مع الماء...',
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _save,
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Text(_isEditing ? 'حفظ التعديلات' : 'إضافة الدواء'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
