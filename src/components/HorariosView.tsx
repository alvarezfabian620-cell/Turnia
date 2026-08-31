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
        label: 'Descanso',
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
            Establece tus días laborales, franjas horarias y descansos habituales.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-[#f8f9fa] hover:bg-[#edeeef] text-[#454652] border border-[#e1e3e4] rounded-lg text-sm font-semibold transition-colors"
          >
            Descartar
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSaved ? 'check' : 'save'}
            </span>
            <span>{isSaved ? '¡Guardado!' : 'Guardar cambios'}</span>
          </button>
        </div>
      </div>

      {/* Days Schedule Card */}
      <div className="bg-white border border-[#e1e3e4] rounded-xl overflow-hidden shadow-2xs divide-y divide-[#f3f4f5]">
        {schedule.map((day, idx) => (
          <div
            key={day.dayName}
            className={`p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
              !day.active ? 'bg-[#f8f9fa]/60' : 'bg-white'
            }`}
          >
            {/* Left: Toggle + Day Name */}
            <div className="flex items-center gap-4 min-w-[160px]">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={day.active}
                  onChange={() => handleToggleDay(idx)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#c5c5d4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c5c5d4] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#24389c]"></div>
              </label>

              <div>
                <span
                  className={`font-bold text-sm tracking-wide ${
                    day.active ? 'text-[#191c1d]' : 'text-[#757684]'
                  }`}
                >
                  {day.dayName}
                </span>
                {!day.active && (
                  <span className="block text-[11px] text-[#757684] font-medium">Cerrado</span>
                )}
              </div>
            </div>

            {/* Right: Time Blocks and Breaks */}
            {day.active ? (
              <div className="flex-1 flex flex-wrap items-center gap-3">
                {day.blocks.map((block) => {
                  if (block.isBreak) {
                    return (
                      <div
                        key={block.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#ffdcc6]/50 border border-[#ffb784] rounded-lg text-xs"
                      >
                        <span className="font-semibold text-[#8f4700]">Descanso:</span>
                        <input
                          type="time"
                          value={block.start}
                          onChange={(e) =>
                            handleTimeChange(idx, block.id, 'start', e.target.value)
                          }
                          className="bg-transparent font-mono font-medium text-[#8f4700] text-xs outline-none"
                        />
                        <span className="text-[#8f4700]">-</span>
                        <input
                          type="time"
                          value={block.end}
                          onChange={(e) =>
                            handleTimeChange(idx, block.id, 'end', e.target.value)
                          }
                          className="bg-transparent font-mono font-medium text-[#8f4700] text-xs outline-none"
                        />
                        <button
                          onClick={() => handleRemoveBlock(idx, block.id)}
                          className="text-[#8f4700] hover:text-[#ba1a1a] p-0.5"
                          title="Eliminar descanso"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={block.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f3f4f5] border border-[#e1e3e4] rounded-lg text-xs"
                    >
                      <input
                        type="time"
                        value={block.start}
                        onChange={(e) =>
                          handleTimeChange(idx, block.id, 'start', e.target.value)
                        }
                        className="bg-transparent font-mono font-semibold text-[#191c1d] text-xs outline-none"
                      />
                      <span className="text-[#757684]">a</span>
                      <input
                        type="time"
                        value={block.end}
                        onChange={(e) =>
                          handleTimeChange(idx, block.id, 'end', e.target.value)
                        }
                        className="bg-transparent font-mono font-semibold text-[#191c1d] text-xs outline-none"
                      />
                    </div>
                  );
                })}

                {/* Add Break Button */}
                <button
                  onClick={() => handleAddBreak(idx)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#24389c] hover:bg-[#dee0ff]/40 rounded-lg font-medium transition-colors border border-dashed border-[#bac3ff]"
                >
                  <span className="material-symbols-outlined text-[16px]">free_breakfast</span>
                  <span>+ Añadir descanso</span>
                </button>
              </div>
            ) : (
              <div className="text-xs text-[#757684] italic">
                No hay turnos disponibles para este día
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Global Configuration Card */}
      <div className="bg-white border border-[#e1e3e4] rounded-xl p-5 shadow-2xs">
        <h3 className="font-bold text-base text-[#191c1d] mb-4">
          Parámetros generales de agendamiento
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
              Zona Horaria
            </label>
            <select
              value={timeZone}
              onChange={(e) => onChangeTimeZone(e.target.value)}
              className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm text-[#191c1d] bg-white focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/20 outline-none"
            >
              <option value="UTC-5 (Bogotá, Lima, Quito)">UTC-5 (Bogotá, Lima, Quito)</option>
              <option value="UTC-3 (Buenos Aires, Santiago)">UTC-3 (Buenos Aires, Santiago)</option>
              <option value="UTC-6 (Ciudad de México)">UTC-6 (Ciudad de México)</option>
              <option value="UTC+1 (Madrid, Barcelona)">UTC+1 (Madrid, Barcelona)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
              Margen entre citas
            </label>
            <select
              value={bufferTime}
              onChange={(e) => setBufferTime(e.target.value)}
              className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm text-[#191c1d] bg-white focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/20 outline-none"
            >
              <option value="0 min">Sin margen (0 min)</option>
              <option value="10 min">10 minutos</option>
              <option value="15 min">15 minutos (Recomendado)</option>
              <option value="30 min">30 minutos</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
              Antelación máxima
            </label>
            <select
              value={advanceDays}
              onChange={(e) => setAdvanceDays(e.target.value)}
              className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm text-[#191c1d] bg-white focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/20 outline-none"
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
