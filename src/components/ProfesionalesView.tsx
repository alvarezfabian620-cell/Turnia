import React, { useState } from 'react';
import { Professional, Reservation } from '../types';

interface ProfesionalesViewProps {
  professionals: Professional[];
  reservations?: Reservation[];
  onOpenNewProfessional: () => void;
  onEditProfessional: (prof: Professional) => void;
  onDeleteProfessional: (id: string) => void;
  onNavigateToSchedule?: () => void;
  onNavigate?: (view: string) => void;
  searchQuery?: string;
}

export const ProfesionalesView: React.FC<ProfesionalesViewProps> = ({
  professionals,
  reservations = [],
  onOpenNewProfessional,
  onEditProfessional,
  onDeleteProfessional,
  onNavigate,
  searchQuery = '',
}) => {
  const [selectedProfForAppointments, setSelectedProfForAppointments] = useState<Professional | null>(null);

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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#e1f5ec] text-[#047857]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span>Disponible</span>
          </span>
        );
      case 'ocupado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ffdcc6] text-[#8f4700]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8f4700]" />
            <span>Ocupado</span>
          </span>
        );
      case 'ausente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#e1e3e4] text-[#757684]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#757684]" />
            <span>Ausente</span>
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

  // Get appointments for selected professional
  const profAppointments = selectedProfForAppointments
    ? reservations.filter(
        (r) =>
          r.professionalId === selectedProfForAppointments.id ||
          r.professionalName.toLowerCase() === selectedProfForAppointments.name.toLowerCase()
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-[28px] font-bold text-[#191c1d] tracking-tight">
            Profesionales
          </h2>
          <p className="text-[#454652] text-sm md:text-base mt-1">
            Administra el equipo de trabajo, sus especialidades y consulta sus citas asignadas.
          </p>
        </div>

        <button
          onClick={onOpenNewProfessional}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-xl text-sm font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Agregar profesional</span>
        </button>
      </div>

      {/* Empty State */}
      {filteredProfessionals.length === 0 ? (
        <div className="bg-white border border-[#e1e3e4] rounded-2xl p-12 text-center shadow-2xs">
          <div className="w-16 h-16 bg-[#dee0ff] text-[#24389c] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">badge</span>
          </div>
          <h3 className="font-bold text-lg text-[#191c1d] mb-1">No hay profesionales registrados</h3>
          <p className="text-sm text-[#757684] max-w-md mx-auto mb-6">
            Comienza agregando a los miembros de tu equipo para asignarles servicios y citas.
          </p>
          <button
            onClick={onOpenNewProfessional}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-xl text-sm font-bold transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Registrar primer profesional</span>
          </button>
        </div>
      ) : (
        /* Professionals Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProfessionals.map((prof) => {
            const countBookings = reservations.filter(
              (r) =>
                r.professionalId === prof.id ||
                r.professionalName.toLowerCase() === prof.name.toLowerCase()
            ).length;

            return (
              <div
                key={prof.id}
                className="bg-white border border-[#e1e3e4] rounded-2xl p-5 flex flex-col justify-between hover:shadow-md hover:border-[#bac3ff] transition-all group"
              >
                <div>
                  {/* Header with Avatar and Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#24389c] to-[#3f51b5] text-white border border-[#bac3ff] flex items-center justify-center font-bold text-base shadow-2xs shrink-0">
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
                  <div className="space-y-3 py-3 border-y border-[#f0f1f2]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#757684] font-medium">Citas registradas:</span>
                      <span className="font-bold text-[#24389c] bg-[#dee0ff]/60 px-2 py-0.5 rounded-lg">
                        {countBookings} citas
                      </span>
                    </div>

                    {prof.phone && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#757684] font-medium">Teléfono:</span>
                        <span className="font-mono font-semibold text-[#454652]">{prof.phone}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {prof.specialties &&
                        prof.specialties.map((spec) => (
                          <span
                            key={spec}
                            className="px-2.5 py-1 bg-[#f8f9fa] border border-[#e1e3e4] text-[#454652] rounded-lg text-[11px] font-semibold"
                          >
                            {spec}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Action buttons (Horario removed, replaced with Ver citas) */}
                <div className="pt-4 mt-2 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedProfForAppointments(prof)}
                    className="flex-1 h-9 px-3 bg-[#dee0ff]/60 hover:bg-[#24389c] text-[#24389c] hover:text-white border border-[#bac3ff] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Ver citas asignadas a este profesional"
                  >
                    <span className="material-symbols-outlined text-[17px]">calendar_month</span>
                    <span>Ver citas ({countBookings})</span>
                  </button>

                  <button
                    onClick={() => onEditProfessional(prof)}
                    className="h-9 px-3 bg-white hover:bg-[#f8f9fa] text-[#454652] border border-[#e1e3e4] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                    title="Editar datos del profesional"
                  >
                    <span className="material-symbols-outlined text-[17px]">edit</span>
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`¿Estás seguro de eliminar a "${prof.name}"?`)) {
                        onDeleteProfessional(prof.id);
                      }
                    }}
                    className="w-9 h-9 text-[#757684] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 border border-[#e1e3e4] hover:border-[#ffdad6] rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
                    title="Eliminar profesional"
                  >
                    <span className="material-symbols-outlined text-[17px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Ver Citas del Profesional */}
      {selectedProfForAppointments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#e1e3e4] max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e1e3e4] pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#24389c] text-white flex items-center justify-center font-bold text-sm">
                  {getInitials(selectedProfForAppointments.name)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#191c1d]">
                    Citas de {selectedProfForAppointments.name}
                  </h3>
                  <p className="text-xs text-[#757684]">
                    {selectedProfForAppointments.role} • {profAppointments.length} citas registradas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProfForAppointments(null)}
                className="w-8 h-8 rounded-full hover:bg-[#f3f4f5] text-[#757684] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Appointments List with max 5 items visible before scroll */}
            <div className="max-h-[390px] overflow-y-auto space-y-2.5 pr-1.5">
              {profAppointments.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined text-[40px] text-[#bac3ff] mb-2 block">
                    event_busy
                  </span>
                  <p className="font-semibold text-sm text-[#191c1d]">No hay citas registradas</p>
                  <p className="text-xs text-[#757684] mt-1">
                    Este profesional no tiene reservas programadas actualmente.
                  </p>
                </div>
              ) : (
                profAppointments.map((res, idx) => (
                  <div
                    key={res.id}
                    className={`p-3.5 border border-[#e1e3e4] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      idx % 2 === 1 ? 'bg-[#eff1f4]/40' : 'bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#191c1d]">{res.clientName}</span>
                      </div>
                      <div className="text-xs text-[#454652] flex items-center gap-2">
                        <span className="font-semibold text-[#24389c]">{res.serviceName}</span>
                        <span>•</span>
                        <span>${Number(res.price || 0).toLocaleString('es-CO')}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#191c1d]">
                        <span className="material-symbols-outlined text-[15px] text-[#757684]">
                          calendar_today
                        </span>
                        <span>{res.date}</span>
                        <span className="text-[#757684]">|</span>
                        <span>{res.time}</span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          res.status === 'confirmada'
                            ? 'bg-[#e1f5ec] text-[#047857]'
                            : res.status === 'completada'
                            ? 'bg-[#dee0ff] text-[#24389c]'
                            : res.status === 'cancelada'
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
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

            {/* Modal Footer */}
            <div className="border-t border-[#e1e3e4] pt-4 mt-4 flex items-center justify-between gap-3">
              <span className="text-xs text-[#757684]">
                Total citas: <strong className="text-[#191c1d]">{profAppointments.length}</strong>
              </span>

              <div>
                <button
                  onClick={() => setSelectedProfForAppointments(null)}
                  className="px-6 py-2 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
