import React, { useState } from 'react';
import { DaySchedule, TimeBlock } from '../types';

interface HorariosViewProps {
  schedule: DaySchedule[];
  onSaveSchedule: (updated: DaySchedule[]) => void;
  timeZone: string;
  onChangeTimeZone: (tz: string) => void;
}

export const HorariosView: React.FC<HorariosViewProps> = ({
  schedule: initialSchedule,
  onSaveSchedule,
  timeZone,
  onChangeTimeZone,
}) => {
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);
  const [isSaved, setIsSaved] = useState(false);
  const [bufferTime, setBufferTime] = useState('15 min');
  const [advanceDays, setAdvanceDays] = useState('30 días');

  React.useEffect(() => {
    if (initialSchedule && initialSchedule.length > 0) {
      setSchedule(initialSchedule);
    }
  }, [initialSchedule]);

  const handleToggleDay = (dayIndex: number) => {
    setSchedule((prev) => {
      const next = [...prev];
      next[dayIndex] = {
        ...next[dayIndex],
        active: !next[dayIndex].active,
      };
      return next;
    });
  };

  const handleTimeChange = (
    dayIndex: number,
    blockId: string,
    field: 'start' | 'end',
    val: string
  ) => {
    setSchedule((prev) => {
      const next = [...prev];
      const blocks = next[dayIndex].blocks.map((b) =>
        b.id === blockId ? { ...b, [field]: val } : b
      );
      next[dayIndex] = { ...next[dayIndex], blocks };
      return next;
    });
  };

  const handleAddBreak = (dayIndex: number) => {
    setSchedule((prev) => {
      const next = [...prev];
      const newBlock: TimeBlock = {
        id: `break-${Date.now()}`,
        start: '13:00',
        end: '14:00',
        isBreak: true,
        label: 'Almuerzo',
      };
      next[dayIndex] = {
        ...next[dayIndex],
        blocks: [...next[dayIndex].blocks, newBlock],
      };
      return next;
    });
  };

  const handleRemoveBlock = (dayIndex: number, blockId: string) => {
    setSchedule((prev) => {
      const next = [...prev];
      next[dayIndex] = {
        ...next[dayIndex],
        blocks: next[dayIndex].blocks.filter((b) => b.id !== blockId),
      };
      return next;
    });
  };

  const handleCopyMondayToAll = () => {
    const monday = schedule[0];
    if (!monday) return;
    setSchedule((prev) =>
      prev.map((d, i) => {
        if (i === 0) return d;
        // Don't overwrite Sunday if it's inactive unless desired
        return {
          ...d,
          active: i < 6 ? monday.active : d.active,
          blocks: JSON.parse(JSON.stringify(monday.blocks)),
        };
      })
    );
  };

  const handleSave = () => {
    onSaveSchedule(schedule);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    setSchedule(initialSchedule);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-[28px] font-bold text-[#191c1d] tracking-tight">
            Horarios y Disponibilidad
          </h2>
          <p className="text-[#454652] text-sm md:text-base mt-1">
            Configura tus días laborables, horario de atención y pausas de descanso.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="h-10 px-4 bg-white hover:bg-[#f3f4f5] text-[#454652] border border-[#e1e3e4] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            Descartar
          </button>
          <button
            onClick={handleSave}
            className="h-10 px-5 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[17px]">
              {isSaved ? 'check' : 'save'}
            </span>
            <span>{isSaved ? '¡Guardado!' : 'Guardar cambios'}</span>
          </button>
        </div>
      </div>

      {/* Days Schedule Card */}
      <div className="bg-white border border-[#e1e3e4] rounded-2xl overflow-hidden shadow-2xs">
        {/* Quick action bar */}
        <div className="px-5 py-3 bg-[#f8f9fa] border-b border-[#e1e3e4] flex justify-between items-center text-xs">
          <span className="font-bold text-[#454652] uppercase tracking-wider text-[11px]">
            Jornada semanal
          </span>
          <button
            onClick={handleCopyMondayToAll}
            className="text-[#24389c] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            title="Copiar horario del lunes a los demás días"
          >
            <span className="material-symbols-outlined text-[15px]">content_copy</span>
            <span>Aplicar horario del Lunes a todos los días</span>
          </button>
        </div>

        {/* Days List */}
        <div className="divide-y divide-[#e1e3e4]">
          {schedule.map((day, idx) => {
            const workingBlocks = day.blocks.filter((b) => !b.isBreak);
            const breakBlocks = day.blocks.filter((b) => b.isBreak);

            return (
              <div
                key={day.dayName}
                className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                  !day.active ? 'bg-[#fafafa]' : idx % 2 === 1 ? 'bg-[#fcfdfe]' : 'bg-white'
                }`}
              >
                {/* Left: Toggle + Day Name */}
                <div className="flex items-center gap-3.5 min-w-[150px] shrink-0">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={day.active}
                      onChange={() => handleToggleDay(idx)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-[#c5c5d4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c5c5d4] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#24389c]"></div>
                  </label>

                  <div>
                    <span
                      className={`font-bold text-sm uppercase tracking-wide block ${
                        day.active ? 'text-[#191c1d]' : 'text-[#a0a1ab]'
                      }`}
                    >
                      {day.dayName}
                    </span>
                    {!day.active && (
                      <span className="inline-block text-[10px] font-bold text-[#ba1a1a] bg-[#ffdad6]/60 px-2 py-0.5 rounded-full mt-0.5">
                        Cerrado
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Working Hours & Breaks in a clean, unified row */}
                {day.active ? (
                  <div className="flex-1 flex flex-wrap items-center gap-3">
                    {/* Main Working Hours Block */}
                    {workingBlocks.map((block) => (
                      <div
                        key={block.id}
                        className="inline-flex items-center gap-2 p-1.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-xs shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[15px] text-[#757684] ml-1">
                          schedule
                        </span>
                        <input
                          type="time"
                          value={block.start}
                          onChange={(e) =>
                            handleTimeChange(idx, block.id, 'start', e.target.value)
                          }
                          className="w-20 px-2 py-1 bg-white border border-[#e1e3e4] rounded-lg font-mono font-bold text-[#191c1d] text-xs outline-none text-center focus:border-[#24389c]"
                        />
                        <span className="text-[#757684] font-medium text-xs">a</span>
                        <input
                          type="time"
                          value={block.end}
                          onChange={(e) =>
                            handleTimeChange(idx, block.id, 'end', e.target.value)
                          }
                          className="w-20 px-2 py-1 bg-white border border-[#e1e3e4] rounded-lg font-mono font-bold text-[#191c1d] text-xs outline-none text-center focus:border-[#24389c]"
                        />
                      </div>
                    ))}

                    {/* Break Blocks */}
                    {breakBlocks.map((block) => (
                      <div
                        key={block.id}
                        className="inline-flex items-center gap-2 p-1.5 bg-[#ffdcc6]/40 border border-[#ffb784] rounded-xl text-xs shadow-2xs animate-in fade-in duration-150"
                      >
                        <span className="material-symbols-outlined text-[15px] text-[#8f4700] ml-1">
                          coffee
                        </span>
                        <span className="font-bold text-[#8f4700] text-[11px]">Descanso:</span>
                        <input
                          type="time"
                          value={block.start}
                          onChange={(e) =>
                            handleTimeChange(idx, block.id, 'start', e.target.value)
                          }
                          className="w-20 px-2 py-1 bg-white border border-[#ffb784] rounded-lg font-mono font-bold text-[#8f4700] text-xs outline-none text-center"
                        />
                        <span className="text-[#8f4700]">-</span>
                        <input
                          type="time"
                          value={block.end}
                          onChange={(e) =>
                            handleTimeChange(idx, block.id, 'end', e.target.value)
                          }
                          className="w-20 px-2 py-1 bg-white border border-[#ffb784] rounded-lg font-mono font-bold text-[#8f4700] text-xs outline-none text-center"
                        />
                        <button
                          onClick={() => handleRemoveBlock(idx, block.id)}
                          className="p-1 text-[#8f4700] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/60 rounded-lg transition-colors cursor-pointer mr-0.5"
                          title="Eliminar descanso"
                        >
                          <span className="material-symbols-outlined text-[15px] block">close</span>
                        </button>
                      </div>
                    ))}

                    {/* Add Break Button if none exists */}
                    {breakBlocks.length === 0 && (
                      <button
                        onClick={() => handleAddBreak(idx)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#24389c] hover:bg-[#dee0ff]/40 rounded-xl font-bold transition-all border border-dashed border-[#bac3ff] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">coffee</span>
                        <span>+ Añadir descanso</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-[#757684] italic py-1.5">
                    Este día no se reciben reservas.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Configuration Card */}
      <div className="bg-white border border-[#e1e3e4] rounded-2xl p-6 shadow-2xs">
        <h3 className="font-bold text-base text-[#191c1d] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#24389c]">tune</span>
          <span>Parámetros generales de agendamiento</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-[#454652] mb-1.5">
              Zona Horaria
            </label>
            <select
              value={timeZone}
              onChange={(e) => onChangeTimeZone(e.target.value)}
              className="w-full border border-[#e1e3e4] rounded-xl px-3 py-2 text-xs font-medium text-[#191c1d] bg-white focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/15 outline-none cursor-pointer"
            >
              <option value="UTC-5 (Bogotá, Lima, Quito)">UTC-5 (Bogotá, Lima, Quito)</option>
              <option value="UTC-3 (Buenos Aires, Santiago)">UTC-3 (Buenos Aires, Santiago)</option>
              <option value="UTC-6 (Ciudad de México)">UTC-6 (Ciudad de México)</option>
              <option value="UTC+1 (Madrid, Barcelona)">UTC+1 (Madrid, Barcelona)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#454652] mb-1.5">
              Margen entre citas
            </label>
            <select
              value={bufferTime}
              onChange={(e) => setBufferTime(e.target.value)}
              className="w-full border border-[#e1e3e4] rounded-xl px-3 py-2 text-xs font-medium text-[#191c1d] bg-white focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/15 outline-none cursor-pointer"
            >
              <option value="0 min">Sin margen (0 min)</option>
              <option value="10 min">10 minutos</option>
              <option value="15 min">15 minutos (Recomendado)</option>
              <option value="30 min">30 minutos</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#454652] mb-1.5">
              Antelación máxima
            </label>
            <select
              value={advanceDays}
              onChange={(e) => setAdvanceDays(e.target.value)}
              className="w-full border border-[#e1e3e4] rounded-xl px-3 py-2 text-xs font-medium text-[#191c1d] bg-white focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/15 outline-none cursor-pointer"
            >
              <option value="15 días">15 días de anticipación</option>
              <option value="30 días">30 días (1 mes)</option>
              <option value="60 días">60 días (2 meses)</option>
              <option value="90 días">90 días (3 meses)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
