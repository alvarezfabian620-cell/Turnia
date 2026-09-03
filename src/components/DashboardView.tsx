import React, { useMemo } from 'react';
import { Reservation, ActivityItem, ViewMode } from '../types';

interface DashboardViewProps {
  reservations: Reservation[];
  activities: ActivityItem[];
  clientCount: number;
  monthlyRevenue: number;
  onNavigate: (view: ViewMode) => void;
  onSelectReservation: (reservation: Reservation) => void;
  onOpenNewBooking: () => void;
  searchQuery?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  reservations,
  activities,
  clientCount,
  monthlyRevenue,
  onNavigate,
  onSelectReservation,
  onOpenNewBooking,
  searchQuery = '',
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Dynamic real-time stats
  const todayReservations = useMemo(
    () => reservations.filter((r) => r.date === todayStr),
    [reservations, todayStr]
  );

  const pendingCount = useMemo(
    () => reservations.filter((r) => r.status === 'pendiente').length,
    [reservations]
  );

  const todayCount = todayReservations.length;

  // Upcoming non-cancelled reservations
  const upcomingReservations = useMemo(() => {
    return [...reservations]
      .filter((r) => r.status !== 'cancelada' && r.status !== 'completada')
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
      .slice(0, 4);
  }, [reservations]);

