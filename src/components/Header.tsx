import React, { useState, useRef, useEffect } from 'react';
import { ADMIN_AVATAR_URL } from '../data/mockData';
import { ActivityItem, ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewBooking: () => void;
  onOpenProfile: () => void;
  onOpenMobileMenu: () => void;
  activities: ActivityItem[];
  onNavigate: (view: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  searchQuery,
  onSearchChange,
  onOpenNewBooking,
  onOpenProfile,
  onOpenMobileMenu,
  activities,
  onNavigate,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setShowHelp(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchPlaceholders: Record<ViewMode, string> = {
    dashboard: 'Buscar reservas, clientes, servicios...',
    reservas: 'Buscar por cliente o teléfono...',
    calendario: 'Buscar citas en calendario...',
    clientes: 'Buscar clientes registrados...',
    servicios: 'Buscar servicios por nombre o categoría...',
    profesionales: 'Buscar profesionales por nombre o rol...',
    horarios: 'Buscar franjas horarias...',
    reportes: 'Buscar métricas o reportes...',
    configuracion: 'Buscar ajustes del negocio...',
  };

  return (
    <header className="flex justify-between items-center w-full h-[64px] px-4 md:px-8 bg-white border-b border-[#e1e3e4] sticky top-0 z-30 shadow-2xs">
      {/* Left side: Mobile button + Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-[#454652] hover:bg-[#f3f4f5] rounded-lg transition-colors"
          aria-label="Abrir menú"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <div className="relative w-full max-w-[340px]">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757684] text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholders[currentView] || 'Buscar...'}
            className="w-full pl-10 pr-8 py-2 bg-[#f3f4f5] hover:bg-[#edeeef] focus:bg-white border border-[#e1e3e4] rounded-lg text-sm text-[#191c1d] placeholder-[#757684] focus:outline-none focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#757684] hover:text-[#191c1d] p-0.5 rounded-full"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right side: Notifications, Help, Profile */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[#454652] hover:text-[#24389c] hover:bg-[#f3f4f5] rounded-full transition-colors"
            title="Notificaciones"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#e1e3e4] rounded-xl shadow-lg py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-2 border-b border-[#e1e3e4] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-[#191c1d]">Notificaciones</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#dee0ff] text-[#24389c] font-medium">
                    {activities.length} nuevas
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="text-xs text-[#24389c] hover:underline font-medium"
                >
                  Ver resumen
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#f3f4f5]">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 hover:bg-[#f8f9fa] transition-colors flex items-start gap-3 cursor-pointer"
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('reservas');
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#f3f4f5] flex items-center justify-center shrink-0 text-[#24389c] mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">
                        {act.type === 'cancellation'
                          ? 'event_busy'
                          : act.type === 'payment'
                          ? 'payments'
                          : act.type === 'new_client'
                          ? 'person_add'
                          : 'calendar_clock'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#191c1d] leading-snug">
                        {act.title}
                      </p>
                      <span className="text-[11px] text-[#757684] mt-0.5 block">
                        {act.timeAgo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help & Guide Popover */}
        <div className="relative" ref={helpRef}>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 text-[#454652] hover:text-[#24389c] hover:bg-[#f3f4f5] rounded-full transition-colors"
            title="Ayuda y documentación"
          >
            <span className="material-symbols-outlined text-[22px]">help_outline</span>
          </button>

          {showHelp && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-[#e1e3e4] rounded-xl shadow-lg p-4 z-50">
              <h4 className="font-semibold text-sm text-[#191c1d] mb-1">
                Centro de Asistencia TURNIA
              </h4>
              <p className="text-xs text-[#454652] mb-3">
                Plataforma SaaS para gestionar citas, horarios, profesionales y reportes en tiempo real.
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-[#f3f4f5] rounded-lg">
                  <span className="font-semibold text-[#24389c] block">Atajos rápidos:</span>
                  <span className="text-[#757684]">
                    Usa "+ Nueva reserva" para agendar citas al instante.
                  </span>
                </div>
                <div className="p-2 bg-[#f3f4f5] rounded-lg">
                  <span className="font-semibold text-[#24389c] block">Horarios y festivos:</span>
                  <span className="text-[#757684]">
                    Configura descansos y bloqueos en el módulo de Horarios.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar trigger */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#24389c]/40 transition-all"
          title="Ver perfil de administrador"
        >
          <div className="w-8 h-8 rounded-full bg-[#3f51b5] text-white flex items-center justify-center overflow-hidden border border-[#e1e3e4] shadow-2xs font-semibold text-sm">
            {!avatarError ? (
              <img
                src={ADMIN_AVATAR_URL}
                alt="Admin Avatar"
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span>A</span>
            )}
          </div>
        </button>
      </div>
    </header>
  );
};
