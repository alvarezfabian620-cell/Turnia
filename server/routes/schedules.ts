import { Router, Request, Response } from 'express';
import { db, DaySchedule, ActivityItem } from '../db.js';

export const schedulesRouter = Router();

// GET /api/schedules
schedulesRouter.get('/', (req: Request, res: Response) => {
  const schedules = db.get('schedules');
  res.json(schedules);
});

// PUT /api/schedules
schedulesRouter.put('/', (req: Request, res: Response) => {
  const updatedSchedules: DaySchedule[] = req.body;
  db.set('schedules', updatedSchedules);

  const activities = db.get('activities');
  const newActivity: ActivityItem = {
    id: `act-${Date.now()}`,
    title: 'Jornadas y horarios comerciales actualizados',
    timeAgo: 'Justo ahora',
    type: 'schedule_update',
    timestamp: new Date().toISOString(),
  };
  db.set('activities', [newActivity, ...activities.slice(0, 49)]);

  res.json(updatedSchedules);
});
