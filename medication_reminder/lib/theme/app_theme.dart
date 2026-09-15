import 'package:flutter/material.dart';

/// ألوان وأنماط مستوحاة من تصميم "Pharmacy App" (Freepik UI Kit):
/// تدرّج أزرق-تركواز إلى وردي كشعار/لون مميز، خلفية بنفسجية فاتحة جدًا،
/// بطاقات بيضاء ناعمة بزوايا دائرية كبيرة وأفاتار دائري متعدد الألوان.
class AppTheme {
  AppTheme._();

  static const Color primaryBlue = Color(0xFF57C6EA);
  static const Color primaryBlueDark = Color(0xFF2E5FA3);
  static const Color accentPink = Color(0xFFF06E9D);
  static const Color surfaceBackground = Color(0xFFF2F3FA);
  static const Color textDark = Color(0xFF2E3A59);

  static const List<Color> avatarPalette = [primaryBlue, accentPink];

  static const LinearGradient logoGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primaryBlue, accentPink],
  );

  /// لون أفاتار متبدّل (أزرق/وردي) حسب مُعرّف العنصر، بنفس أسلوب قوائم
  /// الأطباء المتناوبة الألوان في تصميم الـ UI Kit.
  static Color avatarColorFor(String id) => avatarPalette[id.hashCode.abs() % avatarPalette.length];

  static ThemeData themeData() {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: primaryBlue,
      primary: primaryBlue,
      secondary: accentPink,
      surface: Colors.white,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: surfaceBackground,
      appBarTheme: const AppBarTheme(
        backgroundColor: surfaceBackground,
        foregroundColor: textDark,
        centerTitle: false,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: TextStyle(
          color: textDark,
          fontSize: 20,
          fontWeight: FontWeight.w800,
        ),
        iconTheme: IconThemeData(color: textDark),
      ),
      cardTheme: CardTheme(
        color: Colors.white,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: primaryBlue,
        foregroundColor: Colors.white,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: primaryBlue,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
          padding: const EdgeInsets.symmetric(vertical: 14),
          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        ),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith(
          (states) => states.contains(WidgetState.selected) ? accentPink : null,
        ),
        trackColor: WidgetStateProperty.resolveWith(
          (states) => states.contains(WidgetState.selected) ? accentPink.withOpacity(0.5) : null,
        ),
      ),
      sliderTheme: const SliderThemeData(
        activeTrackColor: primaryBlue,
        thumbColor: primaryBlue,
        overlayColor: Color(0x3357C6EA),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: primaryBlue.withOpacity(0.1),
        side: BorderSide.none,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        labelStyle: const TextStyle(color: primaryBlueDark, fontWeight: FontWeight.w600),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        focusedBorder: const OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
          borderSide: BorderSide(color: primaryBlue, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      textTheme: const TextTheme(
        titleLarge: TextStyle(color: textDark, fontWeight: FontWeight.w800),
        titleMedium: TextStyle(color: textDark, fontWeight: FontWeight.w700),
        bodyLarge: TextStyle(color: textDark),
        bodyMedium: TextStyle(color: textDark),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(color: accentPink),
    );
  }
}
