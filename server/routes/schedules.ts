import { Router, Request, Response } from 'express';
import { getPool, DaySchedule } from '../db.js';

export const schedulesRouter = Router();

// GET /api/schedules
schedulesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [rows]: any = await pool.query('SELECT * FROM schedules ORDER BY day_code ASC');
    const schedules: DaySchedule[] = rows.map((r: any) => ({
      dayCode: r.day_code,
      dayName: r.day_name,
      active: Boolean(r.active),
      blocks: r.blocks ? JSON.parse(r.blocks) : [],
    }));
    res.json(schedules);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/schedules
schedulesRouter.put('/', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const schedules: DaySchedule[] = req.body;

    for (const sch of schedules) {
      await pool.query(
        `INSERT INTO schedules (day_code, day_name, active, blocks)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE day_name = VALUES(day_name), active = VALUES(active), blocks = VALUES(blocks)`,
        [sch.dayCode, sch.dayName, sch.active ? 1 : 0, JSON.stringify(sch.blocks)]
      );
    }

    // Audit activity
    await pool.query(
      `INSERT INTO activities (id, title, client_name, time_ago, type, amount, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `act-${Date.now()}`,
        'Jornadas y horarios comerciales actualizados',
        null,
        'Justo ahora',
        'schedule_update',
        null,
        new Date().toISOString(),
      ]
    );

    res.json(schedules);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
