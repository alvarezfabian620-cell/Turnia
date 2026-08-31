import { Router, Request, Response } from 'express';
import { db, BusinessConfig, ActivityItem } from '../db.js';

export const businessRouter = Router();

// GET /api/business
businessRouter.get('/', (req: Request, res: Response) => {
  const config = db.get('businessConfig');
  res.json(config);
});

// PUT /api/business
businessRouter.put('/', (req: Request, res: Response) => {
  const updated: BusinessConfig = req.body;
  db.set('businessConfig', updated);

  // Add audit activity
  const activities = db.get('activities');
  const newActivity: ActivityItem = {
    id: `act-${Date.now()}`,
    title: `Configuración del negocio actualizada: ${updated.name}`,
    timeAgo: 'Justo ahora',
    type: 'schedule_update',
    timestamp: new Date().toISOString(),
  };
  db.set('activities', [newActivity, ...activities.slice(0, 49)]);

  res.json(updated);
});
