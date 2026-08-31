import { Router, Request, Response } from 'express';
import { getPool } from '../db.js';

export const reportsRouter = Router();

// GET /api/reports/stats
reportsRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [resRows]: any = await pool.query('SELECT * FROM reservations');
    const [clientRows]: any = await pool.query('SELECT * FROM clients');

    const reservations = resRows.map((r: any) => ({
      id: r.id,
      clientName: r.client_name,
      serviceName: r.service_name,
      price: Number(r.price),
      status: r.status,
      date: r.date,
    }));

    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const monthlyRevenue = reservations
      .filter((r: any) => r.status !== 'cancelada' && r.date.startsWith(currentMonthStr))
      .reduce((sum: number, r: any) => sum + r.price, 0);

    const totalRevenue = reservations
      .filter((r: any) => r.status !== 'cancelada')
      .reduce((sum: number, r: any) => sum + r.price, 0);

    const todayReservations = reservations.filter((r: any) => r.date === todayStr);
    const pendingCount = reservations.filter((r: any) => r.status === 'pendiente').length;

    const statusCounts = {
      completada: reservations.filter((r: any) => r.status === 'completada').length,
      confirmada: reservations.filter((r: any) => r.status === 'confirmada').length,
      en_curso: reservations.filter((r: any) => r.status === 'en_curso').length,
      pendiente: reservations.filter((r: any) => r.status === 'pendiente').length,
      cancelada: reservations.filter((r: any) => r.status === 'cancelada').length,
    };

    const serviceDemandMap = new Map<string, number>();
    reservations.forEach((r: any) => {
      const sName = r.serviceName || 'Servicio';
      serviceDemandMap.set(sName, (serviceDemandMap.get(sName) || 0) + 1);
    });

    const topServices = Array.from(serviceDemandMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const weeklyData = [
      { week: 'Sem 1', reservas: 0, canceladas: 0, ingresos: 0 },
      { week: 'Sem 2', reservas: 0, canceladas: 0, ingresos: 0 },
      { week: 'Sem 3', reservas: 0, canceladas: 0, ingresos: 0 },
      { week: 'Sem 4', reservas: 0, canceladas: 0, ingresos: 0 },
    ];

    reservations
      .filter((r: any) => r.date.startsWith(currentMonthStr))
      .forEach((r: any) => {
        const day = parseInt(r.date.split('-')[2], 10) || 1;
        const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
        if (r.status === 'cancelada') {
          weeklyData[weekIndex].canceladas += 1;
        } else {
          weeklyData[weekIndex].reservas += 1;
          weeklyData[weekIndex].ingresos += r.price;
        }
      });

    res.json({
      todayCount: todayReservations.length,
      pendingCount,
      clientCount: clientRows.length,
      monthlyRevenue,
      totalRevenue,
      statusCounts,
      topServices,
      weeklyData,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/export-csv
reportsRouter.get('/export-csv', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [rows]: any = await pool.query('SELECT * FROM reservations ORDER BY date DESC');
    const headers = 'ID,Fecha,Hora,Cliente,Telefono,Email,Servicio,Profesional,Precio,Estado,Notas\n';
    const csvRows = rows
      .map(
        (r: any) =>
          `"${r.id}","${r.date}","${r.time}","${r.client_name}","${r.client_phone || ''}","${
            r.client_email || ''
          }","${r.service_name}","${r.professional_name}","${r.price}","${r.status}","${
            (r.notes || '').replace(/"/g, '""')
          }"`
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_reservas_turnia_${Date.now()}.csv`);
    res.send('\uFEFF' + headers + csvRows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
