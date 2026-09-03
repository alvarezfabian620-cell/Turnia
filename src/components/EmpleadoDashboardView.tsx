import React, { useState } from 'react';
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
  services,
  onUpdateReservationStatus,
  onOpenNewBookingForMe,
  onNavigate,
}) => {
  const [selectedDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  // Filter reservations assigned to this employee
  const myReservations = reservations.filter((r) => {
    if (professional?.id && r.professionalId === professional.id) return true;
    if (r.professionalName.toLowerCase() === currentUser.name.toLowerCase()) return true;
    return false;
  });

  // Today's reservations
  const todayReservations = myReservations
    .filter((r) => r.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  // Completed & stats
  const completedMonth = myReservations.filter((r) => r.status === 'completada').length;
  const totalRevenueMonth = myReservations
    .filter((r) => r.status === 'completada')
    .reduce((sum, r) => sum + (Number(r.price) || 0), 0);
  const pendingCount = myReservations.filter((r) => r.status === 'pendiente' || r.status === 'confirmada').length;

  // Next active appointment
  const nextAppointment = todayReservations.find(
    (r) => r.status === 'confirmada' || r.status === 'en_curso' || r.status === 'pendiente'
  );

  return (
    <div className="space-y-6">
      {/* Employee Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#e1e3e4] rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#24389c] to-[#3f51b5] text-white flex items-center justify-center font-bold text-xl shadow-xs">
            {currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold text-[#191c1d] tracking-tight">
                ¡Hola, {currentUser.name}! 👋
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#dee0ff] text-[#24389c]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#24389c]" />
                <span>Panel Profesional</span>
              </span>
            </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Metric 4: Ingresos Generados */}
        <div className="bg-white border border-[#e1e3e4] rounded-2xl p-5 shadow-2xs flex flex-col justify-between hover:border-[#bac3ff] transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-[#757684] uppercase tracking-wider">
              Ingresos Generados
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#dee0ff]/60 text-[#24389c] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-[#191c1d] font-mono tracking-tight">
            ${totalRevenueMonth.toLocaleString('es-CO')}
          </div>
        </div>
      </div>

      {/* Main Row: Next Active Appointment & Today's Schedule List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Client / Current Appointment Focus Card */}
        <div className="lg:col-span-1 bg-white border border-[#e1e3e4] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f1f2] mb-4">
              <h3 className="font-bold text-base text-[#191c1d] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#24389c] text-[20px]">person_pin</span>
                <span>Próxima Cita</span>
              </h3>
              {nextAppointment && (
                <span className="text-xs font-mono font-bold text-[#24389c] bg-[#dee0ff]/60 px-2.5 py-1 rounded-lg">
                  🕒 {nextAppointment.time}
                </span>
              )}
            </div>

            {nextAppointment ? (
              <div className="space-y-4">
                <div className="p-4 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl space-y-2">
                  <div className="font-bold text-lg text-[#191c1d]">{nextAppointment.clientName}</div>
                  {nextAppointment.clientPhone && (
                    <div className="text-xs font-mono text-[#454652] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-[#757684]">call</span>
                      <span>{nextAppointment.clientPhone}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-[#e1e3e4] flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#24389c]">{nextAppointment.serviceName}</span>
                    <span className="font-mono font-bold text-[#191c1d]">
                      ${Number(nextAppointment.price || 0).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#757684] uppercase tracking-wider">
                    Acción de Turno:
                  </label>
                  <div className="flex flex-col gap-2">
                    {nextAppointment.status !== 'en_curso' && (
                      <button
                        onClick={() => onUpdateReservationStatus(nextAppointment.id, 'en_curso')}
                        className="w-full py-2.5 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[17px]">play_circle</span>
                        <span>Iniciar Atención (En Curso)</span>
                      </button>
                    )}

                    <button
                      onClick={() => onUpdateReservationStatus(nextAppointment.id, 'completada')}
                      className="w-full py-2.5 bg-[#e1f5ec] hover:bg-[#a7f3d0] text-[#047857] border border-[#a7f3d0] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[17px]">check_circle</span>
                      <span>Marcar como Completada</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('¿Deseas cancelar esta cita?')) {
                          onUpdateReservationStatus(nextAppointment.id, 'cancelada');
                        }
                      }}
                      className="w-full py-2 bg-white hover:bg-[#ffdad6]/40 text-[#ba1a1a] border border-[#ffdad6] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">cancel</span>
                      <span>Cancelar Cita</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-[#757684] space-y-2">
                <span className="material-symbols-outlined text-[40px] text-[#bac3ff] block">
                  check_box
                </span>
                <p className="font-semibold text-sm text-[#191c1d]">¡Todo al día!</p>
                <p className="text-xs">No tienes más citas pendientes para hoy.</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Full Schedule Table */}
        <div className="lg:col-span-2 bg-white border border-[#e1e3e4] rounded-2xl overflow-hidden shadow-2xs flex flex-col">
          <div className="p-5 border-b border-[#e1e3e4] flex items-center justify-between">
            <h3 className="font-bold text-base text-[#191c1d] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#24389c] text-[20px]">view_timeline</span>
              <span>Citas de Hoy ({selectedDate})</span>
            </h3>
            <span className="text-xs text-[#757684]">
              Total: <strong>{todayReservations.length}</strong>
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {todayReservations.length === 0 ? (
              <div className="p-12 text-center text-[#757684] space-y-2">
                <span className="material-symbols-outlined text-[36px] text-[#bac3ff] block">event_available</span>
                <p className="font-semibold text-sm text-[#191c1d]">Sin citas programadas para hoy</p>
                <p className="text-xs">Aprovecha para descansar o agendar nuevos clientes.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e1e3e4] bg-[#f8f9fa] text-xs font-bold text-[#757684] uppercase tracking-wider">
                    <th className="py-3 px-4">Hora</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Servicio</th>
                    <th className="py-3 px-4">Precio</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1e3e4] text-xs sm:text-sm">
                  {todayReservations.map((res, index) => (
                    <tr
                      key={res.id}
                      className={`transition-colors ${
                        index % 2 === 1 ? 'bg-[#eff1f4]/40' : 'bg-white'
                      } hover:bg-[#dee0ff]/20`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#191c1d] whitespace-nowrap">
                        {res.time}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#191c1d] whitespace-nowrap">
                        {res.clientName}
                      </td>
                      <td className="py-3 px-4 text-[#454652] whitespace-nowrap">
                        {res.serviceName}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#24389c] whitespace-nowrap">
                        ${Number(res.price || 0).toLocaleString('es-CO')}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
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
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {res.status !== 'completada' && (
                            <button
                              onClick={() => onUpdateReservationStatus(res.id, 'completada')}
                              className="p-1.5 text-[#047857] hover:bg-[#e1f5ec] rounded-lg transition-colors cursor-pointer"
                              title="Completar cita"
                            >
                              <span className="material-symbols-outlined text-[18px] block">check</span>
                            </button>
                          )}
                          {res.status !== 'en_curso' && res.status !== 'completada' && (
                            <button
                              onClick={() => onUpdateReservationStatus(res.id, 'en_curso')}
                              className="p-1.5 text-[#24389c] hover:bg-[#dee0ff]/60 rounded-lg transition-colors cursor-pointer"
                              title="Iniciar atención"
                            >
                              <span className="material-symbols-outlined text-[18px] block">play_arrow</span>
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
    </div>
  );
};
