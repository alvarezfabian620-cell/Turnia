import React, { useState } from 'react';
import { ClientItem } from '../types';

interface ClientesViewProps {
  clients: ClientItem[];
  onAddClient: (client: Omit<ClientItem, 'id'>) => void;
  onOpenNewBookingWithClient?: (client: ClientItem) => void;
  searchQuery?: string;
}

export const ClientesView: React.FC<ClientesViewProps> = ({
  clients,
  onAddClient,
  onOpenNewBookingWithClient,
  searchQuery = '',
}) => {
  const [search, setSearch] = useState(searchQuery);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const filteredClients = clients.filter((c) => {
    const q = (search || searchQuery).toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddClient({
      name,
      phone: phone || '+34 600 000 000',
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@ejemplo.com`,
      totalVisits: 1,
      lastVisit: new Date().toISOString().split('T')[0],
      notes,
    });
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-[28px] font-bold text-[#191c1d] tracking-tight">
            Clientes
          </h2>
          <p className="text-[#454652] text-sm md:text-base mt-1">
            Gestiona la base de datos de tus clientes, historial y notas de atención.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          <span>Registrar cliente</span>
        </button>
      </div>

      {/* Search and Total */}
      <div className="bg-white border border-[#e1e3e4] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757684] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono o correo..."
            className="w-full pl-9 pr-3 py-2 border border-[#e1e3e4] rounded-lg text-sm focus:border-[#24389c] outline-none"
          />
        </div>
        <div className="text-xs text-[#757684] font-medium">
          Total de clientes registrados:{' '}
          <span className="font-bold text-[#191c1d] text-sm">{clients.length}</span>
        </div>
      </div>

      {/* Clients Table Card */}
      <div className="bg-white border border-[#e1e3e4] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e1e3e4] bg-[#f8f9fa]">
                <th className="py-3 px-4 text-xs font-semibold text-[#757684] uppercase tracking-wider">
                  Cliente
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-[#757684] uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-[#757684] uppercase tracking-wider">
                  Correo
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-[#757684] uppercase tracking-wider">
                  Visitas
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-[#757684] uppercase tracking-wider">
                  Última visita
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-[#757684] uppercase tracking-wider text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f5] text-sm">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-[#f8f9fa] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#191c1d]">
                    {client.name}
                    {client.notes && (
                      <span className="block text-[11px] font-normal text-[#757684] mt-0.5">
                        {client.notes}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-[#454652]">{client.phone}</td>
                  <td className="py-3.5 px-4 text-[#454652] text-xs">{client.email}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#24389c]">
                    {client.totalVisits} citas
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#757684]">{client.lastVisit}</td>
                  <td className="py-3.5 px-4 text-right">
                    {onOpenNewBookingWithClient && (
                      <button
                        onClick={() => onOpenNewBookingWithClient(client)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#dee0ff]/60 hover:bg-[#dee0ff] text-[#24389c] text-xs font-semibold rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        <span>Agendar</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl animate-in fade-in duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-[#191c1d]">Registrar Nuevo Cliente</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#757684] hover:text-[#191c1d]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#757684] mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Carla Thompson"
                  className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#24389c]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#757684] mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#24389c]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#757684] mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@ejemplo.com"
                  className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#24389c]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#757684] mb-1">
                  Notas de preferencias
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alergias, preferencias o detalles especiales..."
                  className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#24389c]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#e1e3e4] rounded-lg text-sm text-[#454652] hover:bg-[#f3f4f5]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#24389c] hover:bg-[#1d2d7c] text-white font-semibold rounded-lg text-sm"
                >
                  Guardar cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
