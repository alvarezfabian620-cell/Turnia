import { Router, Request, Response } from 'express';
import { getPool, ActivityItem } from '../db.js';
import { broadcastEvent } from '../websocket.js';

export const activitiesRouter = Router();

// GET /api/activities
activitiesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [rows]: any = await pool.query('SELECT * FROM activities ORDER BY timestamp DESC LIMIT 50');
    const activities: ActivityItem[] = rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      clientName: r.client_name || undefined,
      timeAgo: r.time_ago || 'Reciente',
      type: r.type,
      amount: r.amount ? Number(r.amount) : undefined,
      timestamp: r.timestamp,
    }));
    res.json(activities);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/activities (Clear all notifications)
activitiesRouter.delete('/', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM activities');
    broadcastEvent({
      type: 'DATA_UPDATE',
      entity: 'activities',
      message: 'Todas las notificaciones han sido eliminadas.',
    });
    res.json({ success: true, message: 'Todas las notificaciones han sido eliminadas.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/activities/:id (Delete specific notification)
activitiesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    await pool.query('DELETE FROM activities WHERE id = ?', [id]);
    broadcastEvent({
      type: 'DATA_UPDATE',
      entity: 'activities',
      data: { id },
    });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
