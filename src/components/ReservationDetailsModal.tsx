import React, { useState } from 'react';
import { Reservation, ReservationStatus } from '../types';

interface ReservationDetailsModalProps {
  reservation: Reservation | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: ReservationStatus) => void;
  onCancelReservation: (reservation: Reservation) => void;
  onDeleteReservation?: (id: string) => void;
}

export const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({
  reservation,
  onClose,
  onUpdateStatus,
  onCancelReservation,
  onDeleteReservation,
}) => {
  if (!reservation) return null;

  const [selectedStatus, setSelectedStatus] = useState<ReservationStatus>(reservation.status);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleStatusSave = () => {
    onUpdateStatus(reservation.id, selectedStatus);
    onClose();
  };

  const handleConfirmDelete = () => {
    if (onDeleteReservation) {
      onDeleteReservation(reservation.id);
    }
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleConfirmCancel = () => {
    onCancelReservation(reservation);
    setShowCancelConfirm(false);
    onClose();
  };

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'confirmada':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#dee0ff] text-[#24389c]">
            Confirmada
          </span>
        );
      case 'pendiente':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ffdcc6] text-[#6c3400]">
            Pendiente
          </span>
        );
      case 'en_curso':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e0e0ff] text-[#4c56af]">
            En curso
          </span>
        );
      case 'completada':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e1e3e4] text-[#454652]">
            Completada
          </span>
        );
      case 'cancelada':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ffdad6] text-[#ba1a1a]">
            Cancelada
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e1e3e4] animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Header without ID */}
        <div className="flex justify-between items-center pb-4 border-b border-[#e1e3e4] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#dee0ff] text-[#24389c] rounded-xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">event_note</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#191c1d] leading-snug">Detalles de la Cita</h3>
              <p className="text-xs text-[#757684]">Información y gestión de la reserva</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#757684] hover:text-[#191c1d] hover:bg-[#f3f4f5] rounded-lg transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Client & Status banner */}
          <div className="flex justify-between items-center p-3.5 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4]">
            <div>
              <span className="text-xs text-[#757684] block font-medium">Cliente</span>
              <span className="font-bold text-[#191c1d] text-base">{reservation.clientName}</span>
            </div>
            <div>{getStatusBadge(reservation.status)}</div>
          </div>

          {/* 4 Fully Separated Metric Blocks: Fecha, Hora, Duración, Tarifa */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            {/* 1. Fecha */}
            <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] flex flex-col justify-between">
              <span className="text-[#757684] block font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider">Fecha</span>
              <span className="font-bold text-[#191c1d] text-xs sm:text-sm mt-1 block font-mono">
                {reservation.date}
              </span>
            </div>

            {/* 2. Hora */}
            <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] flex flex-col justify-between">
              <span className="text-[#757684] block font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider">Hora</span>
              <span className="font-bold text-[#24389c] text-xs sm:text-sm mt-1 block font-mono">
                {reservation.time}
              </span>
            </div>

            {/* 3. Duración */}
            <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] flex flex-col justify-between">
              <span className="text-[#757684] block font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider">Duración</span>
              <span className="font-bold text-[#191c1d] text-xs sm:text-sm mt-1 block">
                {reservation.durationMinutes} min
              </span>
            </div>

            {/* 4. Tarifa */}
            <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] flex flex-col justify-between">
              <span className="text-[#757684] block font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider">Tarifa</span>
              <span className="font-bold text-[#24389c] text-xs sm:text-sm mt-1 block font-mono">
                ${Number(reservation.price || 0).toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          {/* Service and Professional details */}
          <div className="space-y-2.5 pt-3 border-t border-[#f3f4f5]">
            <div className="flex justify-between text-xs">
              <span className="text-[#757684]">Servicio contratado:</span>
              <span className="font-bold text-[#191c1d]">{reservation.serviceName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#757684]">Profesional asignado:</span>
              <span className="font-semibold text-[#191c1d]">{reservation.professionalName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#757684]">Contacto cliente:</span>
              <span className="font-mono font-medium text-[#191c1d]">
                {reservation.clientPhone || 'No registrado'}
              </span>
            </div>
          </div>

          {reservation.notes && (
            <div className="p-3 bg-[#f3f4f5] rounded-xl text-xs">
              <span className="font-semibold text-[#757684] block mb-1">Notas especiales:</span>
              <p className="text-[#191c1d]">{reservation.notes}</p>
            </div>
          )}

          {/* Change Status selector */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase text-[#454652] mb-1.5 tracking-wider">
              Cambiar estado de la reserva
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ReservationStatus)}
              className="w-full border border-[#e1e3e4] rounded-xl px-3.5 py-2.5 text-sm bg-white focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/15 outline-none font-medium cursor-pointer"
            >
              <option value="confirmada">Confirmada</option>
              <option value="en_curso">En curso</option>
              <option value="pendiente">Pendiente</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        {/* Footer Action Buttons with exact symmetric sizing */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 mt-5 border-t border-[#e1e3e4]">
          {/* Left: Delete permanent action */}
          <div>
            {onDeleteReservation && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="h-10 px-3.5 inline-flex items-center justify-center gap-1.5 text-xs text-[#757684] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-xl font-medium transition-colors cursor-pointer"
                title="Eliminar registro permanentemente"
              >
                <span className="material-symbols-outlined text-[17px]">delete</span>
                <span>Eliminar</span>
              </button>
            )}
          </div>

          {/* Right: Cancel Appointment and Save Actions - Exact proportional dimensions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {reservation.status !== 'cancelada' && (
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                className="h-10 px-4 inline-flex items-center justify-center gap-1.5 bg-[#ffdad6]/60 text-[#ba1a1a] hover:bg-[#ffdad6] border border-[#ffdad6] rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-[0.98] shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
                <span>Cancelar Cita</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleStatusSave}
              className="h-10 px-5 inline-flex items-center justify-center gap-1.5 bg-[#24389c] hover:bg-[#1d2d7c] text-white font-bold rounded-xl text-xs shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Guardar Estado</span>
            </button>
          </div>
        </div>

        {/* 1. CUSTOM DELETE CONFIRMATION POPUP */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs rounded-2xl flex items-center justify-center p-5 z-20 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-white rounded-2xl p-6 shadow-2xl border border-[#e1e3e4] max-w-sm w-full text-center">
              <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto mb-3.5">
                <span className="material-symbols-outlined text-[26px]">delete_forever</span>
              </div>
              <h4 className="text-base font-bold text-[#191c1d] mb-1.5">
                ¿Eliminar esta reserva?
              </h4>
              <p className="text-xs text-[#454652] leading-relaxed mb-5">
                Esta acción eliminará de forma permanente la cita de{' '}
                <strong className="text-[#191c1d]">{reservation.clientName}</strong> de la base de datos. No se podrá recuperar.
              </p>
              <div className="flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-10 px-4 border border-[#e1e3e4] hover:bg-[#f3f4f5] text-[#454652] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 h-10 px-4 bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>Sí, Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. CUSTOM CANCEL APPOINTMENT CONFIRMATION POPUP */}
        {showCancelConfirm && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs rounded-2xl flex items-center justify-center p-5 z-20 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-white rounded-2xl p-6 shadow-2xl border border-[#e1e3e4] max-w-sm w-full text-center">
              <div className="w-12 h-12 rounded-full bg-[#ffdcc6] text-[#6c3400] flex items-center justify-center mx-auto mb-3.5">
                <span className="material-symbols-outlined text-[26px]">event_busy</span>
              </div>
              <h4 className="text-base font-bold text-[#191c1d] mb-1.5">
                ¿Cancelar esta cita?
              </h4>
              <p className="text-xs text-[#454652] leading-relaxed mb-5">
                La cita de <strong className="text-[#191c1d]">{reservation.clientName}</strong> cambiará su estado a{' '}
                <span className="text-[#ba1a1a] font-semibold">Cancelada</span> y se liberará el horario del profesional.
              </p>
              <div className="flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 h-10 px-4 border border-[#e1e3e4] hover:bg-[#f3f4f5] text-[#454652] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="flex-1 h-10 px-4 bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Confirmar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
