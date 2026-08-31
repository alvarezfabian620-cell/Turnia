import React, { useState } from 'react';
import { Reservation, Professional } from '../types';

interface CalendarioViewProps {
  reservations: Reservation[];
  professionals: Professional[];
  onOpenNewBooking: (initialData?: Partial<Reservation>) => void;
  onSelectReservation: (reservation: Reservation) => void;
}

export const CalendarioView: React.FC<CalendarioViewProps> = ({
  reservations,
  professionals,
  onOpenNewBooking,
  onSelectReservation,
}) => {
  const [viewMode, setViewMode] = useState<'mes' | 'semana' | 'dia'>('semana');
  const [selectedProfId, setSelectedProfId] = useState<string>('all');
  const [weekOffset, setWeekOffset] = useState(0);

  // Reference week: 16 - 22 Octubre 2023
  const weekDays = [
    { name: 'LUN', dateNum: 16 + weekOffset * 7, fullDate: '2023-10-16', isToday: false },
    { name: 'MAR', dateNum: 17 + weekOffset * 7, fullDate: '2023-10-17', isToday: false },
    { name: 'MIÉ', dateNum: 18 + weekOffset * 7, fullDate: '2023-10-18', isToday: true },
    { name: 'JUE', dateNum: 19 + weekOffset * 7, fullDate: '2023-10-19', isToday: false },
    { name: 'VIE', dateNum: 20 + weekOffset * 7, fullDate: '2023-10-20', isToday: false },
    { name: 'SÁB', dateNum: 21 + weekOffset * 7, fullDate: '2023-10-21', isToday: false },
    { name: 'DOM', dateNum: 22 + weekOffset * 7, fullDate: '2023-10-22', isToday: false },
  ];

  const hours = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
  ];

  // Filter reservations based on professional and view
  const filteredEvents = reservations.filter((r) => {
    if (selectedProfId !== 'all' && r.professionalId !== selectedProfId) return false;
    return true;
  });

  const getEventsForSlot = (dateStr: string, hourStr: string) => {
    const hourPrefix = hourStr.split(':')[0];
    return filteredEvents.filter((r) => {
      if (r.date !== dateStr) return false;
      const resHour = r.time.split(':')[0];
      return resHour === hourPrefix;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-[28px] font-bold text-[#191c1d] tracking-tight">
            Calendario
          </h2>
          <p className="text-[#454652] text-sm md:text-base mt-1">
            Visualiza y organiza tus reservas por profesional y horario.
          </p>
        </div>

        <button
          onClick={() => onOpenNewBooking()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Agendar cita</span>
        </button>
      </div>

      {/* Control Bar Card */}
      <div className="bg-white border border-[#e1e3e4] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        {/* Navigation buttons + Date Label */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="inline-flex items-center border border-[#e1e3e4] rounded-lg overflow-hidden bg-[#f8f9fa]">
            <button
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-2 hover:bg-white text-[#454652] transition-colors border-r border-[#e1e3e4]"
              title="Semana anterior"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1.5 text-xs font-semibold text-[#191c1d] hover:bg-white transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="p-2 hover:bg-white text-[#454652] transition-colors border-l border-[#e1e3e4]"
              title="Semana siguiente"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          <h3 className="text-base font-bold text-[#191c1d] tracking-tight">
            16 - 22 Octubre, 2023
          </h3>
        </div>

        {/* View switcher & Professional filter */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Professional Selector */}
          <div className="relative">
            <select
              value={selectedProfId}
              onChange={(e) => setSelectedProfId(e.target.value)}
              className="pl-3 pr-8 py-1.5 border border-[#e1e3e4] rounded-lg text-xs font-medium text-[#191c1d] bg-white hover:border-[#24389c] focus:outline-none focus:ring-2 focus:ring-[#24389c]/20 transition-all cursor-pointer"
            >
              <option value="all">Todos los profesionales</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
          </div>

          {/* Mes / Semana / Día buttons */}
          <div className="inline-flex rounded-lg border border-[#e1e3e4] p-0.5 bg-[#f3f4f5]">
            <button
              onClick={() => setViewMode('mes')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'mes'
                  ? 'bg-white text-[#24389c] font-semibold shadow-xs'
                  : 'text-[#454652] hover:text-[#191c1d]'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('semana')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'semana'
                  ? 'bg-white text-[#24389c] font-semibold shadow-xs'
                  : 'text-[#454652] hover:text-[#191c1d]'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('dia')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'dia'
                  ? 'bg-white text-[#24389c] font-semibold shadow-xs'
                  : 'text-[#454652] hover:text-[#191c1d]'
              }`}
            >
              Día
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar Grid Matrix */}
      <div className="bg-white border border-[#e1e3e4] rounded-xl overflow-hidden shadow-2xs">
        {/* Calendar Column Headers (Days) */}
        <div className="grid grid-cols-8 border-b border-[#e1e3e4] bg-[#f8f9fa] sticky top-0 z-10">
          <div className="py-3 px-2 text-center text-xs font-semibold text-[#757684] border-r border-[#e1e3e4]">
            Hora
          </div>
          {weekDays.map((d) => (
            <div
              key={d.name}
              className={`py-3 px-2 text-center border-r border-[#e1e3e4] last:border-r-0 ${
                d.isToday ? 'bg-[#dee0ff]/30' : ''
              }`}
            >
              <div className="text-[11px] font-semibold text-[#757684] uppercase">{d.name}</div>
              <div
                className={`text-sm font-bold mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full ${
                  d.isToday ? 'bg-[#24389c] text-white' : 'text-[#191c1d]'
                }`}
              >
                {d.dateNum}
              </div>
            </div>
          ))}
        </div>

        {/* Time Grid Rows */}
        <div className="relative divide-y divide-[#f3f4f5]">
          {/* Current Time Bar indicator (e.g. at 14:30 on Wednesday) */}
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
            style={{ top: '65%' }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] ring-2 ring-white shadow-xs -ml-1"></div>
            <div className="h-[2px] bg-[#ba1a1a] w-full shadow-xs"></div>
          </div>

          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 min-h-[72px]">
              {/* Hour Gutter */}
              <div className="p-2 border-r border-[#e1e3e4] text-xs font-mono text-[#757684] flex items-start justify-center bg-[#f8f9fa]/50">
                {hour}
              </div>

              {/* Day Cells */}
              {weekDays.map((day) => {
                const cellEvents = getEventsForSlot(day.fullDate, hour);

                return (
                  <div
                    key={`${day.fullDate}-${hour}`}
                    onClick={() =>
                      onOpenNewBooking({
                        date: day.fullDate,
                        time: hour,
                      })
                    }
                    className={`border-r border-[#e1e3e4] last:border-r-0 p-1 relative transition-colors hover:bg-[#f3f4f5]/60 cursor-pointer group ${
                      day.isToday ? 'bg-[#dee0ff]/10' : ''
                    }`}
                  >
                    {/* Hover "+ Agendar" hint */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-[#24389c] font-semibold bg-white/90 px-1.5 py-0.5 rounded shadow-2xs border border-[#bac3ff]">
                        + Agendar
                      </span>
                    </div>

                    {/* Booked Events in this slot */}
                    {cellEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReservation(evt);
                        }}
                        className={`p-2 rounded-lg text-xs transition-all relative z-10 border shadow-2xs hover:shadow-md cursor-pointer ${
                          evt.id === 'res-12'
                            ? 'bg-[#24389c] text-white border-[#24389c]'
                            : evt.id === 'res-11'
                            ? 'bg-[#e0e0ff] text-[#24389c] border-[#bdc2ff]'
                            : evt.id === 'res-10'
                            ? 'bg-[#ffdcc6] text-[#6c3400] border-[#ffb784]'
                            : 'bg-[#bac3ff]/40 text-[#24389c] border-[#bac3ff]'
                        }`}
                      >
                        <div className="font-semibold truncate">{evt.clientName}</div>
                        <div
                          className={`text-[11px] truncate mt-0.5 ${
                            evt.id === 'res-12' ? 'text-white/80' : 'text-[#454652]'
                          }`}
                        >
                          {evt.serviceName}
                        </div>
                        <div
                          className={`text-[10px] font-medium mt-1 truncate ${
                            evt.id === 'res-12' ? 'text-white/90' : 'text-[#24389c]'
                          }`}
                        >
                          {evt.time} - {evt.endTime || 'Fin'}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
