import React, { useState, useMemo } from 'react';
import { Reservation, Professional, ServiceItem, AuthUser, ReservationStatus } from '../types';

interface EmpleadoAgendaViewProps {
  currentUser: AuthUser;
  professional?: Professional;
  reservations: Reservation[];
  services: ServiceItem[];
  onSelectReservation: (res: Reservation) => void;
  onOpenNewBooking: (prefill?: Partial<Reservation>) => void;
  onUpdateReservationStatus: (id: string, newStatus: ReservationStatus) => void;
}

export const EmpleadoAgendaView: React.FC<EmpleadoAgendaViewProps> = ({
  currentUser,
  professional,
  reservations,
  onSelectReservation,
  onOpenNewBooking,
  onUpdateReservationStatus,
}) => {
  const [activeDate, setActiveDate] = useState<Date>(() => new Date());
  const [calendarMode, setCalendarMode] = useState<'mes' | 'semana' | 'dia'>('semana');

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dayNamesShort = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
  const monthShortNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  // Filter only employee's reservations
  const myReservations = useMemo(() => {
    return reservations.filter((r) => {
      if (professional?.id && r.professionalId === professional.id) return true;
      if (r.professionalName.toLowerCase() === currentUser.name.toLowerCase()) return true;
      return false;
    });
  }, [reservations, professional, currentUser]);

  // Navigate functions
  const handlePrev = () => {
    const next = new Date(activeDate);
    if (calendarMode === 'mes') next.setMonth(next.getMonth() - 1);
    else if (calendarMode === 'semana') next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setActiveDate(next);
  };

  const handleNext = () => {
    const next = new Date(activeDate);
    if (calendarMode === 'mes') next.setMonth(next.getMonth() + 1);
    else if (calendarMode === 'semana') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setActiveDate(next);
  };

  const handleToday = () => setActiveDate(new Date());

  const formatLocalDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Week days calculation
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(activeDate);
    const dayOfWeek = startOfWeek.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(startOfWeek.getDate() + diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        dateStr: formatLocalDate(d),
        dayNum: d.getDate(),
        monthShort: monthShortNames[d.getMonth()],
        dayLabel: dayNamesShort[i],
        isToday: formatLocalDate(d) === formatLocalDate(new Date()),
      });
    }
    return days;
  }, [activeDate]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-[28px] font-bold text-[#191c1d] tracking-tight">
            Mi Agenda de Citas
          </h2>
          <p className="text-[#454652] text-sm mt-1">
            Visualiza y administra tus turnos y horarios asignados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex bg-[#f3f4f5] p-1 rounded-xl border border-[#e1e3e4]">
            {(['mes', 'semana', 'dia'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setCalendarMode(mode)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  calendarMode === mode
                    ? 'bg-white text-[#24389c] shadow-2xs'
                    : 'text-[#757684] hover:text-[#191c1d]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              onOpenNewBooking({
                professionalId: professional?.id || '',
                professionalName: currentUser.name,
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">add</span>
            <span>Agendar Cita</span>
          </button>
        </div>
      </div>

      {/* Calendar Controls & Title */}
      <div className="bg-white border border-[#e1e3e4] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 bg-[#f8f9fa] hover:bg-[#edeeef] text-[#191c1d] border border-[#e1e3e4] rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Hoy
          </button>
          <div className="flex items-center">
            <button
              onClick={handlePrev}
              className="p-1.5 text-[#757684] hover:text-[#191c1d] hover:bg-[#f3f4f5] rounded-lg transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] block">chevron_left</span>
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 text-[#757684] hover:text-[#191c1d] hover:bg-[#f3f4f5] rounded-lg transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] block">chevron_right</span>
            </button>
          </div>
          <span className="font-bold text-base text-[#191c1d] ml-2">
            {monthNames[activeDate.getMonth()]} {activeDate.getFullYear()}
          </span>
        </div>

        <div className="text-xs text-[#757684]">
          Citas asignadas en periodo:{' '}
          <strong className="text-[#24389c] text-sm">{myReservations.length}</strong>
        </div>
      </div>

      {/* Week Matrix View */}
      {calendarMode === 'semana' && (
        <div className="bg-white border border-[#e1e3e4] rounded-2xl overflow-hidden shadow-2xs">
          <div className="grid grid-cols-8 border-b border-[#e1e3e4] bg-[#f8f9fa] text-center text-xs font-bold text-[#757684]">
            <div className="p-3 border-r border-[#e1e3e4]">Hora</div>
            {weekDays.map((d) => (
              <div
                key={d.dateStr}
                className={`p-2.5 border-r border-[#e1e3e4] last:border-r-0 ${
                  d.isToday ? 'bg-[#dee0ff]/40 text-[#24389c]' : ''
                }`}
              >
                <div className="uppercase text-[11px] font-bold">
                  {d.dayLabel} <span className="text-[10px] font-normal lowercase">({d.monthShort})</span>
                </div>
                <div className={`text-base font-bold mt-0.5 ${d.isToday ? 'text-[#24389c]' : 'text-[#191c1d]'}`}>
                  {d.dayNum}
                </div>
              </div>
            ))}
          </div>

          <div className="divide-y divide-[#e1e3e4] max-h-[600px] overflow-y-auto">
            {hours.map((hour, hIndex) => (
              <div
                key={hour}
                className={`grid grid-cols-8 min-h-[64px] ${hIndex % 2 === 1 ? 'bg-[#eff1f4]/40' : 'bg-white'}`}
              >
                <div className="p-2 border-r border-[#e1e3e4] text-xs font-mono font-semibold text-[#757684] text-center flex items-center justify-center">
                  {hour}
                </div>

                {weekDays.map((d) => {
                  const cellReservations = myReservations.filter(
                    (r) => r.date === d.dateStr && r.time.startsWith(hour.slice(0, 2))
                  );

                  return (
                    <div
                      key={`${d.dateStr}-${hour}`}
                      className="p-1 border-r border-[#e1e3e4] last:border-r-0 flex flex-col gap-1 overflow-hidden"
                    >
                      {cellReservations.map((res) => (
                        <div
                          key={res.id}
                          onClick={() => onSelectReservation(res)}
                          className={`p-1.5 rounded-lg text-left text-xs cursor-pointer border transition-all hover:scale-[1.02] shadow-2xs ${
                            res.status === 'completada'
                              ? 'bg-[#dee0ff] border-[#bac3ff] text-[#24389c]'
                              : res.status === 'en_curso'
                              ? 'bg-[#e0e7ff] border-[#818cf8] text-[#3730a3]'
                              : res.status === 'cancelada'
                              ? 'bg-[#ffdad6] border-[#ffb4ab] text-[#ba1a1a]'
                              : 'bg-white border-[#24389c]/40 text-[#191c1d]'
                          }`}
                        >
                          <div className="font-bold truncate text-[11px]">{res.clientName}</div>
                          <div className="truncate text-[10px] text-[#454652]">{res.serviceName}</div>
                          <div className="text-[10px] font-mono font-bold mt-0.5">{res.time}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day View */}
      {calendarMode === 'dia' && (
        <div className="bg-white border border-[#e1e3e4] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#e1e3e4] pb-4">
            <h3 className="font-bold text-lg text-[#191c1d]">
              Agenda para {formatLocalDate(activeDate)}
            </h3>
            <span className="text-xs font-bold text-[#24389c] bg-[#dee0ff]/60 px-3 py-1 rounded-full">
              {myReservations.filter((r) => r.date === formatLocalDate(activeDate)).length} Citas
            </span>
          </div>

          <div className="space-y-3">
            {myReservations.filter((r) => r.date === formatLocalDate(activeDate)).length === 0 ? (
              <div className="py-12 text-center text-[#757684]">
                <span className="material-symbols-outlined text-[40px] text-[#bac3ff] block mb-2">
                  event_available
                </span>
                <p className="font-bold text-sm text-[#191c1d]">Sin citas programadas para este día</p>
              </div>
            ) : (
              myReservations
                .filter((r) => r.date === formatLocalDate(activeDate))
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((res) => (
                  <div
                    key={res.id}
                    className="p-4 border border-[#e1e3e4] rounded-xl flex items-center justify-between hover:bg-[#f8f9fa] transition-colors"
                  >
                    <div>
                      <div className="font-bold text-sm text-[#191c1d]">{res.clientName}</div>
                      <div className="text-xs text-[#454652]">
                        {res.serviceName} • ${Number(res.price || 0).toLocaleString('es-CO')}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-[#24389c]">{res.time}</span>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                          res.status === 'confirmada'
                            ? 'bg-[#e1f5ec] text-[#047857]'
                            : res.status === 'completada'
                            ? 'bg-[#dee0ff] text-[#24389c]'
                            : 'bg-[#ffdcc6] text-[#8f4700]'
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Month View Simple Matrix */}
      {calendarMode === 'mes' && (
        <div className="bg-white border border-[#e1e3e4] rounded-2xl p-6 shadow-2xs">
          <div className="text-center py-6 text-sm text-[#454652]">
            Total de citas en {monthNames[activeDate.getMonth()]}:{' '}
            <strong className="text-[#24389c] text-lg font-bold">
              {
                myReservations.filter((r) => {
                  const m = String(activeDate.getMonth() + 1).padStart(2, '0');
                  return r.date.startsWith(`${activeDate.getFullYear()}-${m}`);
                }).length
              }
            </strong>{' '}
            citas asignadas.
          </div>
        </div>
      )}
    </div>
  );
};
