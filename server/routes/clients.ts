import { Router, Request, Response } from 'express';
import { getPool, ClientItem } from '../db.js';
import { broadcastEvent, broadcastNotification } from '../websocket.js';

export const clientsRouter = Router();

// GET /api/clients
clientsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [rows]: any = await pool.query('SELECT * FROM clients ORDER BY name ASC');
    const clients: ClientItem[] = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      phone: r.phone || '',
      email: r.email || '',
      totalVisits: r.total_visits || 0,
      lastVisit: r.last_visit || '',
      notes: r.notes || '',
    }));
    res.json(clients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clients
clientsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const id = req.body.id || `cli-${Date.now()}`;
    const newClient: ClientItem = {
      id,
      name: req.body.name,
      phone: req.body.phone || '',
      email: req.body.email || '',
      totalVisits: req.body.totalVisits || 0,
      lastVisit: req.body.lastVisit || new Date().toISOString().split('T')[0],
      notes: req.body.notes || '',
    };

    await pool.query(
      `INSERT INTO clients (id, name, phone, email, total_visits, last_visit, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        newClient.id,
        newClient.name,
        newClient.phone,
        newClient.email,
        newClient.totalVisits,
        newClient.lastVisit,
        newClient.notes,
      ]
    );

    // Audit activity
    const activityItem = {
      id: `act-${Date.now()}`,
      title: `Nuevo cliente registrado: ${newClient.name}`,
      clientName: newClient.name,
      timeAgo: 'Justo ahora',
      type: 'new_client',
      amount: null,
      timestamp: new Date().toISOString(),
    };

    await pool.query(
      `INSERT INTO activities (id, title, client_name, time_ago, type, amount, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        activityItem.id,
        activityItem.title,
        activityItem.clientName,
        activityItem.timeAgo,
        activityItem.type,
        activityItem.amount,
        activityItem.timestamp,
      ]
    );

    broadcastNotification(activityItem);
    broadcastEvent({
      type: 'DATA_UPDATE',
      entity: 'clients',
      data: newClient,
    });

    res.status(201).json(newClient);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/clients/:id
clientsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [rows]: any = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const current = rows[0];
    const name = req.body.name !== undefined ? req.body.name : current.name;
    const phone = req.body.phone !== undefined ? req.body.phone : current.phone;
    const email = req.body.email !== undefined ? req.body.email : current.email;
    const totalVisits = req.body.totalVisits !== undefined ? req.body.totalVisits : current.total_visits;
    const lastVisit = req.body.lastVisit !== undefined ? req.body.lastVisit : current.last_visit;
    const notes = req.body.notes !== undefined ? req.body.notes : current.notes;

    await pool.query(
      `UPDATE clients SET name = ?, phone = ?, email = ?, total_visits = ?, last_visit = ?, notes = ?
       WHERE id = ?`,
      [name, phone, email, totalVisits, lastVisit, notes, id]
    );

    const updatedClient: ClientItem = {
      id,
      name,
      phone,
      email,
      totalVisits,
      lastVisit,
      notes,
    };

    broadcastEvent({
      type: 'DATA_UPDATE',
      entity: 'clients',
      data: updatedClient,
    });

    res.json(updatedClient);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/clients/:id
clientsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [clientRows]: any = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);
    if (clientRows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const client = clientRows[0];

    // Delete client from clients table
    await pool.query('DELETE FROM clients WHERE id = ?', [id]);

    // Also delete user account if exists so they can re-register freshly
    if (client.email && client.email.trim()) {
      await pool.query('DELETE FROM users WHERE LOWER(email) = LOWER(?)', [client.email.trim()]);
    }
    if (client.name && client.name.trim()) {
      await pool.query('DELETE FROM users WHERE LOWER(name) = LOWER(?)', [client.name.trim()]);
    }

    broadcastEvent({
      type: 'DATA_UPDATE',
      entity: 'clients',
      data: { id, deleted: true },
    });

    res.json({ success: true, id, message: 'Cliente y cuenta de acceso eliminados exitosamente.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
