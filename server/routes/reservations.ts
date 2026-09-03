import { Router, Request, Response } from 'express';
import { getPool, Reservation } from '../db.js';
import { broadcastEvent, broadcastNotification } from '../websocket.js';

export const reservationsRouter = Router();

// GET /api/reservations
reservationsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { date, status, professionalId, serviceId } = req.query;

    let query = 'SELECT * FROM reservations WHERE 1=1';
    const params: any[] = [];

    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (professionalId) {
      query += ' AND professional_id = ?';
      params.push(professionalId);
    }
    if (serviceId) {
      query += ' AND service_id = ?';
      params.push(serviceId);
    }

    query += ' ORDER BY date DESC, time ASC';

    const [rows]: any = await pool.query(query, params);
    const reservations: Reservation[] = rows.map((r: any) => ({
      id: r.id,
      clientName: r.client_name,
      clientPhone: r.client_phone || '',
      clientEmail: r.client_email || '',
      serviceId: r.service_id,
      serviceName: r.service_name,
      professionalId: r.professional_id,
      professionalName: r.professional_name,
      date: r.date,
      time: r.time,
      endTime: r.end_time || '',
      durationMinutes: r.duration_minutes,
      price: Number(r.price),
      status: r.status,
      notes: r.notes || '',
      createdAt: r.created_at,
    }));

    res.json(reservations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reservations
reservationsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const id = req.body.id || `res-${Date.now()}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const nowTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (req.body.date < todayStr || (req.body.date === todayStr && req.body.time < nowTimeStr)) {
      return res.status(400).json({
        error: 'No es posible agendar una reserva en una fecha u hora que ya ha pasado.'
      });
    }

    // Validate business opening schedule
    const [y, m, d] = req.body.date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const jsDay = dateObj.getDay();
    const dayCode = jsDay === 0 ? 7 : jsDay;

    const [scheduleRows]: any = await pool.query('SELECT * FROM schedules WHERE day_code = ?', [dayCode]);
    if (scheduleRows.length > 0) {
      const sch = scheduleRows[0];
      if (!sch.active) {
        return res.status(400).json({
          error: `El negocio se encuentra cerrado los días ${sch.day_name}.`
        });
      }
      let blocks: any[] = [];
      try {
        blocks = typeof sch.blocks === 'string' ? JSON.parse(sch.blocks) : sch.blocks;
      } catch (e) {
        blocks = [];
      }

      if (blocks.length > 0) {
        const [h, min] = req.body.time.split(':').map(Number);
        const startMins = h * 60 + min;
        const endMins = startMins + (Number(req.body.durationMinutes) || 30);

        const workingBlocks = blocks.filter((b: any) => !b.isBreak);
        const breakBlocks = blocks.filter((b: any) => b.isBreak);

        // Check break overlap
        for (const brk of breakBlocks) {
          const [brkStartH, brkStartM] = brk.start.split(':').map(Number);
          const [brkEndH, brkEndM] = brk.end.split(':').map(Number);
          const brkStartMins = brkStartH * 60 + brkStartM;
          const brkEndMins = brkEndH * 60 + brkEndM;

          if (startMins < brkEndMins && endMins > brkStartMins) {
            return res.status(400).json({
              error: `El horario coincide con un descanso (${brk.label || 'Descanso'} de ${brk.start} a ${brk.end}).`
            });
          }
        }

        // Check working block fit
        let fitsWorkingBlock = false;
        for (const block of workingBlocks) {
          const [bhStartH, bhStartM] = block.start.split(':').map(Number);
          const [bhEndH, bhEndM] = block.end.split(':').map(Number);
          const blockStartMins = bhStartH * 60 + bhStartM;
          const blockEndMins = bhEndH * 60 + bhEndM;

          if (startMins >= blockStartMins && endMins <= blockEndMins) {
            fitsWorkingBlock = true;
            break;
          }
        }

        if (!fitsWorkingBlock) {
          return res.status(400).json({
            error: `La hora seleccionada (${req.body.time}) está fuera del horario de atención de los días ${sch.day_name}.`
          });
        }
      }
    }

    const newRes: Reservation = {
      id,
      clientName: req.body.clientName,
      clientPhone: req.body.clientPhone || '',
      clientEmail: req.body.clientEmail || '',
      serviceId: req.body.serviceId,
      serviceName: req.body.serviceName,
      professionalId: req.body.professionalId,
      professionalName: req.body.professionalName,
      date: req.body.date,
      time: req.body.time,
      endTime: req.body.endTime || '',
      durationMinutes: Number(req.body.durationMinutes) || 30,
      price: Number(req.body.price) || 0,
      status: req.body.status || 'confirmada',
      notes: req.body.notes || '',
      createdAt: new Date().toISOString(),
    };

    await pool.query(
      `INSERT INTO reservations 
        (id, client_name, client_phone, client_email, service_id, service_name, professional_id, professional_name, date, time, end_time, duration_minutes, price, status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newRes.id,
        newRes.clientName,
        newRes.clientPhone,
        newRes.clientEmail,
        newRes.serviceId,
        newRes.serviceName,
        newRes.professionalId,
        newRes.professionalName,
        newRes.date,
        newRes.time,
        newRes.endTime,
        newRes.durationMinutes,
        newRes.price,
        newRes.status,
        newRes.notes,
        newRes.createdAt,
      ]
    );

    // Sync client profile
    const [clientRows]: any = await pool.query('SELECT * FROM clients WHERE LOWER(name) = LOWER(?)', [newRes.clientName]);
    if (clientRows.length > 0) {
      const client = clientRows[0];
      await pool.query(
        'UPDATE clients SET total_visits = total_visits + 1, last_visit = ?, phone = COALESCE(NULLIF(?, ""), phone), email = COALESCE(NULLIF(?, ""), email) WHERE id = ?',
        [newRes.date, newRes.clientPhone, newRes.clientEmail, client.id]
      );
    } else {
      await pool.query(
        'INSERT INTO clients (id, name, phone, email, total_visits, last_visit, notes) VALUES (?, ?, ?, ?, 1, ?, ?)',
        [`cli-${Date.now()}`, newRes.clientName, newRes.clientPhone, newRes.clientEmail, newRes.date, '']
      );
    }

    // Update professional bookings count
    await pool.query(
      'UPDATE professionals SET monthly_bookings = monthly_bookings + 1 WHERE id = ? OR name = ?',
      [newRes.professionalId, newRes.professionalName]
    );

    // Audit activity
    const activityItem = {
      id: `act-${Date.now()}`,
      title: `Nueva reserva agendada: ${newRes.clientName} (${newRes.serviceName})`,
      clientName: newRes.clientName,
      timeAgo: 'Justo ahora',
      type: 'new_booking',
      amount: newRes.price,
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

    // Broadcast WebSocket notification and data refresh in real-time
    broadcastNotification(activityItem);
    broadcastEvent({
      type: 'DATA_UPDATE',
      entity: 'reservations',
      data: newRes,
    });

    res.status(201).json(newRes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/reservations/:id
reservationsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [rows]: any = await pool.query('SELECT * FROM reservations WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    const current = rows[0];
    const clientName = req.body.clientName ?? current.client_name;
    const clientPhone = req.body.clientPhone ?? current.client_phone;
    const clientEmail = req.body.clientEmail ?? current.client_email;
    const serviceId = req.body.serviceId ?? current.service_id;
    const serviceName = req.body.serviceName ?? current.service_name;
    const professionalId = req.body.professionalId ?? current.professional_id;
    const professionalName = req.body.professionalName ?? current.professional_name;
    const date = req.body.date ?? current.date;
    const time = req.body.time ?? current.time;
    const endTime = req.body.endTime ?? current.end_time;
    const durationMinutes = req.body.durationMinutes ?? current.duration_minutes;
    const price = req.body.price ?? current.price;
    const status = req.body.status ?? current.status;
    const notes = req.body.notes ?? current.notes;

    await pool.query(
      `UPDATE reservations SET 
        client_name = ?, client_phone = ?, client_email = ?, service_id = ?, service_name = ?,
        professional_id = ?, professional_name = ?, date = ?, time = ?, end_time = ?,
        duration_minutes = ?, price = ?, status = ?, notes = ?
       WHERE id = ?`,
      [
        clientName, clientPhone, clientEmail, serviceId, serviceName,
        professionalId, professionalName, date, time, endTime,
        durationMinutes, price, status, notes, id
      ]
    );

    const updatedRes: Reservation = {
      id,
      clientName,
      clientPhone,
      clientEmail,
      serviceId,
      serviceName,
      professionalId,
      professionalName,
      date,
      time,
      endTime,
      durationMinutes,
      price: Number(price),
      status,
      notes,
      createdAt: current.created_at,
    };

    broadcastEvent({
      type: 'DATA_UPDATE',
      entity: 'reservations',
      data: updatedRes,
    });

    res.json(updatedRes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/reservations/:id/status
reservationsRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const pool = getPool();

    const [rows]: any = await pool.query('SELECT * FROM reservations WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    const current = rows[0];
    await pool.query('UPDATE reservations SET status = ? WHERE id = ?', [status, id]);

    let activityItem: any = null;
    let notifTitle = '';
    let notifType = 'system';

    if (status === 'cancelada') {
      notifTitle = `Reserva cancelada: ${current.client_name}`;
      notifType = 'cancellation';
    } else if (status === 'confirmada') {
      notifTitle = `Cita confirmada para ${current.client_name} (${current.service_name})`;
      notifType = 'new_booking';
    } else if (status === 'en_curso') {
      notifTitle = `Cita en curso: ${current.client_name} (${current.service_name})`;
      notifType = 'new_booking';
    } else if (status === 'completada') {
      notifTitle = `Cita completada y atendida: ${current.client_name}`;
      notifType = 'payment';
    }

    if (notifTitle) {
      activityItem = {
        id: `act-${Date.now()}`,
        title: notifTitle,
        clientName: current.client_name,
        timeAgo: 'Justo ahora',
        type: notifType,
        amount: status === 'completada' ? Number(current.price) : null,
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
    }

    const updatedRes: Reservation = {
      id,
      clientName: current.client_name,
      clientPhone: current.client_phone,
      clientEmail: current.client_email,
      serviceId: current.service_id,
      serviceName: current.service_name,
      professionalId: current.professional_id,
      professionalName: current.professional_name,
      date: current.date,
      time: current.time,
      endTime: current.end_time,
      durationMinutes: current.duration_minutes,
      price: Number(current.price),
      status,
      notes: current.notes,
      createdAt: current.created_at,
    };

    broadcastEvent({
      type: 'DATA_UPDATE',
      entity: 'reservations',
      data: updatedRes,
    });

    res.json(updatedRes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/reservations/:id
reservationsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [result]: any = await pool.query('DELETE FROM reservations WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    broadcastEvent({
      type: 'DATA_UPDATE',
      entity: 'reservations',
      data: { id, deleted: true },
    });

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
