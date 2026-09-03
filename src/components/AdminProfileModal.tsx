import React from 'react';
import { BusinessConfig, AuthUser } from '../types';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSettings: () => void;
  onLogout: () => void;
  config?: BusinessConfig;
  user?: AuthUser | null;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  onNavigateToSettings,
  onLogout,
  config,
  user,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in duration-150">
        <div className="flex justify-between items-center pb-3 border-b border-[#e1e3e4] mb-4">
          <h3 className="font-bold text-lg text-[#191c1d]">Perfil de Administrador</h3>
          <button
            onClick={onClose}
            className="p-1 text-[#757684] hover:text-[#191c1d] rounded-lg"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-col items-center text-center py-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#24389c] to-[#3f51b5] text-white font-bold text-2xl flex items-center justify-center border-2 border-white shadow-md mb-3">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <h4 className="font-bold text-lg text-[#191c1d]">
            {user?.name || config?.name || 'Administrador Turnia'}
          </h4>
          <p className="text-xs text-[#757684]">{user?.email || 'admin@turnia.com'}</p>
          <span className="mt-2 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-[#dee0ff] text-[#24389c]">
            Super Administrador · TURNIA
          </span>
        </div>

        <div className="space-y-2.5 py-4 border-y border-[#f3f4f5] text-xs">
          <div className="flex justify-between py-1">
            <span className="text-[#757684]">Rol de acceso:</span>
            <span className="font-semibold text-[#191c1d] uppercase">{user?.role || 'Admin'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[#757684]">Estado de la cuenta:</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Activo & Verificado
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[#757684]">Negocio vinculado:</span>
            <span className="font-semibold text-[#24389c]">{config?.name || 'Turnia SaaS'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[#757684]">Zona Horaria:</span>
            <span className="text-[#454652]">{config?.timeZone || 'America/Bogota'}</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-2">
          <button
            onClick={() => {
              onClose();
              onNavigateToSettings();
            }}
            className="w-full py-2 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">settings</span>
            <span>Configuración de cuenta</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full py-2 bg-[#ffdad6]/40 hover:bg-[#ffdad6] text-[#ba1a1a] border border-[#ffdad6] rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
