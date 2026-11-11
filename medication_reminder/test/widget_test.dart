import 'package:flutter_test/flutter_test.dart';

import 'package:medication_reminder/main.dart';

void main() {
  testWidgets('التطبيق يبدأ ويعرض الشاشة الرئيسية', (WidgetTester tester) async {
    await tester.pumpWidget(const MedicationReminderApp());
    await tester.pump();
    expect(find.text('أدويتي'), findsOneWidget);
  });
}
