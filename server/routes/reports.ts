import { Router, Request, Response } from 'express';
import { db } from '../db.js';

export const reportsRouter = Router();

// GET /api/reports/stats
reportsRouter.get('/stats', (req: Request, res: Response) => {
  const reservations = db.get('reservations');
  const services = db.get('services');
  const clients = db.get('clients');

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Monthly Revenue (only non-cancelled)
  const monthlyRevenue = reservations
    .filter((r) => r.status !== 'cancelada' && r.date.startsWith(currentMonthStr))
    .reduce((sum, r) => sum + (Number(r.price) || 0), 0);

  // Total Revenue
  const totalRevenue = reservations
    .filter((r) => r.status !== 'cancelada')
    .reduce((sum, r) => sum + (Number(r.price) || 0), 0);

  // Today count
  const todayReservations = reservations.filter((r) => r.date === todayStr);

  // Pending count
  const pendingCount = reservations.filter((r) => r.status === 'pendiente').length;

  // Status breakdown
  const statusCounts = {
    completada: reservations.filter((r) => r.status === 'completada').length,
    confirmada: reservations.filter((r) => r.status === 'confirmada').length,
    en_curso: reservations.filter((r) => r.status === 'en_curso').length,
    pendiente: reservations.filter((r) => r.status === 'pendiente').length,
    cancelada: reservations.filter((r) => r.status === 'cancelada').length,
  };

  // Top services demand
  const serviceDemandMap = new Map<string, number>();
  reservations.forEach((r) => {
    const sName = r.serviceName || 'Servicio';
    serviceDemandMap.set(sName, (serviceDemandMap.get(sName) || 0) + 1);
  });

  const topServices = Array.from(serviceDemandMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Weekly bookings calculation for current month
  const weeklyData = [
    { week: 'Sem 1', reservas: 0, canceladas: 0, ingresos: 0 },
    { week: 'Sem 2', reservas: 0, canceladas: 0, ingresos: 0 },
    { week: 'Sem 3', reservas: 0, canceladas: 0, ingresos: 0 },
    { week: 'Sem 4', reservas: 0, canceladas: 0, ingresos: 0 },
  ];

  reservations
    .filter((r) => r.date.startsWith(currentMonthStr))
    .forEach((r) => {
      const day = parseInt(r.date.split('-')[2], 10) || 1;
      let weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
      if (r.status === 'cancelada') {
        weeklyData[weekIndex].canceladas += 1;
      } else {
        weeklyData[weekIndex].reservas += 1;
        weeklyData[weekIndex].ingresos += Number(r.price) || 0;
      }
    });

  res.json({
    todayCount: todayReservations.length,
    pendingCount,
    clientCount: clients.length,
    monthlyRevenue,
    totalRevenue,
    statusCounts,
    topServices,
    weeklyData,
  });
});

// GET /api/reports/export-csv
reportsRouter.get('/export-csv', (req: Request, res: Response) => {
  const reservations = db.get('reservations');
  const headers = 'ID,Fecha,Hora,Cliente,Telefono,Email,Servicio,Profesional,Precio,Estado,Notas\n';
  const rows = reservations
    .map(
      (r) =>
        `"${r.id}","${r.date}","${r.time}","${r.clientName}","${r.clientPhone || ''}","${
          r.clientEmail || ''
        }","${r.serviceName}","${r.professionalName}","${r.price}","${r.status}","${
          (r.notes || '').replace(/"/g, '""')
        }"`
    )
    .join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=reporte_reservas_turnia_${Date.now()}.csv`);
  res.send('\uFEFF' + headers + rows);
});
