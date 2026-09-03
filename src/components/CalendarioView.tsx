import React, { useState, useMemo } from 'react';
import { Reservation, Professional, ServiceItem } from '../types';

interface CalendarioViewProps {
  reservations: Reservation[];
  professionals: Professional[];
  services: ServiceItem[];
  onSelectReservation: (reservation: Reservation) => void;
  onOpenNewBooking: (prefill?: Partial<Reservation>) => void;
}

export const CalendarioView: React.FC<CalendarioViewProps> = ({
  reservations,
  professionals,
  onSelectReservation,
  onOpenNewBooking,
}) => {
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [activeDate, setActiveDate] = useState<Date>(() => new Date());
  const [calendarMode, setCalendarMode] = useState<'mes' | 'semana' | 'dia'>('semana');

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dayNamesFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayNamesShort = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
  const monthShortNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  // Working Hours (08:00 to 20:00)
  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  // Filter reservations by selected professional
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      if (selectedProfessional !== 'all' && r.professionalId !== selectedProfessional) {
        return false;
      }
      return true;
    });
  }, [reservations, selectedProfessional]);

  // Navigate functions
  const handlePrev = () => {
    const next = new Date(activeDate);
    if (calendarMode === 'mes') {
      next.setMonth(next.getMonth() - 1);
    } else if (calendarMode === 'semana') {
      next.setDate(next.getDate() - 7);
    } else {
      next.setDate(next.getDate() - 1);
    }
    setActiveDate(next);
  };

  const handleNext = () => {
    const next = new Date(activeDate);
    if (calendarMode === 'mes') {
      next.setMonth(next.getMonth() + 1);
    } else if (calendarMode === 'semana') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + 1);
    }
    setActiveDate(next);
  };

  const handleToday = () => {
    setActiveDate(new Date());
  };

  // Week Days calculation (Monday to Sunday)
  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDay = activeDate.getDay(); // 0 is Sun, 1 is Mon...
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(
      activeDate.getFullYear(),
      activeDate.getMonth(),
      activeDate.getDate() + distanceToMonday
    );

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const isToday =
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      const fullDate = `${year}-${month}-${dateNum}`;

      days.push({
        name: dayNamesShort[i],
        dateNum: d.getDate(),
        month: d.getMonth(),
        monthShort: monthShortNames[d.getMonth()],
        year: d.getFullYear(),
        fullDate,
        isToday,
      });
    }
    return days;
  }, [activeDate]);

  // Month Grid Days (Full Month with padding days)
  const monthGridDays = useMemo(() => {
    const today = new Date();
    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    const firstDayJs = firstDay.getDay(); // 0 is Sun, 1 is Mon...
    const paddingLeft = firstDayJs === 0 ? 6 : firstDayJs - 1; // days before Monday

    // Total days in month
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Left padding from previous month
    for (let i = paddingLeft; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(d.getDate()).padStart(2, '0');
      days.push({
        dateNum: d.getDate(),
        fullDate: `${d.getFullYear()}-${mStr}-${dStr}`,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const d = new Date(year, month, i);
      const isToday =
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(i).padStart(2, '0');

      days.push({
        dateNum: i,
        fullDate: `${year}-${mStr}-${dStr}`,
        isCurrentMonth: true,
        isToday,
      });
    }

    // Right padding to complete 35 or 42 grid cells
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i);
        const mStr = String(d.getMonth() + 1).padStart(2, '0');
        const dStr = String(d.getDate()).padStart(2, '0');
        days.push({
          dateNum: d.getDate(),
          fullDate: `${d.getFullYear()}-${mStr}-${dStr}`,
          isCurrentMonth: false,
          isToday: false,
        });
      }
    }

    return days;
  }, [activeDate]);

  // Title formatted dynamically
  const headerTitle = useMemo(() => {
    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();

    if (calendarMode === 'mes') {
      return `${monthNames[month]} ${year}`;
    }

    if (calendarMode === 'dia') {
      const dayOfWeek = dayNamesFull[activeDate.getDay()];
      return `${dayOfWeek}, ${activeDate.getDate()} de ${monthNames[month]} de ${year}`;
    }

    // Week mode
    if (weekDays.length > 0) {
      const first = weekDays[0];
      const last = weekDays[6];
      if (first.month === last.month) {
        return `${first.dateNum} - ${last.dateNum} ${monthNames[first.month]}, ${first.year}`;
      }
      return `${first.dateNum} ${monthNames[first.month]} - ${last.dateNum} ${monthNames[last.month]}, ${first.year}`;
    }

    return `${monthNames[month]} ${year}`;
  }, [activeDate, calendarMode, weekDays]);

  // Helper to get events in a given date & hour slot
  const getEventsForSlot = (dateStr: string, hourStr: string) => {
    const slotHour = parseInt(hourStr.split(':')[0], 10);
    return filteredReservations.filter((r) => {
      if (r.date !== dateStr) return false;
      const resHour = parseInt(r.time.split(':')[0], 10);
      return resHour === slotHour;
    });
  };

  // Helper to get events for a single day
  const getEventsForDate = (dateStr: string) => {
    return filteredReservations.filter((r) => r.date === dateStr);
  };

  const getStatusBorderColor = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmada':
        return 'border-l-[#24389c] bg-[#dee0ff]/25 hover:bg-[#dee0ff]/40';
      case 'pendiente':
        return 'border-l-[#f97316] bg-[#ffdcc6]/30 hover:bg-[#ffdcc6]/50';
      case 'en_curso':
        return 'border-l-[#4c56af] bg-[#e0e0ff]/30 hover:bg-[#e0e0ff]/50';
      case 'completada':
        return 'border-l-[#10b981] bg-[#e1f5ec]/40 hover:bg-[#e1f5ec]/60';
      case 'cancelada':
        return 'border-l-[#ba1a1a] bg-[#ffdad6]/40 hover:bg-[#ffdad6]/60 text-[#ba1a1a]';
      default:
        return 'border-l-[#24389c] bg-white hover:bg-[#f8f9fa]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Top Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-[#e1e3e4] shadow-2xs">
        {/* Left: Navigation and Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-[#e1e3e4] rounded-xl overflow-hidden bg-white shadow-2xs">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-[#f3f4f5] text-[#454652] transition-colors cursor-pointer"
              title="Anterior"
            >
              <span className="material-symbols-outlined text-[20px] block">chevron_left</span>
            </button>
            <button
              onClick={handleToday}
              className="px-3.5 py-1.5 text-xs font-bold text-[#191c1d] hover:bg-[#f3f4f5] border-x border-[#e1e3e4] transition-colors cursor-pointer"
            >
              Hoy
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-[#f3f4f5] text-[#454652] transition-colors cursor-pointer"
              title="Siguiente"
            >
              <span className="material-symbols-outlined text-[20px] block">chevron_right</span>
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-[#191c1d] ml-1">{headerTitle}</h2>
        </div>

        {/* Right: Filters & View Switcher */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Professional Selector */}
          <select
            value={selectedProfessional}
            onChange={(e) => setSelectedProfessional(e.target.value)}
            className="border border-[#e1e3e4] rounded-xl px-3 py-1.5 text-xs text-[#191c1d] bg-white focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/15 outline-none font-semibold cursor-pointer"
          >
            <option value="all">Todos los profesionales</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Mode Switcher: Mes / Semana / Día */}
          <div className="flex bg-[#f3f4f5] p-1 rounded-xl border border-[#e1e3e4]">
            <button
              onClick={() => setCalendarMode('mes')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                calendarMode === 'mes'
                  ? 'bg-white text-[#24389c] shadow-2xs'
                  : 'text-[#757684] hover:text-[#191c1d]'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setCalendarMode('semana')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                calendarMode === 'semana'
                  ? 'bg-white text-[#24389c] shadow-2xs'
                  : 'text-[#757684] hover:text-[#191c1d]'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setCalendarMode('dia')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                calendarMode === 'dia'
                  ? 'bg-white text-[#24389c] shadow-2xs'
                  : 'text-[#757684] hover:text-[#191c1d]'
              }`}
            >
              Día
            </button>
          </div>
        </div>
      </div>

      {/* 1. MONTH VIEW (Full Month Grid) */}
      {calendarMode === 'mes' && (
        <div className="bg-white border border-[#e1e3e4] rounded-2xl overflow-hidden shadow-2xs">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 border-b border-[#e1e3e4] bg-[#f8f9fa]">
            {dayNamesShort.map((day) => (
              <div
                key={day}
                className="py-3 px-2 text-center text-xs font-bold text-[#757684] border-r border-[#e1e3e4] last:border-r-0 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month Cells Grid with Zebra Contrast */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[#e1e3e4]">
            {monthGridDays.map((day, idx) => {
              const dayEvents = getEventsForDate(day.fullDate);
              const isRowAlt = Math.floor(idx / 7) % 2 === 1;

              return (
                <div
                  key={day.fullDate + idx}
                  onClick={() =>
                    onOpenNewBooking({
                      date: day.fullDate,
                      time: '09:00',
                    })
                  }
                  className={`min-h-[110px] p-2 transition-colors cursor-pointer group flex flex-col justify-between ${
                    !day.isCurrentMonth
                      ? 'bg-[#fafafa] text-[#c5c5d4] opacity-50'
                      : isRowAlt
                      ? 'bg-[#edf0f4]/40 hover:bg-[#dee0ff]/20'
                      : 'bg-white hover:bg-[#dee0ff]/20'
                  } ${day.isToday ? 'ring-2 ring-inset ring-[#24389c]' : ''}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        day.isToday
                          ? 'bg-[#24389c] text-white shadow-2xs'
                          : day.isCurrentMonth
                          ? 'text-[#191c1d]'
                          : 'text-[#a0a1ab]'
                      }`}
                    >
                      {day.dateNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-[#24389c] bg-[#dee0ff] px-1.5 py-0.5 rounded-md">
                        {dayEvents.length} {dayEvents.length === 1 ? 'cita' : 'citas'}
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((evt) => (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReservation(evt);
                        }}
                        className={`px-1.5 py-1 rounded-lg text-[10px] font-semibold truncate border border-l-2 shadow-2xs hover:shadow-xs transition-all ${getStatusBorderColor(
                          evt.status
                        )}`}
                        title={`${evt.clientName} - ${evt.serviceName} (${evt.time})`}
                      >
                        <span className="font-bold mr-1">{evt.time}</span>
                        <span>{evt.clientName}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] font-bold text-[#757684] pl-1">
                        +{dayEvents.length - 2} más...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. WEEK VIEW (Weekly Hourly Matrix) */}
      {calendarMode === 'semana' && (
        <div className="bg-white border border-[#e1e3e4] rounded-2xl overflow-hidden shadow-2xs">
          {/* Calendar Column Headers (Days) */}
          <div className="grid grid-cols-8 border-b border-[#e1e3e4] bg-[#f8f9fa] sticky top-0 z-10">
            <div className="py-3 px-2 text-center text-xs font-bold text-[#757684] border-r border-[#e1e3e4] uppercase tracking-wider">
              Hora
            </div>
            {weekDays.map((d) => (
              <div
                key={d.name}
                className={`py-3 px-2 text-center border-r border-[#e1e3e4] last:border-r-0 ${
                  d.isToday ? 'bg-[#dee0ff]/40' : ''
                }`}
              >
                <div className="text-[11px] font-bold text-[#757684] uppercase tracking-wider flex items-center justify-center gap-1">
                  <span>{d.name}</span>
                  <span className="text-[10px] font-semibold lowercase text-[#9294a0]">({d.monthShort})</span>
                </div>
                <div
                  className={`text-sm font-black mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full ${
                    d.isToday ? 'bg-[#24389c] text-white shadow-2xs' : 'text-[#191c1d]'
                  }`}
                >
                  {d.dateNum}
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid Rows with Alternating Zebra Striping */}
          <div className="relative divide-y divide-[#e1e3e4]">
            {hours.map((hour, hourIdx) => {
              const isRowAlt = hourIdx % 2 === 1;

              return (
                <div
                  key={hour}
                  className={`grid grid-cols-8 min-h-[84px] transition-colors ${
                    isRowAlt ? 'bg-[#edf0f4]/50' : 'bg-white'
                  }`}
                >
                  {/* Hour Gutter */}
                  <div className="p-2 border-r border-[#e1e3e4] text-xs font-mono font-bold text-[#454652] flex items-start justify-center bg-[#f8f9fa]/80">
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
                        className={`border-r border-[#e1e3e4] last:border-r-0 p-1.5 relative transition-colors hover:bg-[#dee0ff]/20 cursor-pointer group flex flex-col gap-1.5 ${
                          day.isToday ? 'bg-[#dee0ff]/10' : ''
                        }`}
                      >
                        {/* Hover "+ Agendar" hint */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                          <span className="text-[10px] text-[#24389c] font-bold bg-white/95 px-2 py-1 rounded-lg shadow-2xs border border-[#bac3ff]">
                            + Agendar
                          </span>
                        </div>

                        {/* Structured Event Cards */}
                        {cellEvents.map((evt) => (
                          <div
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectReservation(evt);
                            }}
                            className={`p-2 rounded-xl text-xs transition-all relative z-10 border border-[#e1e3e4] border-l-4 shadow-2xs hover:shadow-sm cursor-pointer ${getStatusBorderColor(
                              evt.status
                            )}`}
                          >
                            <div className="font-bold text-[#191c1d] truncate leading-tight">
                              {evt.clientName}
                            </div>
                            <div className="text-[11px] text-[#454652] truncate mt-0.5 font-medium">
                              {evt.serviceName}
                            </div>
                            <div className="mt-1 text-[11px] font-mono text-[#24389c] font-bold tracking-tight">
                              {evt.time} - {evt.endTime || 'Fin'}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. DAY VIEW (Detailed Single Day View) */}
      {calendarMode === 'dia' && (
        <div className="bg-white border border-[#e1e3e4] rounded-2xl overflow-hidden shadow-2xs">
          <div className="py-3 px-4 bg-[#f8f9fa] border-b border-[#e1e3e4] font-bold text-sm text-[#191c1d]">
            Horario del Día: {activeDate.toLocaleDateString('es-CO', { dateStyle: 'full' })}
          </div>
          <div className="divide-y divide-[#e1e3e4]">
            {hours.map((hour, hourIdx) => {
              const activeDateStr = `${activeDate.getFullYear()}-${String(activeDate.getMonth() + 1).padStart(2, '0')}-${String(activeDate.getDate()).padStart(2, '0')}`;
              const slotEvents = getEventsForSlot(activeDateStr, hour);
              const isRowAlt = hourIdx % 2 === 1;

              return (
                <div
                  key={hour}
                  onClick={() =>
                    onOpenNewBooking({
                      date: activeDateStr,
                      time: hour,
                    })
                  }
                  className={`flex items-start min-h-[72px] p-3 transition-colors hover:bg-[#dee0ff]/20 cursor-pointer ${
                    isRowAlt ? 'bg-[#edf0f4]/40' : 'bg-white'
                  }`}
                >
                  <div className="w-20 font-mono font-bold text-xs text-[#454652] shrink-0">{hour}</div>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {slotEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReservation(evt);
                        }}
                        className={`p-2.5 rounded-xl border border-[#e1e3e4] border-l-4 shadow-2xs hover:shadow-sm cursor-pointer min-w-[240px] ${getStatusBorderColor(
                          evt.status
                        )}`}
                      >
                        <div className="font-bold text-[#191c1d]">{evt.clientName}</div>
                        <div className="text-xs text-[#454652]">{evt.serviceName} ({evt.professionalName})</div>
                        <div className="mt-1 font-mono text-xs font-bold text-[#24389c]">
                          {evt.time} - {evt.endTime || 'Fin'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
