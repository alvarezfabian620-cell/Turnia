import { Router, Request, Response } from 'express';
import { db, ServiceItem, ActivityItem } from '../db.js';

export const servicesRouter = Router();

// GET /api/services
servicesRouter.get('/', (req: Request, res: Response) => {
  const services = db.get('services');
  res.json(services);
});

// POST /api/services
servicesRouter.post('/', (req: Request, res: Response) => {
  const services = db.get('services');
  const newService: ServiceItem = {
    ...req.body,
    id: req.body.id || `srv-${Date.now()}`,
    active: req.body.active !== undefined ? req.body.active : true,
  };

  const updated = [newService, ...services];
  db.set('services', updated);

  // Add activity
  const activities = db.get('activities');
  const newActivity: ActivityItem = {
    id: `act-${Date.now()}`,
    title: `Nuevo servicio creado: ${newService.name} ($${newService.price})`,
    timeAgo: 'Justo ahora',
    type: 'new_booking',
    timestamp: new Date().toISOString(),
  };
  db.set('activities', [newActivity, ...activities.slice(0, 49)]);

  res.status(201).json(newService);
});

// PUT /api/services/:id
servicesRouter.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const services = db.get('services');
  const index = services.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Servicio no encontrado' });
  }

  const updatedService: ServiceItem = {
    ...services[index],
    ...req.body,
    id,
  };

  services[index] = updatedService;
  db.set('services', [...services]);

  res.json(updatedService);
});

// DELETE /api/services/:id
servicesRouter.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const services = db.get('services');
  const filtered = services.filter((s) => s.id !== id);

  if (filtered.length === services.length) {
    return res.status(404).json({ error: 'Servicio no encontrado' });
  }

  db.set('services', filtered);
  res.json({ success: true, id });
});
