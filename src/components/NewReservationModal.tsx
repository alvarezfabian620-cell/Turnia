import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Reservation, Professional, ServiceItem } from '../types';

interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => void;
  professionals: Professional[];
  services: ServiceItem[];
  initialData?: Partial<Reservation>;
}

export const NewReservationModal: React.FC<NewReservationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  professionals,
  services,
  initialData,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [date, setDate] = useState('2023-10-24');
  const [time, setTime] = useState('09:00');
  const [status, setStatus] = useState<Reservation['status']>('confirmada');
  const [notes, setNotes] = useState('');

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
      if (services.length > 0 && !serviceId) setServiceId(services[0].id);
      if (professionals.length > 0 && !professionalId) setProfessionalId(professionals[0].id);
    }
  }, [initialData, services, professionals]);

  if (!isOpen) return null;

  const selectedService = services.find((s) => s.id === serviceId) || services[0];
  const selectedProfessional =
    professionals.find((p) => p.id === professionalId) || professionals[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    // Calculate end time
    const duration = selectedService ? selectedService.durationMinutes : 45;
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + duration;
    const endHour = String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0');
    const endMin = String(totalMinutes % 60).padStart(2, '0');
    const endTime = `${endHour}:${endMin}`;

    onSave({
      clientName,
      clientPhone: clientPhone || '+34 600 000 000',
      serviceId: selectedService ? selectedService.id : 'serv-1',
      serviceName: selectedService ? selectedService.name : 'Servicio General',
      professionalId: selectedProfessional ? selectedProfessional.id : 'prof-1',
      professionalName: selectedProfessional ? selectedProfessional.name : 'Profesional',
      date,
      time,
      endTime,
      durationMinutes: duration,
      price: selectedService ? selectedService.price : 25,
      status,
      notes,
    });

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#24389c', '#3f51b5', '#ffdcc6'],
      });
    } catch {
      // Ignore if confetti fails
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-[#e1e3e4] mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#dee0ff] text-[#24389c] rounded-lg">
              <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#191c1d]">Nueva Reserva</h3>
              <p className="text-xs text-[#757684]">
                Ingresa los datos para registrar la cita
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#757684] hover:text-[#191c1d] hover:bg-[#f3f4f5] rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#757684] mb-1 tracking-wider">
                Nombre del Cliente *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej. Valentina Morales"
                className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm text-[#191c1d] focus:border-[#24389c] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#757684] mb-1 tracking-wider">
                Teléfono / WhatsApp
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+34 600 123 456"
                className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm text-[#191c1d] focus:border-[#24389c] outline-none"
              />
            </div>
          </div>

          {/* Service & Professional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#757684] mb-1 tracking-wider">
                Servicio
              </label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm text-[#191c1d] bg-white focus:border-[#24389c] outline-none"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (${Number(s.price || 0).toLocaleString('es-CO')} - {s.durationMinutes}m)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#757684] mb-1 tracking-wider">
                Profesional
              </label>
              <select
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
                className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm text-[#191c1d] bg-white focus:border-[#24389c] outline-none"
              >
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Time & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#757684] mb-1 tracking-wider">
                Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm text-[#191c1d] bg-white focus:border-[#24389c] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#757684] mb-1 tracking-wider">
                Hora Inicio
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm font-mono text-[#191c1d] bg-white focus:border-[#24389c] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#757684] mb-1 tracking-wider">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Reservation['status'])}
                className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm text-[#191c1d] bg-white focus:border-[#24389c] outline-none"
              >
                <option value="confirmada">Confirmada</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_curso">En curso</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase text-[#757684] mb-1 tracking-wider">
              Notas adicionales (opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instrucciones especiales, preferencias del cliente..."
              className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm text-[#191c1d] focus:border-[#24389c] outline-none"
            />
          </div>

          {/* Summary Box */}
          <div className="p-3 bg-[#f8f9fa] border border-[#e1e3e4] rounded-lg flex items-center justify-between text-xs">
            <span className="text-[#454652]">
              Duración: <strong className="text-[#191c1d]">{selectedService?.durationMinutes || 45} min</strong>
            </span>
            <span className="text-[#454652]">
              Precio estimado:{' '}
              <strong className="text-[#24389c] text-sm">
                ${Number(selectedService?.price || 0).toLocaleString('es-CO')}
              </strong>
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#e1e3e4]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#e1e3e4] rounded-lg text-sm text-[#454652] hover:bg-[#f3f4f5] font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#24389c] hover:bg-[#1d2d7c] text-white font-semibold rounded-lg text-sm shadow-xs transition-colors"
            >
              Confirmar reserva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
