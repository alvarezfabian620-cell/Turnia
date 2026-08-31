import React from 'react';
import { Professional, ViewMode } from '../types';

interface ProfesionalesViewProps {
  professionals: Professional[];
  onOpenNewProfessional: () => void;
  onSelectProfessional: (prof: Professional) => void;
  onNavigateToSchedule: () => void;
  searchQuery?: string;
}

export const ProfesionalesView: React.FC<ProfesionalesViewProps> = ({
  professionals,
  onOpenNewProfessional,
  onSelectProfessional,
  onNavigateToSchedule,
  searchQuery = '',
}) => {
  const filteredProfessionals = professionals.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.specialties.some((s) => s.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status: Professional['status']) => {
    switch (status) {
      case 'disponible':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#dee0ff] text-[#24389c] border border-[#bac3ff]">
            Disponible
          </span>
        );
      case 'ocupado':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ffdcc6] text-[#8f4700] border border-[#ffb784]">
            Ocupado
          </span>
        );
      case 'ausente':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e1e3e4] text-[#757684]">
            Ausente
          </span>
        );
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-[28px] font-bold text-[#191c1d] tracking-tight">
            Profesionales
          </h2>
          <p className="text-[#454652] text-sm md:text-base mt-1">
            Administra el equipo de trabajo, sus roles y disponibilidad.
          </p>
        </div>

        <button
          onClick={onOpenNewProfessional}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Agregar profesional</span>
        </button>
      </div>

      {/* Professionals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProfessionals.map((prof) => (
          <div
            key={prof.id}
            className="bg-white border border-[#e1e3e4] rounded-xl p-5 flex flex-col justify-between hover:shadow-md hover:border-[#bac3ff] transition-all group"
          >
            <div>
              {/* Header with Avatar and Status */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#24389c]/10 text-[#24389c] border border-[#bac3ff] flex items-center justify-center font-bold text-base shadow-2xs">
                    {getInitials(prof.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#191c1d] group-hover:text-[#24389c] transition-colors leading-tight">
                      {prof.name}
                    </h3>
                    <p className="text-xs text-[#757684] mt-0.5">{prof.role}</p>
                  </div>
                </div>

                <div>{getStatusBadge(prof.status)}</div>
              </div>

              {/* Stats & specialties */}
              <div className="space-y-3 py-3 border-y border-[#f3f4f5]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#757684]">Reservas este mes</span>
                  <span className="font-bold text-[#191c1d]">{prof.monthlyBookings} citas</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {prof.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="px-2 py-0.5 bg-[#f3f4f5] text-[#454652] rounded-md text-[11px] font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 mt-2 flex items-center gap-2">
              <button
                onClick={() => onSelectProfessional(prof)}
                className="flex-1 py-1.5 px-3 bg-[#f8f9fa] hover:bg-[#edeeef] text-[#191c1d] border border-[#e1e3e4] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>Ver perfil</span>
              </button>
              <button
                onClick={onNavigateToSchedule}
                className="py-1.5 px-3 text-[#24389c] hover:bg-[#dee0ff]/40 border border-[#dee0ff] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                title="Configurar horario de este profesional"
              >
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                <span>Horarios</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
