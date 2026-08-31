import { Router, Request, Response } from 'express';
import { db, ClientItem, ActivityItem } from '../db.js';

export const clientsRouter = Router();

// GET /api/clients
clientsRouter.get('/', (req: Request, res: Response) => {
  const clients = db.get('clients');
  res.json(clients);
});

// POST /api/clients
clientsRouter.post('/', (req: Request, res: Response) => {
  const clients = db.get('clients');
  const newClient: ClientItem = {
    ...req.body,
    id: req.body.id || `cli-${Date.now()}`,
    totalVisits: req.body.totalVisits || 0,
    lastVisit: req.body.lastVisit || new Date().toISOString().split('T')[0],
  };

  const updated = [newClient, ...clients];
  db.set('clients', updated);

  const activities = db.get('activities');
  const newActivity: ActivityItem = {
    id: `act-${Date.now()}`,
    title: `Nuevo cliente registrado: ${newClient.name}`,
    timeAgo: 'Justo ahora',
    type: 'new_client',
    timestamp: new Date().toISOString(),
  };
  db.set('activities', [newActivity, ...activities.slice(0, 49)]);

  res.status(201).json(newClient);
});

// PUT /api/clients/:id
clientsRouter.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const clients = db.get('clients');
  const index = clients.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  const updatedClient: ClientItem = {
    ...clients[index],
    ...req.body,
    id,
  };

  clients[index] = updatedClient;
  db.set('clients', [...clients]);

  res.json(updatedClient);
});

// DELETE /api/clients/:id
clientsRouter.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const clients = db.get('clients');
  const filtered = clients.filter((c) => c.id !== id);

  if (filtered.length === clients.length) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  db.set('clients', filtered);
  res.json({ success: true, id });
});
