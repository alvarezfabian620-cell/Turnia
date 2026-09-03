import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Reservation, Professional, ServiceItem, DaySchedule } from '../types';

interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => void;
  professionals: Professional[];
  services: ServiceItem[];
  schedules?: DaySchedule[];
  initialData?: Partial<Reservation>;
}

export const NewReservationModal: React.FC<NewReservationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  professionals,
  services,
  schedules = [],
  initialData,
}) => {
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const getCurrentTimeStr = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const getSuggestedTime = () => {
    const now = new Date();
    const currentMins = now.getMinutes();
    const roundedMins = currentMins < 30 ? 30 : 0;
    const roundedHour = currentMins < 30 ? now.getHours() : (now.getHours() + 1) % 24;
    return `${String(roundedHour).padStart(2, '0')}:${String(roundedMins).padStart(2, '0')}`;
  };

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [date, setDate] = useState(getTodayStr());
  const [time, setTime] = useState(getSuggestedTime());
  const [status, setStatus] = useState<Reservation['status']>('confirmada');
  const [notes, setNotes] = useState('');

  const todayStr = getTodayStr();
  const currentTimeStr = getCurrentTimeStr();

  const selectedService = services.find((s) => s.id === serviceId) || services[0];
  const selectedProfessional =
    professionals.find((p) => p.id === professionalId) || professionals[0];
  const duration = selectedService ? selectedService.durationMinutes : 45;

  // 1. Validate if date/time is in the past
  const isDateInPast = date < todayStr;
  const isTimeInPast = date === todayStr && time < currentTimeStr;
  const isPastInvalid = isDateInPast || isTimeInPast;

  // 2. Validate business opening schedule and breaks
  const validateBusinessSchedule = () => {
    if (!date || !schedules || schedules.length === 0) return { isValid: true };

    const [y, m, d] = date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const jsDay = dateObj.getDay(); // 0 is Sun, 1 is Mon...
    const dayCode = jsDay === 0 ? 7 : jsDay;

    const daySchedule = schedules.find((s) => s.dayCode === dayCode);
    if (!daySchedule || !daySchedule.active || !daySchedule.blocks || daySchedule.blocks.length === 0) {
      return {
        isValid: false,
        reason: `El negocio se encuentra cerrado los días ${daySchedule?.dayName || 'seleccionados'}. Por favor elige otro día.`
      };
    }

    if (!time) return { isValid: true };

    const [h, min] = time.split(':').map(Number);
    const startMins = h * 60 + min;
    const endMins = startMins + duration;

    const workingBlocks = daySchedule.blocks.filter((b) => !b.isBreak);
    const breakBlocks = daySchedule.blocks.filter((b) => b.isBreak);

    // Check if within working blocks
    let fallsInWorkingBlock = false;
    for (const block of workingBlocks) {
      const [bhStartH, bhStartM] = block.start.split(':').map(Number);
      const [bhEndH, bhEndM] = block.end.split(':').map(Number);
      const blockStartMins = bhStartH * 60 + bhStartM;
      const blockEndMins = bhEndH * 60 + bhEndM;

      if (startMins >= blockStartMins && endMins <= blockEndMins) {
        fallsInWorkingBlock = true;
        break;
      }
    }

    // Check if overlaps break blocks
    for (const brk of breakBlocks) {
      const [brkStartH, brkStartM] = brk.start.split(':').map(Number);
      const [brkEndH, brkEndM] = brk.end.split(':').map(Number);
      const brkStartMins = brkStartH * 60 + brkStartM;
      const brkEndMins = brkEndH * 60 + brkEndM;

      if (startMins < brkEndMins && endMins > brkStartMins) {
        return {
          isValid: false,
          reason: `El horario seleccionado coincide con un descanso (${brk.label || 'Almuerzo / Pausa'} de ${brk.start} a ${brk.end}). Por favor elige otra hora.`
        };
      }
    }

    if (!fallsInWorkingBlock) {
      const hoursDesc = workingBlocks.map((b) => `${b.start} a ${b.end}`).join(' y ');
      return {
        isValid: false,
        reason: `Fuera del horario de atención. El horario para ${daySchedule.dayName} es de ${hoursDesc || 'no disponible'}.`
      };
    }

    return { isValid: true };
  };

  const scheduleValidation = validateBusinessSchedule();
  const isFormInvalid = isPastInvalid || !scheduleValidation.isValid || !clientName.trim();

  useEffect(() => {
    if (initialData) {
      if (initialData.clientName) setClientName(initialData.clientName);
      if (initialData.clientPhone) setClientPhone(initialData.clientPhone);
      if (initialData.serviceId) setServiceId(initialData.serviceId);
      if (initialData.professionalId) setProfessionalId(initialData.professionalId);
      if (initialData.date) setDate(initialData.date);
      if (initialData.time) setTime(initialData.time);
      if (initialData.notes) setNotes(initialData.notes);
    } else {
      setDate(getTodayStr());
      setTime(getSuggestedTime());
      if (services.length > 0 && !serviceId) setServiceId(services[0].id);
      if (professionals.length > 0 && !professionalId) setProfessionalId(professionals[0].id);
    }
  }, [initialData, services, professionals]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormInvalid) return;

    // Calculate end time
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = (isNaN(hours) ? 9 : hours) * 60 + (isNaN(mins) ? 0 : mins) + duration;
    const endHour = String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0');
    const endMin = String(totalMinutes % 60).padStart(2, '0');
    const endTime = `${endHour}:${endMin}`;

    onSave({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || '+57 300 000 0000',
      serviceId: selectedService ? selectedService.id : 'serv-1',
      serviceName: selectedService ? selectedService.name : 'Servicio General',
      professionalId: selectedProfessional ? selectedProfessional.id : 'prof-1',
      professionalName: selectedProfessional ? selectedProfessional.name : 'Profesional',
      date,
      time,
      endTime,
      durationMinutes: duration,
      price: selectedService ? selectedService.price : 0,
      status,
      notes: notes.trim(),
    });

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#24389c', '#3f51b5', '#ffdcc6'],
      });
    } catch {
      // Ignore if confetti is unavailable
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e1e3e4] animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#e1e3e4] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#dee0ff] text-[#24389c] rounded-xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">calendar_add_on</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#191c1d] leading-snug">Nueva Reserva</h3>
              <p className="text-xs text-[#757684]">Ingresa los datos para agendar la cita</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#757684] hover:text-[#191c1d] hover:bg-[#f3f4f5] rounded-lg transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Client Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#454652] mb-1.5">
                Nombre del Cliente <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej. Valentina Morales"
                className="w-full border border-[#e1e3e4] rounded-xl px-3.5 py-2.5 text-sm text-[#191c1d] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/15 outline-none transition-all placeholder:text-[#a0a1ab]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#454652] mb-1.5">
                Teléfono / WhatsApp
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Ej. +57 300 123 4567"
                className="w-full border border-[#e1e3e4] rounded-xl px-3.5 py-2.5 text-sm text-[#191c1d] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/15 outline-none transition-all placeholder:text-[#a0a1ab]"
              />
            </div>
          </div>

          {/* Section 2: Service & Professional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#454652] mb-1.5">
                Servicio
              </label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full border border-[#e1e3e4] rounded-xl px-3.5 py-2.5 text-sm text-[#191c1d] bg-white focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/15 outline-none font-medium cursor-pointer transition-all"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (${Number(s.price || 0).toLocaleString('es-CO')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#454652] mb-1.5">
                Profesional
              </label>
              <select
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
                className="w-full border border-[#e1e3e4] rounded-xl px-3.5 py-2.5 text-sm text-[#191c1d] bg-white focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/15 outline-none font-medium cursor-pointer transition-all"
              >
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Date & Time in 2 balanced columns with validation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#454652] mb-1.5">
                Fecha de la cita
              </label>
              <input
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm text-[#191c1d] bg-white outline-none font-medium transition-all ${
                  isDateInPast || !scheduleValidation.isValid
                    ? 'border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                    : 'border-[#e1e3e4] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/15'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#454652] mb-1.5">
                Hora de inicio
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-mono text-[#191c1d] bg-white outline-none font-bold transition-all ${
                  isTimeInPast || !scheduleValidation.isValid
                    ? 'border-[#ba1a1a] text-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/20'
                    : 'border-[#e1e3e4] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/15'
                }`}
                required
              />
            </div>
          </div>

          {/* REAL-TIME ERROR ALERTS: PAST DATE OR CLOSED/UNAVAILABLE SCHEDULE */}
          {isPastInvalid && (
            <div className="p-3 bg-[#ffdad6]/60 border border-[#ffdad6] rounded-xl flex items-start gap-2 text-xs text-[#ba1a1a] font-semibold animate-in fade-in duration-150">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
              <span>
                {isDateInPast
                  ? 'No puedes seleccionar una fecha anterior a hoy.'
                  : `La hora seleccionada (${time}) ya ha pasado. La hora actual es ${currentTimeStr}. Por favor selecciona un horario posterior.`}
              </span>
            </div>
          )}

          {!isPastInvalid && !scheduleValidation.isValid && (
            <div className="p-3 bg-[#ffdcc6]/80 border border-[#ffdcc6] rounded-xl flex items-start gap-2 text-xs text-[#6c3400] font-semibold animate-in fade-in duration-150">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">event_busy</span>
              <span>{scheduleValidation.reason}</span>
            </div>
          )}

          {/* Section 4: Estado */}
          <div>
            <label className="block text-xs font-semibold text-[#454652] mb-1.5">
              Estado inicial de la reserva
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Reservation['status'])}
              className="w-full border border-[#e1e3e4] rounded-xl px-3.5 py-2.5 text-sm text-[#191c1d] bg-white focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/15 outline-none font-medium cursor-pointer transition-all"
            >
              <option value="confirmada">Confirmada</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_curso">En curso</option>
            </select>
          </div>

          {/* Section 5: Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#454652] mb-1.5">
              Notas adicionales <span className="text-[#757684] font-normal">(opcional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instrucciones especiales o preferencias del cliente..."
              className="w-full border border-[#e1e3e4] rounded-xl px-3.5 py-2.5 text-sm text-[#191c1d] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/15 outline-none transition-all placeholder:text-[#a0a1ab] resize-none"
            />
          </div>

          {/* Modern Summary Strip */}
          <div className="p-3.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[#454652]">
              <span className="material-symbols-outlined text-[16px] text-[#757684]">schedule</span>
              <span>Duración: <strong className="text-[#191c1d]">{duration} min</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#757684]">Precio:</span>
              <strong className="text-[#24389c] text-sm font-bold font-mono">
                ${Number(selectedService?.price || 0).toLocaleString('es-CO')}
              </strong>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#e1e3e4]">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 border border-[#e1e3e4] rounded-xl text-xs text-[#454652] hover:bg-[#f3f4f5] font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isFormInvalid}
              className={`h-10 px-5 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5 ${
                isFormInvalid
                  ? 'bg-[#c5c5d4] cursor-not-allowed opacity-60'
                  : 'bg-[#24389c] hover:bg-[#1d2d7c] cursor-pointer active:scale-[0.98]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Confirmar reserva</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
