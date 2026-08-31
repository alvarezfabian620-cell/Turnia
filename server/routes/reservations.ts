import { Router, Request, Response } from 'express';
import { db, Reservation, ActivityItem, ClientItem, Professional } from '../db.js';

export const reservationsRouter = Router();

// GET /api/reservations
reservationsRouter.get('/', (req: Request, res: Response) => {
  const reservations = db.get('reservations');
  const { date, status, professionalId, serviceId } = req.query;

  let filtered = [...reservations];
  if (date) {
    filtered = filtered.filter((r) => r.date === date);
  }
  if (status) {
    filtered = filtered.filter((r) => r.status === status);
  }
  if (professionalId) {
    filtered = filtered.filter((r) => r.professionalId === professionalId);
  }
  if (serviceId) {
    filtered = filtered.filter((r) => r.serviceId === serviceId);
  }

  res.json(filtered);
});

// POST /api/reservations
reservationsRouter.post('/', (req: Request, res: Response) => {
  const reservations = db.get('reservations');
  const newReservation: Reservation = {
    ...req.body,
    id: req.body.id || `res-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: req.body.status || 'confirmada',
  };

  const updatedReservations = [newReservation, ...reservations];
  db.set('reservations', updatedReservations);

  // Sync client profile
  const clients = db.get('clients');
  const existingClient = clients.find(
    (c) => c.name.toLowerCase() === newReservation.clientName.toLowerCase()
  );

  if (existingClient) {
    const updatedClients = clients.map((c) =>
      c.id === existingClient.id
        ? {
            ...c,
            totalVisits: c.totalVisits + 1,
            lastVisit: newReservation.date,
            phone: newReservation.clientPhone || c.phone,
            email: newReservation.clientEmail || c.email,
          }
        : c
    );
    db.set('clients', updatedClients);
  } else {
    const newClient: ClientItem = {
      id: `cli-${Date.now()}`,
      name: newReservation.clientName,
      phone: newReservation.clientPhone || '',
      email: newReservation.clientEmail || '',
      totalVisits: 1,
      lastVisit: newReservation.date,
    };
    db.set('clients', [newClient, ...clients]);
  }

  // Update professional monthly bookings count
  const professionals = db.get('professionals');
  const updatedProfs = professionals.map((p) =>
    p.id === newReservation.professionalId || p.name === newReservation.professionalName
      ? { ...p, monthlyBookings: (p.monthlyBookings || 0) + 1 }
      : p
  );
  db.set('professionals', updatedProfs);

  // Add audit activity
  const activities = db.get('activities');
  const newActivity: ActivityItem = {
    id: `act-${Date.now()}`,
    title: `Nueva reserva agendada: ${newReservation.clientName} (${newReservation.serviceName})`,
    clientName: newReservation.clientName,
    timeAgo: 'Justo ahora',
    type: 'new_booking',
    amount: newReservation.price,
    timestamp: new Date().toISOString(),
  };
  db.set('activities', [newActivity, ...activities.slice(0, 49)]);

  res.status(201).json(newReservation);
});

// PUT /api/reservations/:id
reservationsRouter.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const reservations = db.get('reservations');
  const index = reservations.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Reserva no encontrada' });
  }

  const prevRes = reservations[index];
  const updatedReservation: Reservation = {
    ...prevRes,
    ...req.body,
    id,
  };

  reservations[index] = updatedReservation;
  db.set('reservations', [...reservations]);

  // If status changed to cancelada
  if (prevRes.status !== 'cancelada' && updatedReservation.status === 'cancelada') {
    const activities = db.get('activities');
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      title: `Reserva cancelada: ${updatedReservation.clientName} (${updatedReservation.serviceName})`,
      clientName: updatedReservation.clientName,
      timeAgo: 'Justo ahora',
      type: 'cancellation',
      timestamp: new Date().toISOString(),
    };
    db.set('activities', [newActivity, ...activities.slice(0, 49)]);
  }

  res.json(updatedReservation);
});

// PATCH /api/reservations/:id/status
reservationsRouter.patch('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const reservations = db.get('reservations');
  const index = reservations.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Reserva no encontrada' });
  }

  const reservation = reservations[index];
  reservation.status = status;
  reservations[index] = reservation;
  db.set('reservations', [...reservations]);

  if (status === 'cancelada') {
    const activities = db.get('activities');
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      title: `Reserva cancelada: ${reservation.clientName}`,
      clientName: reservation.clientName,
      timeAgo: 'Justo ahora',
      type: 'cancellation',
      timestamp: new Date().toISOString(),
    };
    db.set('activities', [newActivity, ...activities.slice(0, 49)]);
  }

  res.json(reservation);
});

// DELETE /api/reservations/:id
reservationsRouter.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const reservations = db.get('reservations');
  const filtered = reservations.filter((r) => r.id !== id);

  if (filtered.length === reservations.length) {
    return res.status(404).json({ error: 'Reserva no encontrada' });
  }

  db.set('reservations', filtered);
  res.json({ success: true, id });
});
