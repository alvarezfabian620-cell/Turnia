import { Router, Request, Response } from 'express';
import { db } from '../db.js';

export const activitiesRouter = Router();

// GET /api/activities
activitiesRouter.get('/', (req: Request, res: Response) => {
  const activities = db.get('activities');
  res.json(activities);
});
