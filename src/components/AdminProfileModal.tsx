import React from 'react';
import { ADMIN_AVATAR_URL } from '../data/mockData';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSettings: () => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  onNavigateToSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
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
          <div className="w-20 h-20 rounded-full border-2 border-[#24389c] p-0.5 overflow-hidden shadow-sm mb-3">
            <img
              src={ADMIN_AVATAR_URL}
              alt="Admin Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h4 className="font-bold text-lg text-[#191c1d]">Administrador Principal</h4>
          <p className="text-xs text-[#757684]">admin@estudioelite.com</p>
          <span className="mt-2 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-[#dee0ff] text-[#24389c]">
            Super Administrador · TURNIA
          </span>
        </div>

        <div className="space-y-2.5 py-4 border-y border-[#f3f4f5] text-xs">
          <div className="flex justify-between py-1">
            <span className="text-[#757684]">Rol de acceso:</span>
            <span className="font-semibold text-[#191c1d]">Propietario / Gerencia</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[#757684]">Estado de la cuenta:</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Activo & Verificado
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[#757684]">Plan actual:</span>
            <span className="font-semibold text-[#24389c]">TURNIA Pro Enterprise</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[#757684]">Última conexión:</span>
            <span className="text-[#454652]">Hoy, 09:15 AM</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-2">
          <button
            onClick={() => {
              onClose();
              onNavigateToSettings();
            }}
            className="w-full py-2 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">settings</span>
            <span>Configuración de cuenta</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 bg-[#f8f9fa] hover:bg-[#edeeef] text-[#454652] rounded-lg text-xs font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
