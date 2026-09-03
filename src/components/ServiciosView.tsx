import React from 'react';
import { ServiceItem } from '../types';

interface ServiciosViewProps {
  services: ServiceItem[];
  onOpenNewService: () => void;
  onEditService: (service: ServiceItem) => void;
  onToggleActive: (serviceId: string) => void;
  onDeleteService: (serviceId: string) => void;
  searchQuery?: string;
}

export const ServiciosView: React.FC<ServiciosViewProps> = ({
  services,
  onOpenNewService,
  onEditService,
  onToggleActive,
  onDeleteService,
  searchQuery = '',
}) => {
  const filteredServices = services.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-[28px] font-bold text-[#191c1d] tracking-tight">
            Servicios
          </h2>
          <p className="text-[#454652] text-sm md:text-base mt-1">
            Configura el catálogo de servicios, tarifas y duración que ofreces a tus clientes.
          </p>
        </div>

        <button
          onClick={onOpenNewService}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-xl text-sm font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Agregar servicio</span>
        </button>
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 ? (
        <div className="bg-white border border-[#e1e3e4] rounded-2xl p-12 text-center shadow-2xs">
          <div className="w-16 h-16 bg-[#dee0ff] text-[#24389c] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">content_cut</span>
          </div>
          <h3 className="font-bold text-lg text-[#191c1d] mb-1">No hay servicios en el catálogo</h3>
          <p className="text-sm text-[#757684] max-w-md mx-auto mb-6">
            Agrega los servicios que ofrece tu negocio para que puedas agendar citas y calcular ingresos.
          </p>
          <button
            onClick={onOpenNewService}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-xl text-sm font-bold transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Crear primer servicio</span>
          </button>
        </div>
      ) : (
        /* Modern Services Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-[#e1e3e4] rounded-2xl p-5 flex flex-col justify-between hover:shadow-md hover:border-[#bac3ff] transition-all group relative"
            >
              {/* Card Header: Category & Active Status Badge */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="inline-flex items-center text-[11px] font-bold text-[#24389c] bg-[#dee0ff]/60 px-2.5 py-1 rounded-lg border border-[#bac3ff]/40">
                    {service.category || 'General'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      service.active
                        ? 'bg-[#e1f5ec] text-[#047857]'
                        : 'bg-[#f3f4f5] text-[#757684]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        service.active ? 'bg-[#10b981]' : 'bg-[#a0a1ab]'
                      }`}
                    />
                    <span>{service.active ? 'Activo' : 'Inactivo'}</span>
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-base md:text-lg text-[#191c1d] group-hover:text-[#24389c] transition-colors leading-snug mb-1.5">
                  {service.name}
                </h3>

                <p className="text-xs text-[#757684] leading-relaxed line-clamp-2 mb-4 min-h-[32px]">
                  {service.description || 'Sin descripción detallada.'}
                </p>
              </div>

              {/* Card Bottom: Metrics Strip & Clean Action Buttons */}
              <div className="space-y-3 pt-3 border-t border-[#f0f1f2]">
                {/* Duration & Price Strip */}
                <div className="p-3 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#454652] font-semibold">
                    <span className="material-symbols-outlined text-[17px] text-[#757684]">
                      schedule
                    </span>
                    <span>{service.durationMinutes} min</span>
                  </div>
                  <div className="text-base font-bold text-[#24389c] font-mono">
                    ${Number(service.price || 0).toLocaleString('es-CO')}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditService(service)}
                    className="flex-1 h-9 px-3 bg-white hover:bg-[#dee0ff]/30 text-[#24389c] border border-[#e1e3e4] hover:border-[#24389c] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[17px]">edit</span>
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => onToggleActive(service.id)}
                    className={`h-9 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer shadow-2xs ${
                      service.active
                        ? 'text-[#ba1a1a] hover:bg-[#ffdad6]/40 border-[#ffdad6]'
                        : 'text-[#047857] hover:bg-[#e1f5ec] border-[#a7f3d0]'
                    }`}
                    title={service.active ? 'Desactivar servicio' : 'Activar servicio'}
                  >
                    {service.active ? 'Desactivar' : 'Activar'}
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`¿Estás seguro de eliminar el servicio "${service.name}"?`)) {
                        onDeleteService(service.id);
                      }
                    }}
                    className="w-9 h-9 text-[#757684] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 border border-[#e1e3e4] hover:border-[#ffdad6] rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
                    title="Eliminar servicio"
                  >
                    <span className="material-symbols-outlined text-[17px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
