import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Professional, ServiceItem } from '../types';

interface ReportesViewProps {
  professionals: Professional[];
  services: ServiceItem[];
  monthlyRevenue: number;
}

export const ReportesView: React.FC<ReportesViewProps> = ({
  professionals,
  services,
  monthlyRevenue,
}) => {
  const [period, setPeriod] = useState('30_days');
  const [selectedProf, setSelectedProf] = useState('all');
  const [selectedServ, setSelectedServ] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  // Mock weekly reservations data
  const weeklyData = [
    { week: 'Sem 1', reservas: 32, canceladas: 2 },
    { week: 'Sem 2', reservas: 45, canceladas: 4 },
    { week: 'Sem 3', reservas: 38, canceladas: 1 },
    { week: 'Sem 4', reservas: 52, canceladas: 3 },
  ];

  // Mock revenue evolution data
  const revenueData = [
    { name: 'Sem 1', ingresos: 980000 },
    { name: 'Sem 2', ingresos: 1350000 },
    { name: 'Sem 3', ingresos: 1120000 },
    { name: 'Sem 4', ingresos: 1400000 },
  ];

  // Top services demand
  const topServicesData = [
    { name: 'Corte Clásico', count: 58 },
    { name: 'Coloración / Tinte', count: 42 },
    { name: 'Manicura Permanente', count: 35 },
    { name: 'Limpieza Facial', count: 22 },
    { name: 'Keratina', count: 18 },
  ];

  // Status distribution
  const statusData = [
    { name: 'Completadas', value: 85, color: '#24389c' },
    { name: 'Confirmadas', value: 38, color: '#3f51b5' },
    { name: 'Pendientes', value: 12, color: '#ffdcc6' },
    { name: 'Canceladas', value: 7, color: '#ba1a1a' },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      // create CSV download simulation
      const csvContent =
        'data:text/csv;charset=utf-8,Periodo,Reservas,Ingresos\nSem 1,32,980000\nSem 2,45,1350000\nSem 3,38,1120000\nSem 4,52,1400000';
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `reporte_turnia_${period}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 800);
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
            Analiza el rendimiento, ingresos y ocupación de tu negocio.
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
          <span>{isExporting ? 'Generando...' : 'Exportar reporte'}</span>
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
            <option value="30_days">Últimos 30 días</option>
            <option value="this_month">Este mes en curso</option>
            <option value="last_quarter">Último trimestre</option>
            <option value="year">Año 2023</option>
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
            <span className="text-2xl font-bold text-[#191c1d]">142</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              +12.4%
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#e1e3e4] rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-[#757684] uppercase tracking-wider block mb-1">
            Ingresos Totales
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#191c1d]">
              ${monthlyRevenue.toLocaleString('es-CO')}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              +8.1%
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#e1e3e4] rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-[#757684] uppercase tracking-wider block mb-1">
            Ticket Promedio
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#191c1d]">$34.150</span>
            <span className="text-xs font-bold text-[#24389c] bg-[#dee0ff] px-2 py-0.5 rounded-full">
              +3.2%
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#e1e3e4] rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-[#757684] uppercase tracking-wider block mb-1">
            Tasa de Asistencia
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#191c1d]">94.8%</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              +1.5%
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
            <span className="text-xs text-[#757684]">Últimas 4 semanas</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f5" />
                <XAxis dataKey="week" stroke="#757684" fontSize={12} tickLine={false} />
                <YAxis stroke="#757684" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e1e3e4',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="reservas" fill="#24389c" radius={[4, 4, 0, 0]} name="Confirmadas" />
                <Bar dataKey="canceladas" fill="#ffdad6" radius={[4, 4, 0, 0]} name="Canceladas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Evolución de Ingresos */}
        <div className="bg-white border border-[#e1e3e4] rounded-xl p-5 shadow-2xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base text-[#191c1d]">Evolución de Ingresos</h3>
            <span className="text-xs text-[#757684]">COP mensual</span>
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
                  tickFormatter={(val) => `$${val / 1000}k`}
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
                    style={{ width: `${(item.count / 60) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Distribución por Estado */}
        <div className="bg-white border border-[#e1e3e4] rounded-xl p-5 shadow-2xs flex flex-col">
          <h3 className="font-bold text-base text-[#191c1d] mb-2">
            Distribución por Estado de Cita
          </h3>
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
                    formatter={(val: number) => [`${val} citas`, 'Cantidad']}
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
                  <span className="font-bold text-[#191c1d] ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
