import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

import '../models/dose.dart';
import '../models/medication.dart';

class DatabaseService {
  DatabaseService._internal();
  static final DatabaseService instance = DatabaseService._internal();

  Database? _db;

  Future<Database> get database async {
    _db ??= await _initDb();
    return _db!;
  }

  Future<Database> _initDb() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'medication_reminder.db');
    return openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE medications (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            dosage TEXT NOT NULL,
            totalQuantity REAL,
            timesPerDay INTEGER NOT NULL,
            doseTimes TEXT NOT NULL,
            durationDays INTEGER NOT NULL,
            startDate TEXT NOT NULL,
            notes TEXT,
            isActive INTEGER NOT NULL DEFAULT 1
          )
        ''');
        await db.execute('''
          CREATE TABLE doses (
            id TEXT PRIMARY KEY,
            medicationId TEXT NOT NULL,
            scheduledAt TEXT NOT NULL,
            status TEXT NOT NULL,
            takenAt TEXT,
            notificationId INTEGER NOT NULL,
            FOREIGN KEY (medicationId) REFERENCES medications (id) ON DELETE CASCADE
          )
        ''');
      },
      onConfigure: (db) async {
        await db.execute('PRAGMA foreign_keys = ON');
      },
    );
  }

  // ---------- الأدوية ----------

  Future<void> insertMedication(Medication medication) async {
    final db = await database;
    await db.insert('medications', medication.toMap());
  }

  Future<void> updateMedication(Medication medication) async {
    final db = await database;
    await db.update(
      'medications',
      medication.toMap(),
      where: 'id = ?',
      whereArgs: [medication.id],
    );
  }

  Future<void> deleteMedication(String id) async {
    final db = await database;
    await db.delete('doses', where: 'medicationId = ?', whereArgs: [id]);
    await db.delete('medications', where: 'id = ?', whereArgs: [id]);
  }

  Future<List<Medication>> getAllMedications() async {
    final db = await database;
    final rows = await db.query('medications', orderBy: 'startDate DESC');
    return rows.map((row) => Medication.fromMap(row)).toList();
  }

  // ---------- الجرعات ----------

  Future<void> insertDoses(List<Dose> doses) async {
    final db = await database;
    final batch = db.batch();
    for (final dose in doses) {
      batch.insert('doses', dose.toMap());
    }
    await batch.commit(noResult: true);
  }

  Future<void> deleteDosesForMedication(String medicationId) async {
    final db = await database;
    await db.delete('doses', where: 'medicationId = ?', whereArgs: [medicationId]);
  }

  Future<List<Dose>> getDosesForMedication(String medicationId) async {
    final db = await database;
    final rows = await db.query(
      'doses',
      where: 'medicationId = ?',
      whereArgs: [medicationId],
      orderBy: 'scheduledAt ASC',
    );
    return rows.map((row) => Dose.fromMap(row)).toList();
  }

  Future<List<Dose>> getUpcomingDoses() async {
    final db = await database;
    final rows = await db.query(
      'doses',
      where: 'status = ?',
      whereArgs: [DoseStatus.pending.name],
      orderBy: 'scheduledAt ASC',
    );
    return rows.map((row) => Dose.fromMap(row)).toList();
  }

  Future<void> updateDoseStatus(String doseId, DoseStatus status, {DateTime? takenAt}) async {
    final db = await database;
    await db.update(
      'doses',
      {
        'status': status.name,
        'takenAt': takenAt?.toIso8601String(),
      },
      where: 'id = ?',
      whereArgs: [doseId],
    );
  }

  Future<Dose?> getDoseById(String doseId) async {
    final db = await database;
    final rows = await db.query('doses', where: 'id = ?', whereArgs: [doseId]);
    if (rows.isEmpty) return null;
    return Dose.fromMap(rows.first);
  }
}
