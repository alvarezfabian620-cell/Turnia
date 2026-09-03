import React, { useState, useMemo } from 'react';
import { Reservation, Professional, ServiceItem, AuthUser, ReservationStatus } from '../types';

interface EmpleadoDashboardViewProps {
  currentUser: AuthUser;
  professional?: Professional;
  reservations: Reservation[];
  services: ServiceItem[];
  onUpdateReservationStatus: (id: string, newStatus: ReservationStatus) => void;
  onOpenNewBookingForMe: () => void;
  onNavigate: (view: any) => void;
}

export const EmpleadoDashboardView: React.FC<EmpleadoDashboardViewProps> = ({
  currentUser,
  professional,
  reservations,
  onUpdateReservationStatus,
  onOpenNewBookingForMe,
  onNavigate,
}) => {
  const [statusFilter, setStatusFilter] = useState<'todas' | 'pendientes' | 'completadas'>('todas');

  const selectedDate = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Filter reservations assigned strictly to this employee
  const myReservations = useMemo(() => {
    if (!currentUser) return [];
    const normalizedUserName = currentUser.name.trim().toLowerCase();
    const profId = professional?.id || currentUser.professionalId;

    return reservations.filter((r) => {
      if (profId && r.professionalId === profId) return true;
      if (r.professionalName && r.professionalName.trim().toLowerCase() === normalizedUserName) return true;
      return false;
    });
  }, [reservations, professional, currentUser]);

  // Today's reservations
  const todayReservations = useMemo(() => {
    return myReservations
      .filter((r) => r.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [myReservations, selectedDate]);

  // Filtered by status
  const displayedReservations = useMemo(() => {
    if (statusFilter === 'pendientes') {
      return todayReservations.filter((r) => r.status === 'pendiente' || r.status === 'confirmada' || r.status === 'en_curso');
    }
    if (statusFilter === 'completadas') {
      return todayReservations.filter((r) => r.status === 'completada');
    }
    return todayReservations;
  }, [todayReservations, statusFilter]);

  // Completed & stats
  const completedMonth = myReservations.filter((r) => r.status === 'completada').length;
  const pendingCount = myReservations.filter((r) => r.status === 'pendiente' || r.status === 'confirmada').length;

  return (
    <div className="space-y-6">
      {/* Employee Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#e1e3e4] rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#24389c] to-[#3f51b5] text-white flex items-center justify-center font-bold text-xl shadow-xs">
            {currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#191c1d] tracking-tight">
              ¡Hola, {currentUser.name}!
            </h2>
            <p className="text-[#454652] text-xs sm:text-sm mt-0.5">
              {professional?.role || 'Especialista'} • Tienes{' '}
              <strong className="text-[#191c1d]">{todayReservations.length} citas programadas para hoy</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('empleado_agenda')}
            className="h-10 px-4 bg-[#f8f9fa] hover:bg-[#edeeef] text-[#24389c] border border-[#bac3ff] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            <span>Mi Agenda Completa</span>
          </button>
          <button
            onClick={onOpenNewBookingForMe}
            className="h-10 px-5 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Agendar Cita</span>
          </button>
        </div>
      </div>

      {/* Employee Personal Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Citas Hoy */}
        <div className="bg-white border border-[#e1e3e4] rounded-2xl p-5 shadow-2xs flex flex-col justify-between hover:border-[#bac3ff] transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-[#757684] uppercase tracking-wider">
              Citas para Hoy
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#dee0ff]/60 text-[#24389c] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">today</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-[#191c1d] tracking-tight">
            {todayReservations.length}
          </div>
        </div>

        {/* Metric 2: Pendientes */}
        <div className="bg-white border border-[#e1e3e4] rounded-2xl p-5 shadow-2xs flex flex-col justify-between hover:border-[#bac3ff] transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-[#757684] uppercase tracking-wider">
              Citas Pendientes
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ffdcc6]/60 text-[#8f4700] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-[#191c1d] tracking-tight">
            {pendingCount}
          </div>
        </div>

        {/* Metric 3: Citas Completadas */}
        <div className="bg-white border border-[#e1e3e4] rounded-2xl p-5 shadow-2xs flex flex-col justify-between hover:border-[#bac3ff] transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-[#757684] uppercase tracking-wider">
              Atendidas este Mes
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#e1f5ec] text-[#047857] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-[#191c1d] tracking-tight">
            {completedMonth}
          </div>
        </div>
      </div>

      {/* Unified Full-Width Today's Schedule Card */}
      <div className="bg-white border border-[#e1e3e4] rounded-2xl shadow-2xs overflow-hidden">
        {/* Card Header with Filters */}
        <div className="p-5 border-b border-[#e1e3e4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-[#191c1d] tracking-tight">
              Citas de Hoy
            </h3>
            <p className="text-xs text-[#757684] mt-0.5">
              Fecha: {selectedDate} • Total citas: <strong className="text-[#191c1d]">{todayReservations.length}</strong>
            </p>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#f3f4f5] p-1 rounded-xl border border-[#e1e3e4] text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('todas')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'todas'
                  ? 'bg-white text-[#24389c] font-bold shadow-2xs'
                  : 'text-[#757684] hover:text-[#191c1d]'
              }`}
            >
              Todas ({todayReservations.length})
            </button>
            <button
              onClick={() => setStatusFilter('pendientes')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'pendientes'
                  ? 'bg-white text-[#24389c] font-bold shadow-2xs'
                  : 'text-[#757684] hover:text-[#191c1d]'
              }`}
            >
              Pendientes ({todayReservations.filter((r) => r.status === 'pendiente' || r.status === 'confirmada' || r.status === 'en_curso').length})
            </button>
            <button
              onClick={() => setStatusFilter('completadas')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'completadas'
                  ? 'bg-white text-[#24389c] font-bold shadow-2xs'
                  : 'text-[#757684] hover:text-[#191c1d]'
              }`}
            >
              Completadas ({todayReservations.filter((r) => r.status === 'completada').length})
            </button>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto">
          {displayedReservations.length === 0 ? (
            <div className="py-14 text-center text-[#757684] space-y-2">
              <span className="material-symbols-outlined text-[36px] text-[#bac3ff] block">event_available</span>
              <p className="font-semibold text-sm text-[#191c1d]">No hay citas en este filtro para hoy</p>
              <p className="text-xs">Usa el botón "Agendar Cita" para programar una nueva reserva.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e1e3e4] bg-[#f8f9fa] text-xs font-bold text-[#757684] uppercase tracking-wider">
                  <th className="py-3 px-5">Hora</th>
                  <th className="py-3 px-5">Cliente</th>
                  <th className="py-3 px-5">Servicio</th>
                  <th className="py-3 px-5">Precio</th>
                  <th className="py-3 px-5">Estado</th>
                  <th className="py-3 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e3e4] text-xs sm:text-sm">
                {displayedReservations.map((res, index) => (
                  <tr
                    key={res.id}
                    className={`transition-colors ${
                      index % 2 === 1 ? 'bg-[#eff1f4]/40' : 'bg-white'
                    } hover:bg-[#dee0ff]/20`}
                  >
                    <td className="py-3.5 px-5 font-mono font-bold text-[#191c1d] whitespace-nowrap">
                      {res.time}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-[#191c1d] whitespace-nowrap">
                      {res.clientName}
                    </td>
                    <td className="py-3.5 px-5 text-[#454652] whitespace-nowrap">
                      {res.serviceName}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-[#24389c] whitespace-nowrap">
                      ${Number(res.price || 0).toLocaleString('es-CO')}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                          res.status === 'confirmada'
                            ? 'bg-[#e1f5ec] text-[#047857]'
                            : res.status === 'completada'
                            ? 'bg-[#dee0ff] text-[#24389c]'
                            : res.status === 'en_curso'
                            ? 'bg-[#e0e7ff] text-[#4338ca]'
                            : res.status === 'cancelada'
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : 'bg-[#ffdcc6] text-[#8f4700]'
                        }`}
                      >
                        {res.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {res.status !== 'completada' && (
                          <button
                            onClick={() => onUpdateReservationStatus(res.id, 'completada')}
                            className="px-2.5 py-1 bg-[#e1f5ec] hover:bg-[#a7f3d0] text-[#047857] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            title="Completar cita"
                          >
                            Completar
                          </button>
                        )}
                        {res.status !== 'en_curso' && res.status !== 'completada' && (
                          <button
                            onClick={() => onUpdateReservationStatus(res.id, 'en_curso')}
                            className="px-2.5 py-1 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            title="Iniciar atención"
                          >
                            Atender
                          </button>
                        )}
                        {res.status !== 'cancelada' && res.status !== 'completada' && (
                          <button
                            onClick={() => {
                              if (window.confirm('¿Deseas cancelar esta cita?')) {
                                onUpdateReservationStatus(res.id, 'cancelada');
                              }
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-[#ffdad6]/40 text-[#ba1a1a] border border-[#ffdad6] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            title="Cancelar cita"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
