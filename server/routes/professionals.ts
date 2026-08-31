import { Router, Request, Response } from 'express';
import { db, Professional, ActivityItem } from '../db.js';

export const professionalsRouter = Router();

// GET /api/professionals
professionalsRouter.get('/', (req: Request, res: Response) => {
  const professionals = db.get('professionals');
  res.json(professionals);
});

// POST /api/professionals
professionalsRouter.post('/', (req: Request, res: Response) => {
  const professionals = db.get('professionals');
  const newProf: Professional = {
    ...req.body,
    id: req.body.id || `prof-${Date.now()}`,
    status: req.body.status || 'disponible',
    monthlyBookings: req.body.monthlyBookings || 0,
    specialties: req.body.specialties || [],
  };

  const updated = [newProf, ...professionals];
  db.set('professionals', updated);

  const activities = db.get('activities');
  const newActivity: ActivityItem = {
    id: `act-${Date.now()}`,
    title: `Nuevo profesional registrado: ${newProf.name} (${newProf.role})`,
    timeAgo: 'Justo ahora',
    type: 'new_client',
    timestamp: new Date().toISOString(),
  };
  db.set('activities', [newActivity, ...activities.slice(0, 49)]);

  res.status(201).json(newProf);
});

// PUT /api/professionals/:id
professionalsRouter.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const professionals = db.get('professionals');
  const index = professionals.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Profesional no encontrado' });
  }

  const updatedProf: Professional = {
    ...professionals[index],
    ...req.body,
    id,
  };

  professionals[index] = updatedProf;
  db.set('professionals', [...professionals]);

  res.json(updatedProf);
});

// DELETE /api/professionals/:id
professionalsRouter.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const professionals = db.get('professionals');
  const filtered = professionals.filter((p) => p.id !== id);

  if (filtered.length === professionals.length) {
    return res.status(404).json({ error: 'Profesional no encontrado' });
  }

  db.set('professionals', filtered);
  res.json({ success: true, id });
});
