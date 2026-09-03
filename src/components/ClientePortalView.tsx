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
  businessConfig,
  onOpenNewBooking,
  onCancelReservation,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [tabMode, setTabMode] = useState<'activas' | 'historial'>('activas');

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

  // Available categories
  const categories = ['todos', ...Array.from(new Set(services.map((s) => s.category).filter(Boolean)))];

  const filteredServices = services.filter((s) => {
    if (!s.active) return false;
    if (activeCategory === 'todos') return true;
    return s.category === activeCategory;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Client Welcome Hero Card */}
      <div className="bg-gradient-to-r from-[#24389c] to-[#3f51b5] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-full text-xs font-bold">
            <span>Portal del Cliente</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            ¡Hola, {currentUser.name}!
          </h2>
          <p className="text-white/80 text-xs sm:text-sm max-w-xl">
            Bienvenido a {businessConfig.name || 'nuestro centro'}. Explora los servicios disponibles abajo y agenda tu cita cuando lo desees.
          </p>
        </div>

        {activeReservations.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center sm:text-right shrink-0">
            <span className="text-xs text-white/80 block uppercase font-bold tracking-wider">
              Citas Activas
            </span>
            <span className="text-2xl font-bold text-white">
              {activeReservations.length}
            </span>
          </div>
        )}
      </div>

      {/* 1. MAIN SECTION: CATÁLOGO DE SERVICIOS DISPONIBLES */}
      <div className="bg-white border border-[#e1e3e4] rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e1e3e4] pb-4">
          <div>
            <h3 className="font-bold text-xl text-[#191c1d] flex items-center gap-2 tracking-tight">
              <span className="material-symbols-outlined text-[#24389c] text-[24px]">content_cut</span>
              <span>Catálogo de Servicios Disponibles</span>
            </h3>
            <p className="text-xs text-[#757684] mt-0.5">
              Haz clic en cualquier servicio para solicitar tu reserva de inmediato.
            </p>
          </div>

          {/* Clean Wrapped Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#f3f4f5] p-1.5 rounded-2xl border border-[#e1e3e4]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                  activeCategory === cat
                    ? 'bg-[#24389c] text-white shadow-2xs'
                    : 'text-[#454652] hover:text-[#191c1d] hover:bg-white/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
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

      {/* 2. SECTION: MIS CITAS Y ESTADO DE SOLICITUDES */}
      <div className="bg-white border border-[#e1e3e4] rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e1e3e4] pb-4">
          <div>
            <h3 className="font-bold text-xl text-[#191c1d] flex items-center gap-2 tracking-tight">
              <span className="material-symbols-outlined text-[#24389c] text-[24px]">event_available</span>
              <span>Mis Citas y Solicitudes</span>
            </h3>
            <p className="text-xs text-[#757684] mt-0.5">
              Consulta en tiempo real el estado de tus citas (Pendiente, Confirmada, etc.).
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[#f3f4f5] p-1 rounded-xl border border-[#e1e3e4] text-xs font-bold">
            <button
              onClick={() => setTabMode('activas')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                tabMode === 'activas'
                  ? 'bg-white text-[#24389c] shadow-2xs'
                  : 'text-[#757684] hover:text-[#191c1d]'
              }`}
            >
              Citas Activas ({activeReservations.length})
            </button>
            <button
              onClick={() => setTabMode('historial')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                tabMode === 'historial'
                  ? 'bg-white text-[#24389c] shadow-2xs'
                  : 'text-[#757684] hover:text-[#191c1d]'
              }`}
            >
              Historial Pasado ({pastReservations.length})
            </button>
          </div>
        </div>

        {tabMode === 'activas' && (
          <div>
            {activeReservations.length === 0 ? (
              <div className="py-12 text-center text-[#757684] space-y-2">
                <span className="material-symbols-outlined text-[40px] text-[#bac3ff] block">event_busy</span>
                <p className="font-bold text-sm text-[#191c1d]">No tienes citas activas en este momento</p>
                <p className="text-xs">Elige un servicio del catálogo superior para solicitar tu reserva.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeReservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-5 border border-[#e1e3e4] bg-[#f8f9fa] rounded-2xl flex flex-col justify-between gap-4 shadow-2xs hover:border-[#bac3ff] transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="font-bold text-base text-[#191c1d] block">
                            {res.serviceName}
                          </span>
                          <span className="text-xs text-[#757684]">
                            Profesional: <strong className="text-[#191c1d]">{res.professionalName}</strong>
                          </span>
                        </div>

                        {/* Status Pill with Clear Badges */}
                        <div className="text-right shrink-0">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                              res.status === 'confirmada'
                                ? 'bg-[#e1f5ec] text-[#047857] border border-[#a7f3d0]'
                                : res.status === 'en_curso'
                                ? 'bg-[#e0e7ff] text-[#4338ca] border border-[#c7d2fe]'
                                : res.status === 'cancelada'
                                ? 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ffb4ab]'
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
                                  : 'bg-[#8f4700]'
                              }`}
                            />
                            <span>{res.status === 'pendiente' ? 'Pendiente de aprobación' : res.status.replace('_', ' ')}</span>
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-[#e1e3e4] rounded-xl flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-[#191c1d]">
                          <span className="material-symbols-outlined text-[16px] text-[#24389c]">event</span>
                          <span className="font-bold">{res.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#24389c] font-bold">
                          <span className="material-symbols-outlined text-[16px]">schedule</span>
                          <span>{res.time}</span>
                        </div>
                        <div className="font-bold text-[#191c1d]">
                          ${Number(res.price || 0).toLocaleString('es-CO')}
                        </div>
                      </div>

                      {res.status === 'pendiente' && (
                        <p className="text-[11px] text-[#8f4700] bg-[#ffdcc6]/40 p-2 rounded-lg">
                          Tu solicitud está en espera de confirmación por el equipo. Te notificaremos en cuanto sea aprobada.
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#e1e3e4] flex items-center justify-end">
                      <button
                        onClick={() => {
                          if (window.confirm('¿Deseas cancelar esta solicitud de cita?')) {
                            onCancelReservation(res);
                          }
                        }}
                        className="px-3.5 py-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/40 border border-[#ffdad6] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancelar Solicitud
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tabMode === 'historial' && (
          <div>
            {pastReservations.length === 0 ? (
              <div className="py-12 text-center text-[#757684]">
                <p className="font-semibold text-sm text-[#191c1d]">No tienes historial de citas pasadas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastReservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-4 border border-[#e1e3e4] bg-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-sm text-[#191c1d]">{res.serviceName}</span>
                      <div className="text-[#757684] mt-0.5">
                        {res.date} a las {res.time} • Profesional: <strong>{res.professionalName}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-[#191c1d]">
                        ${Number(res.price || 0).toLocaleString('es-CO')}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold capitalize ${
                          res.status === 'completada'
                            ? 'bg-[#dee0ff] text-[#24389c]'
                            : 'bg-[#ffdad6] text-[#ba1a1a]'
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
