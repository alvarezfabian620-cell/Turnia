import { Router, Request, Response } from 'express';
import { getPool, ServiceItem } from '../db.js';

export const servicesRouter = Router();

// GET /api/services
servicesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [rows]: any = await pool.query('SELECT * FROM services ORDER BY name ASC');
    const services: ServiceItem[] = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description || '',
      durationMinutes: r.duration_minutes,
      price: Number(r.price),
      active: Boolean(r.active),
      category: r.category,
    }));
    res.json(services);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/services
servicesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const id = req.body.id || `srv-${Date.now()}`;
    const newService: ServiceItem = {
      id,
      name: req.body.name,
      description: req.body.description || '',
      durationMinutes: Number(req.body.durationMinutes) || 30,
      price: Number(req.body.price) || 0,
      active: req.body.active !== undefined ? Boolean(req.body.active) : true,
      category: req.body.category || 'General',
    };

    await pool.query(
      `INSERT INTO services (id, name, description, duration_minutes, price, active, category)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        newService.id,
        newService.name,
        newService.description,
        newService.durationMinutes,
        newService.price,
        newService.active ? 1 : 0,
        newService.category,
      ]
    );

    // Audit activity
    await pool.query(
      `INSERT INTO activities (id, title, client_name, time_ago, type, amount, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `act-${Date.now()}`,
        `Nuevo servicio creado: ${newService.name} ($${newService.price})`,
        null,
        'Justo ahora',
        'new_booking',
        newService.price,
        new Date().toISOString(),
      ]
    );

    res.status(201).json(newService);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/services/:id
servicesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [rows]: any = await pool.query('SELECT * FROM services WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    const current = rows[0];
    const name = req.body.name !== undefined ? req.body.name : current.name;
    const description = req.body.description !== undefined ? req.body.description : current.description;
    const durationMinutes = req.body.durationMinutes !== undefined ? Number(req.body.durationMinutes) : current.duration_minutes;
    const price = req.body.price !== undefined ? Number(req.body.price) : Number(current.price);
    const active = req.body.active !== undefined ? (req.body.active ? 1 : 0) : current.active;
    const category = req.body.category !== undefined ? req.body.category : current.category;

    await pool.query(
      `UPDATE services SET name = ?, description = ?, duration_minutes = ?, price = ?, active = ?, category = ?
       WHERE id = ?`,
      [name, description, durationMinutes, price, active, category, id]
    );

    const updatedService: ServiceItem = {
      id,
      name,
      description,
      durationMinutes,
      price,
      active: Boolean(active),
      category,
    };

    res.json(updatedService);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/services/:id
servicesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [result]: any = await pool.query('DELETE FROM services WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
