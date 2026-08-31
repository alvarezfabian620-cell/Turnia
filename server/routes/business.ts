import { Router, Request, Response } from 'express';
import { getPool, BusinessConfig } from '../db.js';

export const businessRouter = Router();

// GET /api/business
businessRouter.get('/', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [rows]: any = await pool.query('SELECT * FROM business_config WHERE id = 1');
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    const r = rows[0];
    const config: BusinessConfig = {
      name: r.name,
      category: r.category,
      description: r.description || '',
      phone: r.phone || '',
      email: r.email || '',
      address: r.address || '',
      logoUrl: r.logo_url || '',
      acceptNewBookings: Boolean(r.accept_new_bookings),
      showPricesPublicly: Boolean(r.show_prices_publicly),
      timeZone: r.time_zone || 'America/Bogota',
    };
    res.json(config);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/business
businessRouter.put('/', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const updated: BusinessConfig = req.body;

    await pool.query(
      `UPDATE business_config SET 
        name = ?, category = ?, description = ?, phone = ?, email = ?, 
        address = ?, logo_url = ?, accept_new_bookings = ?, show_prices_publicly = ?, time_zone = ? 
       WHERE id = 1`,
      [
        updated.name,
        updated.category,
        updated.description,
        updated.phone,
        updated.email,
        updated.address,
        updated.logoUrl,
        updated.acceptNewBookings ? 1 : 0,
        updated.showPricesPublicly ? 1 : 0,
        updated.timeZone,
      ]
    );

    // Audit activity
    await pool.query(
      `INSERT INTO activities (id, title, client_name, time_ago, type, amount, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `act-${Date.now()}`,
        `Configuración del negocio actualizada: ${updated.name}`,
        null,
        'Justo ahora',
        'schedule_update',
        null,
        new Date().toISOString(),
      ]
    );

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
