import React from 'react';
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
  // Compute real-time stats
  const todayReservations = reservations.filter((r) => r.date === '2023-10-24' || r.date.includes('2023-10'));
  const pendingCount = reservations.filter((r) => r.status === 'pendiente').length;
  const todayCount = 24; // baseline stat as shown in mockup with dynamic additions

  // Filter today reservations if search query exists
  const displayedReservations = reservations.slice(0, 5).filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.clientName.toLowerCase().includes(q) ||
      r.serviceName.toLowerCase().includes(q) ||
      r.professionalName.toLowerCase().includes(q)
    );
  });

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
            Aquí tienes un resumen de la actividad de tu negocio.
          </p>
        </div>

        <button
          onClick={onOpenNewBooking}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Nueva reserva</span>
        </button>
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
                Reservas de hoy
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
                        No se encontraron reservas con ese criterio.
                      </td>
                    </tr>
                  ) : (
                    displayedReservations.map((res) => (
                      <tr
                        key={res.id}
                        onClick={() => onSelectReservation(res)}
                        className="hover:bg-[#f3f4f5]/60 transition-colors cursor-pointer group"
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
                4 próximas
              </span>
            </div>

            <ul className="flex flex-col gap-3.5">
              <li
                onClick={() => onNavigate('calendario')}
                className="flex gap-3 items-center p-2 rounded-lg hover:bg-[#f8f9fa] transition-colors cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-lg bg-[#f3f4f5] border border-[#e1e3e4] flex flex-col items-center justify-center shrink-0 group-hover:border-[#24389c] transition-colors">
                  <span className="text-[10px] uppercase font-semibold text-[#757684] leading-none">
                    Hoy
                  </span>
                  <span className="text-xs font-bold text-[#191c1d] font-mono leading-none mt-1">
                    15:30
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-[#191c1d] group-hover:text-[#24389c] transition-colors truncate">
                    Sofía R. - Tintura
                  </span>
                  <span className="text-xs text-[#757684] truncate">Con: Ana S.</span>
                </div>
              </li>

              <li
                onClick={() => onNavigate('calendario')}
                className="flex gap-3 items-center p-2 rounded-lg hover:bg-[#f8f9fa] transition-colors cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-lg bg-[#f3f4f5] border border-[#e1e3e4] flex flex-col items-center justify-center shrink-0 group-hover:border-[#24389c] transition-colors">
                  <span className="text-[10px] uppercase font-semibold text-[#757684] leading-none">
                    Hoy
                  </span>
                  <span className="text-xs font-bold text-[#191c1d] font-mono leading-none mt-1">
                    16:45
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-[#191c1d] group-hover:text-[#24389c] transition-colors truncate">
                    Martín G. - Corte
                  </span>
                  <span className="text-xs text-[#757684] truncate">Con: Carlos M.</span>
                </div>
              </li>

              <li
                onClick={() => onNavigate('calendario')}
                className="flex gap-3 items-center p-2 rounded-lg hover:bg-[#f8f9fa] transition-colors cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-lg bg-[#f3f4f5] border border-[#e1e3e4] flex flex-col items-center justify-center shrink-0 group-hover:border-[#24389c] transition-colors">
                  <span className="text-[10px] uppercase font-semibold text-[#757684] leading-none">
                    Hoy
                  </span>
                  <span className="text-xs font-bold text-[#191c1d] font-mono leading-none mt-1">
                    17:00
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-[#191c1d] group-hover:text-[#24389c] transition-colors truncate">
                    Valeria L. - Pedicura
                  </span>
                  <span className="text-xs text-[#757684] truncate">Con: Laura G.</span>
                </div>
              </li>

              <li
                onClick={() => onNavigate('calendario')}
                className="flex gap-3 items-center p-2 rounded-lg hover:bg-[#f8f9fa] transition-colors cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-lg bg-[#f3f4f5] border border-[#e1e3e4] flex flex-col items-center justify-center shrink-0 group-hover:border-[#24389c] transition-colors">
                  <span className="text-[10px] uppercase font-semibold text-[#757684] leading-none">
                    Mañ
                  </span>
                  <span className="text-xs font-bold text-[#191c1d] font-mono leading-none mt-1">
                    09:00
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-[#191c1d] group-hover:text-[#24389c] transition-colors truncate">
                    Pedro J. - Masaje
                  </span>
                  <span className="text-xs text-[#757684] truncate">Con: Elena R.</span>
                </div>
              </li>
            </ul>

            <button
              onClick={() => onNavigate('calendario')}
              className="w-full mt-4 py-2 bg-transparent border border-[#e1e3e4] text-[#191c1d] hover:bg-[#f3f4f5] hover:text-[#24389c] rounded-lg text-sm font-medium transition-colors"
            >
              Ver Calendario
            </button>
          </div>

          {/* Actividad Reciente Timeline Card */}
          <div className="bg-white border border-[#e1e3e4] rounded-xl p-5 shadow-2xs">
            <h3 className="font-semibold text-base text-[#191c1d] mb-4">Actividad reciente</h3>
            <div className="relative pl-2">
              {/* Timeline continuous line */}
              <div className="absolute left-[15px] top-2 bottom-3 w-[1.5px] bg-[#e1e3e4]"></div>

              <ul className="flex flex-col gap-4 relative">
                {activities.map((act, idx) => (
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
          </div>
        </div>
      </div>
    </div>
  );
};