  // Display reservations in table (today's or recent if today is empty)
  const displayedReservations = useMemo(() => {
    let sourceList = todayReservations.length > 0 ? todayReservations : reservations.slice(0, 8);
    if (!searchQuery) return sourceList;
    const q = searchQuery.toLowerCase();
    return reservations.filter(
      (r) =>
        r.clientName.toLowerCase().includes(q) ||
        r.serviceName.toLowerCase().includes(q) ||
        r.professionalName.toLowerCase().includes(q)
    );
  }, [todayReservations, reservations, searchQuery]);

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'en_curso':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#4c56af]/10 text-[#4c56af] border border-[#4c56af]/20">
            En curso
          </span>
        );
      case 'confirmada':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#dee0ff] text-[#24389c] border border-[#bac3ff]">
            Confirmada
          </span>
        );
      case 'pendiente':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#ffdad6] text-[#ba1a1a] border border-[#ffdad6]">
            Pendiente
          </span>
        );
      case 'completada':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#e1e3e4] text-[#454652]">
            Completada
          </span>
        );
      case 'cancelada':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#ffdad6]/60 text-[#ba1a1a]">
            Cancelada
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-[28px] font-bold text-[#191c1d] tracking-tight">
            Buenos días, Administrador
          </h2>
          <p className="text-[#454652] text-sm md:text-base mt-1">
            Aquí tienes un resumen de la actividad en tiempo real de tu negocio.
          </p>
        </div>
      </div>

      {/* 4 Bento Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Reservas de hoy */}
        <div
          onClick={() => onNavigate('reservas')}
          className="bg-white border border-[#e1e3e4] rounded-xl p-5 flex flex-col justify-between hover:shadow-sm hover:border-[#bac3ff] transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-[#454652] uppercase tracking-wider">
              Reservas de hoy
            </span>
            <div className="p-2 bg-[#dee0ff]/60 text-[#24389c] rounded-lg group-hover:bg-[#24389c] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px] block">today</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-[#191c1d] tracking-tight">{todayCount}</div>
        </div>

        {/* Stat 2: Pendientes */}
        <div
          onClick={() => onNavigate('reservas')}
          className="bg-white border border-[#e1e3e4] rounded-xl p-5 flex flex-col justify-between hover:shadow-sm hover:border-[#bdc2ff] transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-[#454652] uppercase tracking-wider">
              Pendientes
            </span>
            <div className="p-2 bg-[#e0e0ff]/60 text-[#4c56af] rounded-lg group-hover:bg-[#4c56af] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px] block">pending_actions</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-[#191c1d] tracking-tight">{pendingCount}</div>
        </div>

        {/* Stat 3: Clientes */}
        <div
          onClick={() => onNavigate('clientes')}
          className="bg-white border border-[#e1e3e4] rounded-xl p-5 flex flex-col justify-between hover:shadow-sm hover:border-[#ffdcc6] transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-[#454652] uppercase tracking-wider">
              Clientes
            </span>
            <div className="p-2 bg-[#ffdcc6]/60 text-[#8f4700] rounded-lg group-hover:bg-[#8f4700] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px] block">group</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-[#191c1d] tracking-tight">{clientCount}</div>
        </div>

        {/* Stat 4: Ingresos del mes */}
        <div
          onClick={() => onNavigate('reportes')}
          className="bg-white border border-[#e1e3e4] rounded-xl p-5 flex flex-col justify-between hover:shadow-sm hover:border-[#bac3ff] transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-[#454652] uppercase tracking-wider">
              Ingresos del mes
            </span>
            <div className="p-2 bg-[#dee0ff]/60 text-[#24389c] rounded-lg group-hover:bg-[#24389c] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px] block">payments</span>
            </div>
          </div>
          <div className="text-2xl md:text-[26px] font-bold text-[#191c1d] tracking-tight">
            ${monthlyRevenue.toLocaleString('es-CO')}
          </div>
        </div>
      </div>

      {/* Main Grid: Data Table (8 cols) + Right Cards (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Data Table Area (Spans 8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border border-[#e1e3e4] rounded-xl flex flex-col overflow-hidden shadow-2xs">
            <div className="px-6 py-4 border-b border-[#e1e3e4] flex justify-between items-center bg-white">
              <h3 className="font-semibold text-base md:text-lg text-[#191c1d]">
                {todayReservations.length > 0 ? 'Reservas de hoy' : 'Últimas reservas'}
              </h3>
              <button
                onClick={() => onNavigate('reservas')}
                className="text-[#24389c] text-sm font-medium hover:underline flex items-center gap-1 transition-colors"
              >
                <span>Ver todas</span>
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e1e3e4] bg-[#f8f9fa]">
                    <th className="px-4 py-3 text-xs font-semibold text-[#757684] uppercase tracking-wider">
                      Hora
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-[#757684] uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-[#757684] uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-[#757684] uppercase tracking-wider">
                      Profesional
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-[#757684] uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-[#f3f4f5]">
                  {displayedReservations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-[#757684]">
                        No hay reservas para mostrar. Crea una nueva reserva para comenzar.
                      </td>
                    </tr>
                  ) : (
                    displayedReservations.map((res, index) => (
                      <tr
                        key={res.id}
                        onClick={() => onSelectReservation(res)}
                        className={`transition-colors cursor-pointer group ${
                          index % 2 === 1 ? 'bg-[#eff1f4]' : 'bg-white'
                        } hover:bg-[#dee0ff]/40`}
                      >
                        <td className="px-4 py-3.5 font-mono text-xs font-medium text-[#454652] whitespace-nowrap">
                          {res.time}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-[#191c1d] group-hover:text-[#24389c] transition-colors whitespace-nowrap">
                          {res.clientName}
                        </td>
                        <td className="px-4 py-3.5 text-[#454652] whitespace-nowrap">
                          {res.serviceName}
                        </td>
                        <td className="px-4 py-3.5 text-[#191c1d] whitespace-nowrap">
                          {res.professionalName}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">{getStatusBadge(res.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar Area (Spans 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Próximas Reservas Card */}
          <div className="bg-white border border-[#e1e3e4] rounded-xl p-5 shadow-2xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-base text-[#191c1d]">Próximas reservas</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#f3f4f5] text-[#454652] font-medium">
                {upcomingReservations.length} próximas
              </span>
            </div>

            {upcomingReservations.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#757684]">
                No hay próximas reservas agendadas.
              </div>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {upcomingReservations.map((res) => {
                  const isToday = res.date === todayStr;
                  const [year, month, day] = (res.date || '').split('-');
                  const monthNames = [
                    'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
                    'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
                  ];
                  const monthName = month ? monthNames[parseInt(month, 10) - 1] || 'MES' : 'MES';

                  return (
                    <li
                      key={res.id}
                      onClick={() => onSelectReservation(res)}
                      className="flex items-center justify-between p-3 rounded-xl border border-[#f3f4f5] hover:border-[#bac3ff] hover:bg-[#f8f9fa] transition-all cursor-pointer group gap-3 shadow-2xs"
                    >
                      {/* Left: Modern Mini Calendar Tag */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-white border border-[#e1e3e4] overflow-hidden flex flex-col items-center justify-center shrink-0 shadow-2xs group-hover:border-[#24389c] transition-colors">
                          <span
                            className={`w-full text-center text-[9px] font-extrabold uppercase py-0.5 tracking-wider ${
                              isToday
                                ? 'bg-[#24389c] text-white'
                                : 'bg-[#dee0ff] text-[#24389c]'
                            }`}
                          >
                            {isToday ? 'HOY' : monthName}
                          </span>
                          <span className="text-sm font-black text-[#191c1d] leading-none py-1">
                            {day || '--'}
                          </span>
                        </div>

                        {/* Center Info */}
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-[#191c1d] group-hover:text-[#24389c] transition-colors truncate">
                            {res.clientName}
                          </span>
                          <span className="text-xs text-[#757684] truncate mt-0.5">
                            {res.serviceName} · <span className="text-[#454652] font-medium">{res.professionalName}</span>
                          </span>
                        </div>
                      </div>

                      {/* Right: Clean Time Pill */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f3f4f5] text-[#191c1d] font-semibold text-xs shrink-0 group-hover:bg-[#dee0ff] group-hover:text-[#24389c] transition-colors">
                        <span className="material-symbols-outlined text-[15px]">schedule</span>
                        <span className="font-mono">{res.time}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <button
              onClick={() => onNavigate('calendario')}
              className="w-full mt-4 py-2.5 bg-transparent border border-[#e1e3e4] text-[#191c1d] hover:bg-[#f3f4f5] hover:text-[#24389c] hover:border-[#24389c]/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
              <span>Ver Calendario</span>
            </button>
          </div>

          {/* Actividad Reciente Timeline Card */}
          <div className="bg-white border border-[#e1e3e4] rounded-xl p-5 shadow-2xs">
            <h3 className="font-semibold text-base text-[#191c1d] mb-4">Actividad reciente</h3>
            {activities.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#757684]">
                Sin actividad registrada aún.
              </div>
            ) : (
              <div className="relative pl-2">
                <div className="absolute left-[15px] top-2 bottom-3 w-[1.5px] bg-[#e1e3e4]"></div>
                <ul className="flex flex-col gap-4 relative">
                  {activities.slice(0, 5).map((act, idx) => (
                    <li key={act.id} className="flex gap-3.5 items-start relative">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 ml-[3px] z-10 ring-4 ring-white ${
                          idx === 0 ? 'bg-[#24389c]' : 'bg-[#c5c5d4]'
                        }`}
                      />
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm text-[#191c1d] leading-snug">
                          {act.title}
                        </span>
                        <span className="text-[11px] text-[#757684] mt-0.5">{act.timeAgo}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
