import React, { useState } from 'react';
import { Reservation, ReservationStatus } from '../types';

interface ReservationDetailsModalProps {
  reservation: Reservation | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: ReservationStatus) => void;
  onCancelReservation: (reservation: Reservation) => void;
}

export const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({
  reservation,
  onClose,
  onUpdateStatus,
  onCancelReservation,
}) => {
  if (!reservation) return null;

  const [selectedStatus, setSelectedStatus] = useState<ReservationStatus>(reservation.status);

  const handleStatusSave = () => {
    onUpdateStatus(reservation.id, selectedStatus);
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
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in duration-150">
        <div className="flex justify-between items-start pb-3 border-b border-[#e1e3e4] mb-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#757684] font-semibold block">
              Detalles de la Cita
            </span>
            <h3 className="font-bold text-xl text-[#191c1d] mt-0.5">
              {reservation.clientName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#757684] hover:text-[#191c1d] rounded-lg"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between p-3 bg-[#f8f9fa] rounded-lg border border-[#e1e3e4]">
            <span className="text-xs text-[#757684] font-medium">Estado actual</span>
            {getStatusBadge(reservation.status)}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#f8f9fa] rounded-lg border border-[#e1e3e4]">
              <span className="text-[#757684] block">Fecha y Hora</span>
              <span className="font-bold text-[#191c1d] text-sm mt-0.5 block font-mono">
                {reservation.date} · {reservation.time}
              </span>
            </div>

            <div className="p-3 bg-[#f8f9fa] rounded-lg border border-[#e1e3e4]">
              <span className="text-[#757684] block">Duración & Tarifa</span>
              <span className="font-bold text-[#24389c] text-sm mt-0.5 block">
                {reservation.durationMinutes} min · ${reservation.price.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#f3f4f5]">
            <div className="flex justify-between text-xs">
              <span className="text-[#757684]">Servicio contratado:</span>
              <span className="font-semibold text-[#191c1d]">{reservation.serviceName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#757684]">Profesional asignado:</span>
              <span className="font-semibold text-[#191c1d]">{reservation.professionalName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#757684]">Contacto cliente:</span>
              <span className="font-mono text-[#191c1d]">
                {reservation.clientPhone || 'No registrado'}
              </span>
            </div>
          </div>

          {reservation.notes && (
            <div className="p-3 bg-[#f3f4f5] rounded-lg text-xs">
              <span className="font-semibold text-[#757684] block mb-1">Notas especiales:</span>
              <p className="text-[#191c1d]">{reservation.notes}</p>
            </div>
          )}

          {/* Change Status select */}
          <div className="pt-2">
            <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
              Cambiar estado de la reserva
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ReservationStatus)}
              className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm bg-white focus:border-[#24389c] outline-none"
            >
              <option value="confirmada">Confirmada</option>
              <option value="en_curso">En curso</option>
              <option value="pendiente">Pendiente</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-5 mt-4 border-t border-[#e1e3e4]">
          {reservation.status !== 'cancelada' ? (
            <button
              onClick={() => {
                onCancelReservation(reservation);
                onClose();
              }}
              className="text-xs text-[#ba1a1a] hover:underline font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
              Cancelar cita
            </button>
          ) : <div />}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-[#e1e3e4] rounded-lg text-xs text-[#454652] hover:bg-[#f3f4f5] font-medium"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleStatusSave}
              className="px-4 py-1.5 bg-[#24389c] hover:bg-[#1d2d7c] text-white font-semibold rounded-lg text-xs"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
