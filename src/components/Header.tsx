import React, { useState, useRef, useEffect } from 'react';
import { ActivityItem, ViewMode, AuthUser, UserRole } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onOpenNewBooking: () => void;
  onOpenProfile: () => void;
  onOpenMobileMenu: () => void;
  activities: ActivityItem[];
  onNavigate: (view: ViewMode) => void;
  onClearNotifications?: () => void;
  onDeleteNotification?: (id: string) => void;
  isConnectedWS?: boolean;
  currentUser?: AuthUser | null;
  onSwitchRole?: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenProfile,
  onOpenMobileMenu,
  activities,
  onNavigate,
  onClearNotifications,
  onDeleteNotification,
  currentUser,
  onSwitchRole,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const notifRef = useRef<HTMLDivElement>(null);

  // Calculate unread count
  const unreadCount = activities.filter((act) => !readIds.has(act.id)).length;

  // Mark all as read when opening notifications
  const handleToggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState) {
      const allIds = new Set(activities.map((a) => a.id));
      setReadIds(allIds);
    }
  };

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const role = currentUser?.role || 'admin';

  return (
    <header className="flex justify-between items-center w-full h-[64px] px-4 md:px-8 bg-white border-b border-[#e1e3e4] sticky top-0 z-30 shadow-2xs">
      {/* Left side: Mobile menu button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-[#454652] hover:bg-[#f3f4f5] rounded-lg transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
      </div>

      {/* Right side: Role Switcher Tester, Notifications, Profile */}
      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        {/* Quick Role Tester Selector */}
        {onSwitchRole && (
          <div className="hidden sm:flex items-center gap-1.5 p-1 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-xs">
            <span className="text-[10px] font-bold text-[#757684] uppercase tracking-wider pl-2">
              Modo Rol:
            </span>
            <select
              value={role}
              onChange={(e) => onSwitchRole(e.target.value as UserRole)}
              className="bg-white border border-[#e1e3e4] rounded-lg px-2.5 py-1 text-xs font-bold text-[#24389c] focus:outline-none cursor-pointer"
              title="Cambiar de rol para probar las pantallas y permisos"
            >
              <option value="admin">👑 Administrador</option>
              <option value="empleado">💼 Empleado (Carlos M.)</option>
              <option value="cliente">👤 Cliente (Andrés C.)</option>
            </select>
          </div>
        )}

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleToggleNotifications}
            className="relative p-2 text-[#454652] hover:text-[#24389c] hover:bg-[#f3f4f5] rounded-full transition-colors cursor-pointer"
            title="Notificaciones en tiempo real"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-[#ba1a1a] text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white animate-in zoom-in-50">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#e1e3e4] rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
              <div className="px-4 pb-3 border-b border-[#e1e3e4] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#191c1d]">Notificaciones</h4>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#dee0ff] text-[#24389c] font-bold">
                    {activities.length} total
                  </span>
                </div>
                {activities.length > 0 && onClearNotifications && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearNotifications();
                    }}
                    className="text-xs text-[#ba1a1a] hover:underline font-semibold cursor-pointer flex items-center gap-1"
                    title="Borrar todas las notificaciones"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
                    <span>Limpiar</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#f3f4f5]">
                {activities.length === 0 ? (
                  <div className="py-10 px-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#dee0ff]/60 text-[#24389c] flex items-center justify-center mx-auto mb-2">
                      <span className="material-symbols-outlined text-[20px]">notifications_off</span>
                    </div>
                    <p className="text-xs font-semibold text-[#191c1d]">No tienes notificaciones</p>
                    <p className="text-[11px] text-[#757684] mt-0.5">Te avisaremos tan pronto haya una nueva cita o actividad.</p>
                  </div>
                ) : (
                  activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 hover:bg-[#f8f9fa] transition-colors flex items-start gap-3 cursor-pointer group relative"
                      onClick={() => {
                        setShowNotifications(false);
                        onNavigate(role === 'empleado' ? 'empleado_agenda' : role === 'cliente' ? 'cliente_portal' : 'reservas');
                      }}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#f3f4f5] flex items-center justify-center shrink-0 text-[#24389c] mt-0.5 border border-[#e1e3e4] group-hover:bg-[#dee0ff] transition-colors">
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
                      <div className="flex-1 min-w-0 pr-6">
                        <p className="text-xs font-semibold text-[#191c1d] leading-snug group-hover:text-[#24389c] transition-colors">
                          {act.title}
                        </p>
                        <span className="text-[11px] text-[#757684] mt-0.5 block font-mono">
                          {act.timeAgo}
                        </span>
                      </div>
                      {onDeleteNotification && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNotification(act.id);
                          }}
                          className="absolute right-2.5 top-3.5 p-1 text-[#c5c5d4] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Eliminar notificación"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar trigger */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#24389c]/40 transition-all cursor-pointer"
          title="Ver perfil de usuario"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#24389c] to-[#3f51b5] text-white flex items-center justify-center border border-[#e1e3e4] shadow-2xs font-bold text-xs">
            <span>{currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'US'}</span>
          </div>
        </button>
      </div>
    </header>
  );
};
