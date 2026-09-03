import React, { useState, useMemo } from 'react';
import { Reservation, Professional, ServiceItem, ReservationStatus } from '../types';

interface ReservasViewProps {
  reservations: Reservation[];
  professionals: Professional[];
  services: ServiceItem[];
  onOpenNewBooking: () => void;
  onSelectReservation: (res: Reservation) => void;
  onEditReservation: (res: Reservation) => void;
  onCancelReservation: (res: Reservation) => void;
  searchQuery?: string;
}

export const ReservasView: React.FC<ReservasViewProps> = ({
  reservations,
  professionals,
  services,
  onOpenNewBooking,
  onSelectReservation,
  onEditReservation,
  onCancelReservation,
  searchQuery = '',
}) => {
  const [clientSearch, setClientSearch] = useState(searchQuery);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter logic
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // Global / Client text match
      const search = (clientSearch || searchQuery).toLowerCase().trim();
      if (search) {
        const matchesClient = r.clientName.toLowerCase().includes(search);
        const matchesPhone = r.clientPhone?.toLowerCase().includes(search);
        const matchesService = r.serviceName.toLowerCase().includes(search);
        if (!matchesClient && !matchesPhone && !matchesService) return false;
      }

      // Date match
      if (selectedDate && r.date !== selectedDate) {
        return false;
      }

      // Professional match
      if (selectedProfessional && r.professionalId !== selectedProfessional) {
        return false;
      }

      // Service match
      if (selectedService && r.serviceId !== selectedService) {
        return false;
      }

      // Status match
      if (selectedStatus && r.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [
    reservations,
    clientSearch,
    searchQuery,
    selectedDate,
    selectedProfessional,
    selectedService,
    selectedStatus,
  ]);

  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage) || 1;
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setClientSearch('');
    setSelectedDate('');
    setSelectedProfessional('');
    setSelectedService('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(clientSearch) ||
    Boolean(selectedDate) ||
    Boolean(selectedProfessional) ||
    Boolean(selectedService) ||
    Boolean(selectedStatus);

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'confirmada':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#dee0ff] text-[#24389c] border border-[#bac3ff]">
            Confirmada
          </span>
        );
      case 'pendiente':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ffdcc6] text-[#6c3400] border border-[#ffb784]">
            Pendiente
          </span>
        );
      case 'en_curso':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e0e0ff] text-[#4c56af] border border-[#bdc2ff]">
            En curso
          </span>
        );
      case 'completada':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e1e3e4] text-[#454652]">
            Completada
          </span>
        );
      case 'cancelada':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ffdad6] text-[#ba1a1a]">
            Cancelada
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-[28px] font-bold text-[#191c1d] tracking-tight">
            Reservas
          </h2>
          <p className="text-[#454652] text-sm md:text-base mt-1">
            Administra las citas y reservas de tu negocio.
          </p>
        </div>

        <button
          onClick={onOpenNewBooking}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Nueva reserva</span>
        </button>
      </div>

      {/* Filters Section Card */}
      <div className="bg-white p-5 rounded-xl border border-[#e1e3e4] shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Buscar Cliente */}
          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
              Buscar cliente
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757684] text-[18px]">
                person_search
              </span>
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Nombre o teléfono..."
                className="w-full pl-9 pr-3 py-2 border border-[#e1e3e4] rounded-lg text-sm text-[#191c1d] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
              Fecha
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm text-[#191c1d] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/20 outline-none transition-all bg-white"
            />
          </div>

          {/* Profesional */}
          <div>
            <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
              Profesional
            </label>
            <select
              value={selectedProfessional}
              onChange={(e) => {
                setSelectedProfessional(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm text-[#191c1d] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/20 outline-none transition-all bg-white"
            >
              <option value="">Todos</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Servicio */}
          <div>
            <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
              Servicio
            </label>
            <select
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm text-[#191c1d] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/20 outline-none transition-all bg-white"
            >
              <option value="">Todos</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
              Estado
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm text-[#191c1d] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/20 outline-none transition-all bg-white"
            >
              <option value="">Todos</option>
              <option value="confirmada">Confirmada</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_curso">En curso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 pt-3 border-t border-[#f3f4f5] flex items-center justify-between text-xs">
            <span className="text-[#757684]">
              Filtros activos ({filteredReservations.length} resultados)
            </span>
            <button
              onClick={clearFilters}
              className="text-[#24389c] font-semibold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Data Table Card */}
      <div className="bg-white rounded-xl border border-[#e1e3e4] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e1e3e4] bg-[#f8f9fa]">
                <th className="py-3 px-4 text-xs font-semibold text-[#757684] uppercase tracking-wider">
                  Fecha
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-[#757684] uppercase tracking-wider">
                  Hora
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-[#757684] uppercase tracking-wider">
                  Cliente
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-[#757684] uppercase tracking-wider">
                  Servicio
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-[#757684] uppercase tracking-wider">
                  Profesional
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-[#757684] uppercase tracking-wider">
                  Estado
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-[#757684] uppercase tracking-wider text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f5] text-sm text-[#191c1d]">
              {paginatedReservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#757684]">
                    <span className="material-symbols-outlined text-4xl text-[#c5c5d4] block mb-2">
                      event_busy
                    </span>
                    No se encontraron reservas con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginatedReservations.map((res) => (
                  <tr
                    key={res.id}
                    className="hover:bg-[#f8f9fa] transition-colors group cursor-pointer"
                    onClick={() => onSelectReservation(res)}
                  >
                    <td className="py-4 px-4 whitespace-nowrap text-xs font-medium text-[#454652]">
                      {res.date}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap font-mono text-xs font-semibold text-[#24389c]">
                      {res.time}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#191c1d] group-hover:text-[#24389c] transition-colors whitespace-nowrap">
                      {res.clientName}
                    </td>
                    <td className="py-4 px-4 text-[#454652] whitespace-nowrap">
                      {res.serviceName}
                    </td>
                    <td className="py-4 px-4 text-[#191c1d] whitespace-nowrap">
                      {res.professionalName}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">{getStatusBadge(res.status)}</td>
                    <td
                      className="py-4 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5 p-1 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl shadow-2xs">
                        <button
                          onClick={() => onSelectReservation(res)}
                          className="w-8 h-8 rounded-lg bg-white border border-[#e1e3e4] hover:border-[#24389c] text-[#24389c] hover:bg-[#dee0ff]/40 transition-all flex items-center justify-center shadow-2xs cursor-pointer"
                          title="Ver detalles completos"
                        >
                          <span className="material-symbols-outlined text-[17px]">visibility</span>
                        </button>
                        <button
                          onClick={() => onEditReservation(res)}
                          className="w-8 h-8 rounded-lg bg-white border border-[#e1e3e4] hover:border-[#24389c] text-[#454652] hover:text-[#24389c] hover:bg-[#f3f4f5] transition-all flex items-center justify-center shadow-2xs cursor-pointer"
                          title="Editar cita"
                        >
                          <span className="material-symbols-outlined text-[17px]">edit</span>
                        </button>
                        {res.status !== 'cancelada' ? (
                          <button
                            onClick={() => onCancelReservation(res)}
                            className="w-8 h-8 rounded-lg bg-white border border-[#e1e3e4] hover:border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ffdad6]/50 transition-all flex items-center justify-center shadow-2xs cursor-pointer"
                            title="Cancelar reserva"
                          >
                            <span className="material-symbols-outlined text-[17px]">cancel</span>
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="border-t border-[#e1e3e4] px-5 py-3.5 flex items-center justify-between bg-[#f8f9fa]">
          <span className="text-xs text-[#757684]">
            Mostrando{' '}
            <span className="font-semibold text-[#191c1d]">
              {filteredReservations.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            a{' '}
            <span className="font-semibold text-[#191c1d]">
              {Math.min(currentPage * itemsPerPage, filteredReservations.length)}
            </span>{' '}
            de{' '}
            <span className="font-semibold text-[#191c1d]">{filteredReservations.length}</span>{' '}
            reservas
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-[#e1e3e4] rounded-lg text-[#191c1d] hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              title="Página anterior"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="text-xs px-2 text-[#454652]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1.5 border border-[#e1e3e4] rounded-lg text-[#191c1d] hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              title="Página siguiente"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
