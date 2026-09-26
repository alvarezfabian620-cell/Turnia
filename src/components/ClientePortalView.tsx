import React, { useState } from 'react';
import { Reservation, ServiceItem, AuthUser, BusinessConfig } from '../types';

interface ClientePortalViewProps {
  currentUser: AuthUser;
  reservations: Reservation[];
  services: ServiceItem[];
  businessConfig: BusinessConfig;
  onOpenNewBooking: (prefill?: Partial<Reservation>) => void;
  onCancelReservation: (res: Reservation) => void;
}

export const ClientePortalView: React.FC<ClientePortalViewProps> = ({
  currentUser,
  reservations,
  services,
  onOpenNewBooking,
  onCancelReservation,
}) => {
  const [filterMode, setFilterMode] = useState<'todas' | 'activas' | 'historial'>('todas');

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

  const activeReservations = myReservations.filter(
    (r) => r.status === 'pendiente' || r.status === 'confirmada' || r.status === 'en_curso'
  );

  const pastReservations = myReservations.filter(
    (r) => r.status === 'completada' || r.status === 'cancelada'
  );

  const displayedReservations =
    filterMode === 'activas'
      ? activeReservations
      : filterMode === 'historial'
      ? pastReservations
      : myReservations;

  const activeServices = services.filter((s) => s.active);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Unified Elegant Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e1e3e4]">
        <div>
          <h2 className="text-2xl md:text-[28px] font-bold text-[#191c1d] tracking-tight">
            Hola, {currentUser.name}
          </h2>
          <p className="text-[#5f6368] text-sm mt-1">
            Explora los servicios disponibles y agenda tu próxima cita en segundos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-[#5f6368] bg-white border border-[#e1e3e4] px-3.5 py-2 rounded-xl shadow-2xs font-medium">
            Servicios disponibles: <strong className="text-[#24389c] font-bold">{activeServices.length}</strong>
          </span>
          {activeReservations.length > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-2 bg-[#e1f5ec] text-[#047857] border border-[#a7f3d0] rounded-xl text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#047857]" />
              <span>{activeReservations.length} {activeReservations.length === 1 ? 'cita activa' : 'citas activas'}</span>
            </div>
          )}
        </div>
      </div>

      {/* 1. MAIN SECTION: CATÁLOGO DE SERVICIOS */}
      <div className="space-y-4">
        {/* Services Grid (Max 2 rows before smooth internal scroll) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[460px] overflow-y-auto pr-1.5 scroll-smooth">
          {activeServices.map((service) => (
            <div
              key={service.id}
              className="p-5 border border-[#e1e3e4] rounded-2xl bg-white hover:border-[#24389c] hover:shadow-xs transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#24389c] bg-[#dee0ff]/70 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                    {service.category || 'Servicio'}
                  </span>
                  <span className="text-xs text-[#757684] font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">schedule</span>
                    <span>{service.durationMinutes} min</span>
                  </span>
                </div>

                <h4 className="font-bold text-base text-[#191c1d] group-hover:text-[#24389c] transition-colors">
                  {service.name}
                </h4>

                <p className="text-xs text-[#757684] line-clamp-2 leading-relaxed">
                  {service.description || 'Servicio profesional con la mejor atención y garantía.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#f0f1f2] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#757684] block font-medium">Precio</span>
                  <span className="font-mono font-bold text-base text-[#191c1d]">
                    ${Number(service.price).toLocaleString('es-CO')}
                  </span>
                </div>

                <button
                  onClick={() =>
                    onOpenNewBooking({
                      serviceId: service.id,
                      serviceName: service.name,
                      price: service.price,
                      durationMinutes: service.durationMinutes,
                    })
                  }
                  className="px-4 py-2 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                  <span>Reservar Cita</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. SECTION: MIS CITAS Y SOLICITUDES (TABLA COMPLETA) */}
      <div className="bg-white border border-[#e1e3e4] rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#e1e3e4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-[#191c1d] tracking-tight">
              Mis Citas y Solicitudes
            </h3>
            <p className="text-xs text-[#757684] mt-0.5">
              Consulta en tiempo real el estado y detalle de tus citas agendadas.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[#f3f4f5] p-1 rounded-xl border border-[#e1e3e4] text-xs font-bold">
            <button
              onClick={() => setFilterMode('todas')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === 'todas'
                  ? 'bg-white text-[#24389c] shadow-2xs'
                  : 'text-[#757684] hover:text-[#191c1d]'
              }`}
            >
              Todas ({myReservations.length})
            </button>
            <button
              onClick={() => setFilterMode('activas')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === 'activas'
                  ? 'bg-white text-[#24389c] shadow-2xs'
                  : 'text-[#757684] hover:text-[#191c1d]'
              }`}
            >
              Activas ({activeReservations.length})
            </button>
            <button
              onClick={() => setFilterMode('historial')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === 'historial'
                  ? 'bg-white text-[#24389c] shadow-2xs'
                  : 'text-[#757684] hover:text-[#191c1d]'
              }`}
            >
              Historial ({pastReservations.length})
            </button>
          </div>
        </div>

        {/* Tabla de Citas */}
        <div className="overflow-x-auto">
          {displayedReservations.length === 0 ? (
            <div className="py-14 text-center text-[#757684] space-y-2">
              <span className="material-symbols-outlined text-[36px] text-[#bac3ff] block">event_available</span>
              <p className="font-semibold text-sm text-[#191c1d]">No tienes citas en esta sección</p>
              <p className="text-xs">Usa el catálogo superior para solicitar tu próxima reserva.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e1e3e4] bg-[#f8f9fa] text-xs font-bold text-[#757684] uppercase tracking-wider">
                  <th className="py-3.5 px-5">Fecha</th>
                  <th className="py-3.5 px-5">Hora</th>
                  <th className="py-3.5 px-5">Servicio</th>
                  <th className="py-3.5 px-5">Profesional</th>
                  <th className="py-3.5 px-5">Precio</th>
                  <th className="py-3.5 px-5">Estado</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
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
                    <td className="py-3.5 px-5 font-mono font-medium text-[#191c1d] whitespace-nowrap">
                      {res.date}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-[#24389c] whitespace-nowrap">
                      {res.time}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-[#191c1d] whitespace-nowrap">
                      {res.serviceName}
                    </td>
                    <td className="py-3.5 px-5 text-[#454652] whitespace-nowrap">
                      {res.professionalName}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-[#191c1d] whitespace-nowrap">
                      ${Number(res.price || 0).toLocaleString('es-CO')}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                          res.status === 'confirmada'
                            ? 'bg-[#e1f5ec] text-[#047857] border border-[#a7f3d0]'
                            : res.status === 'en_curso'
                            ? 'bg-[#e0e7ff] text-[#4338ca] border border-[#c7d2fe]'
                            : res.status === 'cancelada'
                            ? 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ffb4ab]'
                            : res.status === 'completada'
                            ? 'bg-[#dee0ff] text-[#24389c] border border-[#bac3ff]'
                            : 'bg-[#ffdcc6] text-[#8f4700] border border-[#fed7aa]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            res.status === 'confirmada'
                              ? 'bg-[#047857]'
                              : res.status === 'en_curso'
                              ? 'bg-[#4338ca]'
                              : res.status === 'cancelada'
                              ? 'bg-[#ba1a1a]'
                              : res.status === 'completada'
                              ? 'bg-[#24389c]'
                              : 'bg-[#8f4700]'
                          }`}
                        />
                        <span>{res.status === 'pendiente' ? 'Pendiente' : res.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      {res.status === 'pendiente' || res.status === 'confirmada' ? (
                        <button
                          onClick={() => {
                            if (window.confirm('¿Deseas cancelar esta solicitud de cita?')) {
                              onCancelReservation(res);
                            }
                          }}
                          className="px-3 py-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/40 border border-[#ffdad6] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                      ) : (
                        <span className="text-[#a0a1ab] font-medium">-</span>
                      )}
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
