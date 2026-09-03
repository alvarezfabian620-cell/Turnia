import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Professional, ServiceItem, Reservation } from '../types';
import { api } from '../services/api';

interface ReportesViewProps {
  professionals: Professional[];
  services: ServiceItem[];
  reservations: Reservation[];
}

export const ReportesView: React.FC<ReportesViewProps> = ({
  professionals,
  services,
  reservations,
}) => {
  const [period, setPeriod] = useState('all');
  const [selectedProf, setSelectedProf] = useState('all');
  const [selectedServ, setSelectedServ] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  // Filter reservations based on active filters
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      if (selectedProf !== 'all' && r.professionalId !== selectedProf) return false;
      if (selectedServ !== 'all' && r.serviceId !== selectedServ) return false;

      if (period === 'this_month') {
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return r.date.startsWith(currentMonthStr);
      }
      if (period === '30_days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(r.date) >= thirtyDaysAgo;
      }
      return true;
    });
  }, [reservations, selectedProf, selectedServ, period]);

  // Dynamic calculations
  const totalReservationsCount = filteredReservations.length;
  const completedReservations = filteredReservations.filter((r) => r.status === 'completada');
  const nonCancelledReservations = filteredReservations.filter((r) => r.status !== 'cancelada');

  const totalRevenue = nonCancelledReservations.reduce(
    (sum, r) => sum + (Number(r.price) || 0),
    0
  );

  const averageTicket =
    nonCancelledReservations.length > 0
      ? Math.round(totalRevenue / nonCancelledReservations.length)
      : 0;

  const attendanceRate =
    totalReservationsCount > 0
      ? ((nonCancelledReservations.length / totalReservationsCount) * 100).toFixed(1)
      : '100.0';

  // Dynamic Weekly Bookings Calculation
  const weeklyData = useMemo(() => {
    const weeks = [
      { week: 'Sem 1', reservas: 0, canceladas: 0 },
      { week: 'Sem 2', reservas: 0, canceladas: 0 },
      { week: 'Sem 3', reservas: 0, canceladas: 0 },
      { week: 'Sem 4', reservas: 0, canceladas: 0 },
    ];

    filteredReservations.forEach((r) => {
      const day = parseInt(r.date.split('-')[2], 10) || 1;
      const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
      if (r.status === 'cancelada') {
        weeks[weekIndex].canceladas += 1;
      } else {
        weeks[weekIndex].reservas += 1;
      }
    });

    return weeks;
  }, [filteredReservations]);

  // Dynamic Revenue Evolution Calculation
  const revenueData = useMemo(() => {
    const weeks = [
      { name: 'Sem 1', ingresos: 0 },
      { name: 'Sem 2', ingresos: 0 },
      { name: 'Sem 3', ingresos: 0 },
      { name: 'Sem 4', ingresos: 0 },
    ];

    nonCancelledReservations.forEach((r) => {
      const day = parseInt(r.date.split('-')[2], 10) || 1;
      const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
      weeks[weekIndex].ingresos += Number(r.price) || 0;
    });

    return weeks;
  }, [nonCancelledReservations]);

  // Top services dynamic demand
  const topServicesData = useMemo(() => {
    const countMap = new Map<string, number>();
    filteredReservations.forEach((r) => {
      const name = r.serviceName || 'Servicio';
      countMap.set(name, (countMap.get(name) || 0) + 1);
    });

    const list = Array.from(countMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return list;
  }, [filteredReservations]);

  const maxServiceCount = Math.max(...topServicesData.map((s) => s.count), 1);

  // Status breakdown dynamic
  const statusData = useMemo(() => {
    const total = filteredReservations.length || 1;
    const completadas = filteredReservations.filter((r) => r.status === 'completada').length;
    const confirmadas = filteredReservations.filter((r) => r.status === 'confirmada').length;
    const enCurso = filteredReservations.filter((r) => r.status === 'en_curso').length;
    const pendientes = filteredReservations.filter((r) => r.status === 'pendiente').length;
    const canceladas = filteredReservations.filter((r) => r.status === 'cancelada').length;

    return [
      {
        name: 'Completadas',
        value: Math.round((completadas / total) * 100),
        count: completadas,
        color: '#24389c',
      },
      {
        name: 'Confirmadas',
        value: Math.round((confirmadas / total) * 100),
        count: confirmadas,
        color: '#3f51b5',
      },
      {
        name: 'En curso',
        value: Math.round((enCurso / total) * 100),
        count: enCurso,
        color: '#607d8b',
      },
      {
        name: 'Pendientes',
        value: Math.round((pendientes / total) * 100),
        count: pendientes,
        color: '#f59e0b',
      },
      {
        name: 'Canceladas',
        value: Math.round((canceladas / total) * 100),
        count: canceladas,
        color: '#ba1a1a',
      },
    ].filter((s) => s.count > 0 || total === 1);
  }, [filteredReservations]);

  const handleExport = () => {
    setIsExporting(true);
    const headers = 'ID,Fecha,Hora,Cliente,Telefono,Email,Servicio,Profesional,Precio,Estado,Notas\n';
    const rows = filteredReservations
      .map(
        (r) =>
          `"${r.id}","${r.date}","${r.time}","${r.clientName}","${r.clientPhone || ''}","${
            r.clientEmail || ''
          }","${r.serviceName}","${r.professionalName}","${r.price}","${r.status}","${
            (r.notes || '').replace(/"/g, '""')
          }"`
      )
      .join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_turnia_${period}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-[28px] font-bold text-[#191c1d] tracking-tight">
            Reportes y Métricas
          </h2>
          <p className="text-[#454652] text-sm md:text-base mt-1">
            Métricas e ingresos calculados en tiempo real según las reservas registradas.
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-[#f3f4f5] text-[#191c1d] border border-[#e1e3e4] rounded-lg text-sm font-semibold shadow-xs transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] text-[#24389c]">
            {isExporting ? 'hourglass_top' : 'download'}
          </span>
          <span>{isExporting ? 'Generando...' : 'Exportar CSV'}</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#e1e3e4] rounded-xl p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
            Periodo
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm text-[#191c1d] bg-white focus:border-[#24389c] outline-none"
          >
            <option value="all">Todo el historial</option>
            <option value="30_days">Últimos 30 días</option>
            <option value="this_month">Este mes en curso</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
            Profesional
          </label>
          <select
            value={selectedProf}
            onChange={(e) => setSelectedProf(e.target.value)}
            className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm text-[#191c1d] bg-white focus:border-[#24389c] outline-none"
          >
            <option value="all">Todos los profesionales</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
            Servicio
          </label>
          <select
            value={selectedServ}
            onChange={(e) => setSelectedServ(e.target.value)}
            className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm text-[#191c1d] bg-white focus:border-[#24389c] outline-none"
          >
            <option value="all">Todos los servicios</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Summary Stat Mini-Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e1e3e4] rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-[#757684] uppercase tracking-wider block mb-1">
            Total Reservas
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#191c1d]">{totalReservationsCount}</span>
            <span className="text-xs font-bold text-[#24389c] bg-[#dee0ff] px-2 py-0.5 rounded-full">
              Real
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#e1e3e4] rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-[#757684] uppercase tracking-wider block mb-1">
            Ingresos Totales
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#191c1d]">
              ${totalRevenue.toLocaleString('es-CO')}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Calculado
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#e1e3e4] rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-[#757684] uppercase tracking-wider block mb-1">
            Ticket Promedio
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#191c1d]">
              ${averageTicket.toLocaleString('es-CO')}
            </span>
            <span className="text-xs font-bold text-[#24389c] bg-[#dee0ff] px-2 py-0.5 rounded-full">
              Promedio
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#e1e3e4] rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-[#757684] uppercase tracking-wider block mb-1">
            Tasa de Asistencia
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#191c1d]">{attendanceRate}%</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Efectividad
            </span>
          </div>
        </div>
      </div>

      {/* 2x2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Reservas por Semana */}
        <div className="bg-white border border-[#e1e3e4] rounded-xl p-5 shadow-2xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base text-[#191c1d]">Reservas por Semana</h3>
            <span className="text-xs text-[#757684]">Distribución semanal</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f5" />
                <XAxis dataKey="week" stroke="#757684" fontSize={12} tickLine={false} />
                <YAxis stroke="#757684" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e1e3e4',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={32}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingBottom: '4px' }}
                />
                <Bar dataKey="reservas" fill="#24389c" radius={[4, 4, 0, 0]} name="Citas Activas / Realizadas" />
                <Bar dataKey="canceladas" fill="#ffb4ab" radius={[4, 4, 0, 0]} name="Canceladas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Evolución de Ingresos */}
        <div className="bg-white border border-[#e1e3e4] rounded-xl p-5 shadow-2xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base text-[#191c1d]">Evolución de Ingresos</h3>
            <span className="text-xs text-[#757684]">Ingresos reales acumulados</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#24389c" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#24389c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f5" />
                <XAxis dataKey="name" stroke="#757684" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#757684"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `$${val.toLocaleString('es-CO')}`}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString('es-CO')}`, 'Ingresos']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e1e3e4',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#24389c"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorIngresos)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Top Servicios más demandados */}
        <div className="bg-white border border-[#e1e3e4] rounded-xl p-5 shadow-2xs">
          <h3 className="font-bold text-base text-[#191c1d] mb-4">
            Servicios con Mayor Demanda
          </h3>
          {topServicesData.length === 0 ? (
            <div className="py-12 text-center text-[#757684] text-sm">
              No hay reservas registradas en este periodo.
            </div>
          ) : (
            <div className="space-y-3.5">
              {topServicesData.map((item, idx) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-[#191c1d]">
                    <span>
                      {idx + 1}. {item.name}
                    </span>
                    <span className="text-[#24389c]">{item.count} citas</span>
                  </div>
                  <div className="w-full bg-[#f3f4f5] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#24389c] h-full rounded-full transition-all duration-500"
                      style={{ width: `${(item.count / maxServiceCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart 4: Distribución por Estado */}
        <div className="bg-white border border-[#e1e3e4] rounded-xl p-5 shadow-2xs flex flex-col">
          <h3 className="font-bold text-base text-[#191c1d] mb-2">
            Distribución por Estado de Cita
          </h3>
          {filteredReservations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-[#757684] text-sm py-12">
              Sin datos de citas para mostrar.
            </div>
          ) : (
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="w-44 h-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`${val}%`, 'Porcentaje']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e1e3e4',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-xs">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[#454652]">{item.name}</span>
                    <span className="font-bold text-[#191c1d] ml-auto">
                      {item.count} ({item.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
