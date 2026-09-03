import React, { useState, useEffect } from 'react';
import { DaySchedule, TimeBlock } from '../types';

interface HorariosViewProps {
  schedule: DaySchedule[];
  onSaveSchedule: (updated: DaySchedule[]) => void;
  timeZone: string;
  onChangeTimeZone: (tz: string) => void;
}

interface FormattedDayRow {
  dayCode: number;
  dayName: string;
  active: boolean;
  openTime: string;
  closeTime: string;
  hasBreak: boolean;
  breakStart: string;
  breakEnd: string;
}

export const HorariosView: React.FC<HorariosViewProps> = ({
  schedule: initialSchedule,
  onSaveSchedule,
  timeZone,
  onChangeTimeZone,
}) => {
  const [dayRows, setDayRows] = useState<FormattedDayRow[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [bufferTime, setBufferTime] = useState('15 min');
  const [advanceDays, setAdvanceDays] = useState('30 días');

  // Convert DaySchedule[] into clean structured FormattedDayRow[]
  useEffect(() => {
    if (!initialSchedule || initialSchedule.length === 0) return;

    const formatted: FormattedDayRow[] = initialSchedule.map((d) => {
      const workingBlocks = (d.blocks || []).filter((b) => !b.isBreak);
      const breakBlocks = (d.blocks || []).filter((b) => b.isBreak);

      // Find earliest start and latest end
      let openTime = '09:00';
      let closeTime = '19:00';

      if (workingBlocks.length > 0) {
        openTime = workingBlocks[0].start || '09:00';
        closeTime = workingBlocks[workingBlocks.length - 1].end || '19:00';
      }

      const hasBreak = breakBlocks.length > 0;
      const breakStart = hasBreak ? breakBlocks[0].start : '13:00';
      const breakEnd = hasBreak ? breakBlocks[0].end : '14:00';

      return {
        dayCode: d.dayCode,
        dayName: d.dayName,
        active: Boolean(d.active),
        openTime,
        closeTime,
        hasBreak,
        breakStart,
        breakEnd,
      };
    });

    setDayRows(formatted);
  }, [initialSchedule]);

  const handleToggleActive = (index: number) => {
    setDayRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], active: !next[index].active };
      return next;
    });
  };

  const handleChangeTime = (
    index: number,
    field: 'openTime' | 'closeTime' | 'breakStart' | 'breakEnd',
    value: string
  ) => {
    setDayRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleToggleBreak = (index: number) => {
    setDayRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], hasBreak: !next[index].hasBreak };
      return next;
    });
  };

  const handleCopyMondayToAll = () => {
    if (dayRows.length === 0) return;
    const monday = dayRows[0];
    setDayRows((prev) =>
      prev.map((d, i) => {
        if (i === 0) return d;
        return {
          ...d,
          active: i < 6 ? monday.active : d.active,
          openTime: monday.openTime,
          closeTime: monday.closeTime,
          hasBreak: monday.hasBreak,
          breakStart: monday.breakStart,
          breakEnd: monday.breakEnd,
        };
      })
    );
  };

  const handleSave = () => {
    const updatedSchedules: DaySchedule[] = dayRows.map((row) => {
      const blocks: TimeBlock[] = [];

      if (row.active) {
        // Main working block
        blocks.push({
          id: `work-${row.dayCode}`,
          start: row.openTime,
          end: row.closeTime,
          isBreak: false,
          label: 'Jornada',
        });

        // Break block if enabled
        if (row.hasBreak) {
          blocks.push({
            id: `break-${row.dayCode}`,
            start: row.breakStart,
            end: row.breakEnd,
            isBreak: true,
            label: 'Almuerzo',
          });
        }
      }

      return {
        dayCode: row.dayCode,
        dayName: row.dayName,
        active: row.active,
        blocks,
      };
    });

    onSaveSchedule(updatedSchedules);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
            Configura el horario de apertura, cierre y descansos de tu negocio.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSave}
            className="h-10 px-6 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSaved ? 'check' : 'save'}
            </span>
            <span>{isSaved ? '¡Cambios Guardados!' : 'Guardar cambios'}</span>
          </button>
        </div>
      </div>

      {/* Main Schedule Matrix Table */}
      <div className="bg-white border border-[#e1e3e4] rounded-2xl overflow-hidden shadow-2xs">
        {/* Table Toolbar */}
        <div className="px-6 py-3.5 bg-[#f8f9fa] border-b border-[#e1e3e4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="font-bold text-xs text-[#454652] uppercase tracking-wider">
            Horario semanal por días
          </span>
          <button
            onClick={handleCopyMondayToAll}
            className="text-xs font-bold text-[#24389c] hover:underline flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            title="Copiar horario del lunes a los demás días laborables"
          >
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
            <span>Copiar horario del Lunes a todos los días</span>
          </button>
        </div>

        {/* Schedule Table Header */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e1e3e4] bg-[#f8f9fa]/50 text-xs font-bold text-[#757684] uppercase tracking-wider">
                <th className="py-3 px-6 w-48">Día</th>
                <th className="py-3 px-6">Horario de Atención</th>
                <th className="py-3 px-6">Pausa / Almuerzo (Opcional)</th>
                <th className="py-3 px-6 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e3e4] text-sm">
              {dayRows.map((row, index) => {
                const isAlt = index % 2 === 1;

                return (
                  <tr
                    key={row.dayCode}
                    className={`transition-colors ${
                      !row.active
                        ? 'bg-[#fafafa]'
                        : isAlt
                        ? 'bg-[#eff1f4]/40 hover:bg-[#dee0ff]/15'
                        : 'bg-white hover:bg-[#dee0ff]/15'
                    }`}
                  >
                    {/* Col 1: Toggle & Day Name */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={row.active}
                            onChange={() => handleToggleActive(index)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-[#c5c5d4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c5c5d4] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#24389c]"></div>
                        </label>
                        <span
                          className={`font-bold text-sm uppercase tracking-wide ${
                            row.active ? 'text-[#191c1d]' : 'text-[#a0a1ab]'
                          }`}
                        >
                          {row.dayName}
                        </span>
                      </div>
                    </td>

                    {/* Col 2: Opening & Closing Hours */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {row.active ? (
                        <div className="inline-flex items-center gap-2">
                          <input
                            type="time"
                            value={row.openTime}
                            onChange={(e) =>
                              handleChangeTime(index, 'openTime', e.target.value)
                            }
                            className="w-24 px-2.5 py-1.5 bg-white border border-[#e1e3e4] rounded-xl font-mono font-bold text-xs text-[#191c1d] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/15 outline-none text-center shadow-2xs transition-all"
                          />
                          <span className="text-xs font-semibold text-[#757684]">a</span>
                          <input
                            type="time"
                            value={row.closeTime}
                            onChange={(e) =>
                              handleChangeTime(index, 'closeTime', e.target.value)
                            }
                            className="w-24 px-2.5 py-1.5 bg-white border border-[#e1e3e4] rounded-xl font-mono font-bold text-xs text-[#191c1d] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/15 outline-none text-center shadow-2xs transition-all"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-[#a0a1ab] italic">— No disponible —</span>
                      )}
                    </td>

                    {/* Col 3: Break Hours (Optional) */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {row.active ? (
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={row.hasBreak}
                              onChange={() => handleToggleBreak(index)}
                              className="rounded border-[#e1e3e4] text-[#24389c] focus:ring-[#24389c] cursor-pointer"
                            />
                            <span className="text-xs font-semibold text-[#454652]">
                              Pausa de almuerzo
                            </span>
                          </label>

                          {row.hasBreak && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#ffdcc6]/40 border border-[#ffb784] rounded-xl text-xs animate-in fade-in duration-150">
                              <input
                                type="time"
                                value={row.breakStart}
                                onChange={(e) =>
                                  handleChangeTime(index, 'breakStart', e.target.value)
                                }
                                className="w-20 px-1.5 py-0.5 bg-white border border-[#ffb784] rounded-lg font-mono font-bold text-xs text-[#8f4700] outline-none text-center"
                              />
                              <span className="text-xs font-bold text-[#8f4700]">-</span>
                              <input
                                type="time"
                                value={row.breakEnd}
                                onChange={(e) =>
                                  handleChangeTime(index, 'breakEnd', e.target.value)
                                }
                                className="w-20 px-1.5 py-0.5 bg-white border border-[#ffb784] rounded-lg font-mono font-bold text-xs text-[#8f4700] outline-none text-center"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[#a0a1ab] italic">—</span>
                      )}
                    </td>

                    {/* Col 4: Status Badge */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {row.active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#e1f5ec] text-[#047857]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                          <span>Abierto</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ffdad6]/60 text-[#ba1a1a]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                          <span>Cerrado</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
