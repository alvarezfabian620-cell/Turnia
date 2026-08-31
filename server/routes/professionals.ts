import { Router, Request, Response } from 'express';
import { getPool, Professional } from '../db.js';

export const professionalsRouter = Router();

// GET /api/professionals
professionalsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [rows]: any = await pool.query('SELECT * FROM professionals ORDER BY name ASC');
    const professionals: Professional[] = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      role: r.role,
      status: r.status,
      monthlyBookings: r.monthly_bookings || 0,
      avatarUrl: r.avatar_url || '',
      email: r.email || '',
      phone: r.phone || '',
      specialties: r.specialties ? JSON.parse(r.specialties) : [],
    }));
    res.json(professionals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/professionals
professionalsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const id = req.body.id || `prof-${Date.now()}`;
    const newProf: Professional = {
      id,
      name: req.body.name,
      role: req.body.role,
      status: req.body.status || 'disponible',
      monthlyBookings: req.body.monthlyBookings || 0,
      avatarUrl: req.body.avatarUrl || '',
      email: req.body.email || '',
      phone: req.body.phone || '',
      specialties: req.body.specialties || [],
    };

    await pool.query(
      `INSERT INTO professionals (id, name, role, status, monthly_bookings, avatar_url, email, phone, specialties)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newProf.id,
        newProf.name,
        newProf.role,
        newProf.status,
        newProf.monthlyBookings,
        newProf.avatarUrl,
        newProf.email,
        newProf.phone,
        JSON.stringify(newProf.specialties),
      ]
    );

    // Audit activity
    await pool.query(
      `INSERT INTO activities (id, title, client_name, time_ago, type, amount, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `act-${Date.now()}`,
        `Nuevo profesional registrado: ${newProf.name} (${newProf.role})`,
        null,
        'Justo ahora',
        'new_client',
        null,
        new Date().toISOString(),
      ]
    );

    res.status(201).json(newProf);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/professionals/:id
professionalsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [rows]: any = await pool.query('SELECT * FROM professionals WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Profesional no encontrado' });
    }

    const current = rows[0];
    const name = req.body.name !== undefined ? req.body.name : current.name;
    const role = req.body.role !== undefined ? req.body.role : current.role;
    const status = req.body.status !== undefined ? req.body.status : current.status;
    const monthlyBookings = req.body.monthlyBookings !== undefined ? req.body.monthlyBookings : current.monthly_bookings;
    const avatarUrl = req.body.avatarUrl !== undefined ? req.body.avatarUrl : current.avatar_url;
    const email = req.body.email !== undefined ? req.body.email : current.email;
    const phone = req.body.phone !== undefined ? req.body.phone : current.phone;
    const specialties = req.body.specialties !== undefined ? req.body.specialties : (current.specialties ? JSON.parse(current.specialties) : []);

    await pool.query(
      `UPDATE professionals SET name = ?, role = ?, status = ?, monthly_bookings = ?, avatar_url = ?, email = ?, phone = ?, specialties = ?
       WHERE id = ?`,
      [name, role, status, monthlyBookings, avatarUrl, email, phone, JSON.stringify(specialties), id]
    );

    const updatedProf: Professional = {
      id,
      name,
      role,
      status,
      monthlyBookings,
      avatarUrl,
      email,
      phone,
      specialties,
    };

    res.json(updatedProf);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/professionals/:id
professionalsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [result]: any = await pool.query('DELETE FROM professionals WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Profesional no encontrado' });
    }

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
