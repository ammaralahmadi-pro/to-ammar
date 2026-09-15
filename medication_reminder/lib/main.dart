import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:provider/provider.dart';

import 'providers/medication_provider.dart';
import 'screens/home_screen.dart';
import 'services/notification_service.dart';
import 'theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // مطلوب قبل أي استخدام لـ DateFormat بلغة 'ar'، وإلا يرمي استثناء عند بناء
  // أي واجهة تعرض تاريخًا أو وقتًا.
  await initializeDateFormatting('ar');
  await NotificationService.instance.init();
  runApp(const MedicationReminderApp());
}

class MedicationReminderApp extends StatefulWidget {
  const MedicationReminderApp({super.key});

  @override
  State<MedicationReminderApp> createState() => _MedicationReminderAppState();
}

class _MedicationReminderAppState extends State<MedicationReminderApp> {
  late final MedicationProvider _provider;
  StreamSubscription<String>? _subscription;

  @override
  void initState() {
    super.initState();
    _provider = MedicationProvider()..load();
    // عند الضغط على زر إشعار (تم أخذها/تأجيل) بينما التطبيق مفتوح أو في الخلفية،
    // أعد تحميل البيانات من قاعدة البيانات كي تنعكس الحالة فورًا في الواجهة.
    _subscription = NotificationService
        .instance.doseChangedFromNotification.stream
        .listen((_) => _provider.load());
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: _provider,
      child: MaterialApp(
        title: 'تذكير الأدوية',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.themeData(),
        builder: (context, child) {
          return Directionality(
            textDirection: TextDirection.rtl,
            child: child!,
          );
        },
        home: const HomeScreen(),
      ),
    );
  }
}
