import React from 'react';
import { ViewMode, BusinessConfig } from '../types';
import { TurniaLogo } from './TurniaLogo';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  pendingCount?: number;
  onOpenProfile: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  businessConfig?: BusinessConfig;
}

interface NavItem {
  id: ViewMode;
  label: string;
  icon: string;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  pendingCount = 0,
  onOpenProfile,
  isMobileOpen = false,
  onCloseMobile,
  businessConfig,
}) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'reservas', label: 'Reservas', icon: 'event_available', badge: pendingCount },
    { id: 'calendario', label: 'Calendario', icon: 'calendar_month' },
    { id: 'clientes', label: 'Clientes', icon: 'group' },
    { id: 'servicios', label: 'Servicios', icon: 'content_cut' },
    { id: 'profesionales', label: 'Profesionales', icon: 'badge' },
    { id: 'horarios', label: 'Horarios', icon: 'schedule' },
    { id: 'reportes', label: 'Reportes', icon: 'assessment' },
    { id: 'configuracion', label: 'Configuración', icon: 'settings' },
  ];

  const handleItemClick = (id: ViewMode) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-[260px] bg-white border-r border-[#e1e3e4] flex flex-col py-6 px-4 z-50 transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header Brand with Dynamic Business Logo */}
        <div className="mb-8 px-2 flex items-center justify-between">
          <button
            onClick={() => handleItemClick('dashboard')}
            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#24389c] rounded-md transition-opacity hover:opacity-90 w-full"
            title="Ir al Dashboard"
          >
            <TurniaLogo
              logoUrl={businessConfig?.logoUrl}
              businessName={businessConfig?.name}
              category={businessConfig?.category}
            />
          </button>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 text-[#757684] hover:text-[#191c1d] rounded-md shrink-0 ml-2"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-all duration-150 group text-left ${
                  isActive
                    ? 'text-[#24389c] font-bold bg-[#bac3ff]/20 border-l-4 border-[#24389c] shadow-xs'
                    : 'text-[#454652] hover:text-[#24389c] hover:bg-[#f3f4f5] font-normal'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[20px] transition-colors ${
                      isActive
                        ? 'text-[#24389c]'
                        : 'text-[#757684] group-hover:text-[#24389c]'
                    }`}
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && item.badge > 0 ? (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[#24389c] text-white'
                        : 'bg-[#ffdad6] text-[#93000a]'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Footer Admin Profile */}
        <div className="mt-auto pt-4 border-t border-[#e1e3e4]">
          <button
            onClick={onOpenProfile}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#454652] hover:text-[#24389c] hover:bg-[#f3f4f5] transition-colors text-sm text-left group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#24389c] to-[#3f51b5] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              A
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-[#191c1d] group-hover:text-[#24389c] text-sm truncate">
                {businessConfig?.name || 'Admin Profile'}
              </span>
              <span className="text-[11px] text-[#757684]">Administrador</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
