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
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Agregar servicio</span>
        </button>
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 ? (
        <div className="bg-white border border-[#e1e3e4] rounded-xl p-12 text-center shadow-2xs">
          <div className="w-16 h-16 bg-[#dee0ff] text-[#24389c] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">content_cut</span>
          </div>
          <h3 className="font-bold text-lg text-[#191c1d] mb-1">No hay servicios en el catálogo</h3>
          <p className="text-sm text-[#757684] max-w-md mx-auto mb-6">
            Agrega los servicios que ofrece tu negocio para que puedas agendar citas y calcular ingresos.
          </p>
          <button
            onClick={onOpenNewService}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Crear primer servicio</span>
          </button>
        </div>
      ) : (
        /* Services Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-[#e1e3e4] rounded-xl p-5 flex flex-col justify-between hover:shadow-md hover:border-[#bac3ff] transition-all group"
            >
              <div>
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-bold text-lg text-[#191c1d] group-hover:text-[#24389c] transition-colors leading-tight">
                    {service.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                      service.active
                        ? 'bg-[#dee0ff] text-[#24389c] border border-[#bac3ff]'
                        : 'bg-[#e1e3e4] text-[#757684]'
                    }`}
                  >
                    {service.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <span className="inline-block text-[11px] font-semibold text-[#24389c] bg-[#f3f4f5] px-2 py-0.5 rounded mb-2">
                  {service.category}
                </span>

                <p className="text-xs text-[#454652] leading-relaxed line-clamp-2 mb-4">
                  {service.description || 'Sin descripción adicional.'}
                </p>
              </div>

              <div className="pt-4 border-t border-[#f3f4f5] mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-[#454652] font-medium">
                    <span className="material-symbols-outlined text-[18px] text-[#757684]">
                      schedule
                    </span>
                    <span>{service.durationMinutes} min</span>
                  </div>
                  <div className="text-lg font-bold text-[#191c1d] font-mono">
                    ${Number(service.price || 0).toLocaleString('es-CO')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditService(service)}
                    className="flex-1 py-1.5 px-3 bg-[#f8f9fa] hover:bg-[#edeeef] text-[#191c1d] border border-[#e1e3e4] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => onToggleActive(service.id)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors border ${
                      service.active
                        ? 'text-[#ba1a1a] hover:bg-[#ffdad6]/40 border-[#ffdad6]'
                        : 'text-[#24389c] hover:bg-[#dee0ff]/40 border-[#dee0ff]'
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
                    className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/40 border border-[#ffdad6] rounded-lg transition-colors"
                    title="Eliminar servicio"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
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
