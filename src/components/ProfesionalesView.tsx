import React from 'react';
import { Professional } from '../types';

interface ProfesionalesViewProps {
  professionals: Professional[];
  onOpenNewProfessional: () => void;
  onEditProfessional: (prof: Professional) => void;
  onDeleteProfessional: (id: string) => void;
  onNavigateToSchedule: () => void;
  searchQuery?: string;
}

export const ProfesionalesView: React.FC<ProfesionalesViewProps> = ({
  professionals,
  onOpenNewProfessional,
  onEditProfessional,
  onDeleteProfessional,
  onNavigateToSchedule,
  searchQuery = '',
}) => {
  const filteredProfessionals = professionals.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      (p.specialties && p.specialties.some((s) => s.toLowerCase().includes(q)))
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
      default:
        return null;
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
            Administra el equipo de trabajo, sus roles, especialidades y disponibilidad.
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

      {/* Empty State */}
      {filteredProfessionals.length === 0 ? (
        <div className="bg-white border border-[#e1e3e4] rounded-xl p-12 text-center shadow-2xs">
          <div className="w-16 h-16 bg-[#dee0ff] text-[#24389c] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">badge</span>
          </div>
          <h3 className="font-bold text-lg text-[#191c1d] mb-1">No hay profesionales registrados</h3>
          <p className="text-sm text-[#757684] max-w-md mx-auto mb-6">
            Comienza agregando a los miembros de tu equipo para asignarles servicios y citas.
          </p>
          <button
            onClick={onOpenNewProfessional}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Registrar primer profesional</span>
          </button>
        </div>
      ) : (
        /* Professionals Cards Grid */
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
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#24389c] to-[#3f51b5] text-white border border-[#bac3ff] flex items-center justify-center font-bold text-base shadow-2xs">
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

                {/* Contact info & specialties */}
                <div className="space-y-3 py-3 border-y border-[#f3f4f5]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#757684]">Citas registradas:</span>
                    <span className="font-bold text-[#191c1d]">{prof.monthlyBookings} citas</span>
                  </div>

                  {prof.phone && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#757684]">Teléfono:</span>
                      <span className="font-mono text-[#454652]">{prof.phone}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {prof.specialties &&
                      prof.specialties.map((spec) => (
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
                  onClick={() => onEditProfessional(prof)}
                  className="flex-1 py-1.5 px-3 bg-[#f8f9fa] hover:bg-[#edeeef] text-[#191c1d] border border-[#e1e3e4] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Editar</span>
                </button>
                <button
                  onClick={onNavigateToSchedule}
                  className="py-1.5 px-3 text-[#24389c] hover:bg-[#dee0ff]/40 border border-[#dee0ff] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                  title="Configurar horario"
                >
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <span>Horario</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`¿Estás seguro de eliminar a "${prof.name}"?`)) {
                      onDeleteProfessional(prof.id);
                    }
                  }}
                  className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/40 border border-[#ffdad6] rounded-lg transition-colors"
                  title="Eliminar profesional"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
