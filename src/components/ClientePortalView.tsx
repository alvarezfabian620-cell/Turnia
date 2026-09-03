import React from 'react';
import { Reservation, ServiceItem, AuthUser, BusinessConfig } from '../types';

interface ClientePortalViewProps {
  currentUser: AuthUser;
  reservations: Reservation[];
  services: ServiceItem[];
  businessConfig: BusinessConfig;
  onOpenNewBooking: () => void;
  onCancelReservation: (res: Reservation) => void;
}

export const ClientePortalView: React.FC<ClientePortalViewProps> = ({
  currentUser,
  reservations,
  services,
  businessConfig,
  onOpenNewBooking,
  onCancelReservation,
}) => {
  // Filter appointments for this client
  const myReservations = reservations.filter((r) => {
    if (r.clientEmail && currentUser.email && r.clientEmail.toLowerCase() === currentUser.email.toLowerCase()) {
      return true;
    }
    if (r.clientName.toLowerCase() === currentUser.name.toLowerCase()) {
      return true;
    }
    return false;
  });

  const upcomingReservations = myReservations.filter(
    (r) => r.status === 'confirmada' || r.status === 'pendiente' || r.status === 'en_curso'
  );

  const pastReservations = myReservations.filter(
    (r) => r.status === 'completada' || r.status === 'cancelada'
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Client Welcome Hero Card */}
      <div className="bg-gradient-to-r from-[#24389c] to-[#3f51b5] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-full text-xs font-bold">
            <span>Portal del Cliente</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            ¡Hola, {currentUser.name}!
          </h2>
          <p className="text-white/80 text-xs sm:text-sm max-w-lg">
            Bienvenido a {businessConfig.name || 'nuestro centro'}. Gestiona tus citas agendadas o reserva un nuevo servicio cuando quieras.
          </p>
        </div>
      </div>

      {/* Upcoming Appointments Section */}
      <div className="bg-white border border-[#e1e3e4] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#e1e3e4] pb-4">
          <h3 className="font-bold text-lg text-[#191c1d] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#24389c] text-[22px]">event_upcoming</span>
            <span>Tus Próximas Citas ({upcomingReservations.length})</span>
          </h3>

          <button
            onClick={onOpenNewBooking}
            className="px-4 py-2 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Agendar Cita</span>
          </button>
        </div>

        {upcomingReservations.length === 0 ? (
          <div className="py-8 text-center text-[#757684] space-y-2">
            <span className="material-symbols-outlined text-[40px] text-[#bac3ff] block">event_busy</span>
            <p className="font-bold text-sm text-[#191c1d]">No tienes citas programadas próximas</p>
            <p className="text-xs">Agenda una cita para asegurar tu espacio con tu profesional preferido.</p>
            <button
              onClick={onOpenNewBooking}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#24389c] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Agendar servicio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingReservations.map((res) => (
              <div
                key={res.id}
                className="p-4 border border-[#bac3ff] bg-[#f8f9fa] rounded-2xl flex flex-col justify-between gap-3 shadow-2xs hover:border-[#24389c] transition-all"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-base text-[#191c1d]">{res.serviceName}</span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        res.status === 'confirmada'
                          ? 'bg-[#e1f5ec] text-[#047857]'
                          : 'bg-[#ffdcc6] text-[#8f4700]'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>

                  <div className="text-xs text-[#454652] space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#757684]">person</span>
                      <span>Profesional: <strong>{res.professionalName}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 font-mono font-bold text-[#24389c]">
                      <span className="material-symbols-outlined text-[16px] text-[#757684]">schedule</span>
                      <span>{res.date} a las {res.time}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#e1e3e4] flex items-center justify-between">
                  <span className="font-mono font-bold text-base text-[#191c1d]">
                    ${Number(res.price || 0).toLocaleString('es-CO')}
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de cancelar tu cita?')) {
                        onCancelReservation(res);
                      }
                    }}
                    className="px-3 py-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/40 border border-[#ffdad6] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
