import React, { useState } from 'react';
import { ClientItem } from '../types';

interface ClientesViewProps {
  clients: ClientItem[];
  onAddClient: (client: Omit<ClientItem, 'id'>) => void;
  onUpdateClient: (id: string, client: Partial<ClientItem>) => void;
  onDeleteClient: (id: string) => void;
  onOpenNewBookingWithClient?: (client: ClientItem) => void;
  searchQuery?: string;
}

export const ClientesView: React.FC<ClientesViewProps> = ({
  clients,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onOpenNewBookingWithClient,
  searchQuery = '',
}) => {
  const [search, setSearch] = useState(searchQuery);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);

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

  const openCreateModal = () => {
    setEditingClient(null);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (client: ClientItem) => {
    setEditingClient(client);
    setName(client.name);
    setPhone(client.phone || '');
    setEmail(client.email || '');
    setNotes(client.notes || '');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingClient) {
      onUpdateClient(editingClient.id, {
        name,
        phone: phone || '+57 300 000 0000',
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@turnia.app`,
        notes,
      });
    } else {
      onAddClient({
        name,
        phone: phone || '+57 300 000 0000',
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@turnia.app`,
        totalVisits: 0,
        lastVisit: new Date().toISOString().split('T')[0],
        notes,
      });
    }

    setShowModal(false);
    setEditingClient(null);
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
            Gestiona la base de datos de tus clientes, historial de visitas y notas de atención.
          </p>
        </div>

        <button
          onClick={openCreateModal}
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

      {/* Empty State */}
      {filteredClients.length === 0 ? (
        <div className="bg-white border border-[#e1e3e4] rounded-xl p-12 text-center shadow-2xs">
          <div className="w-16 h-16 bg-[#dee0ff] text-[#24389c] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">group</span>
          </div>
          <h3 className="font-bold text-lg text-[#191c1d] mb-1">No hay clientes registrados</h3>
          <p className="text-sm text-[#757684] max-w-md mx-auto mb-6">
            Registra a tus clientes o se registrarán automáticamente cuando agendes una nueva cita.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Registrar primer cliente</span>
          </button>
        </div>
      ) : (
        /* Clients Table Card */
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
                    <td className="py-3.5 px-4 text-xs text-[#757684]">{client.lastVisit || 'Sin citas'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onOpenNewBookingWithClient && (
                          <button
                            onClick={() => onOpenNewBookingWithClient(client)}
                            className="p-1.5 text-[#24389c] hover:bg-[#dee0ff]/60 rounded-lg transition-colors cursor-pointer"
                            title="Agendar nueva cita para este cliente"
                          >
                            <span className="material-symbols-outlined text-[19px] block">calendar_add_on</span>
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(client)}
                          className="p-1.5 text-[#757684] hover:text-[#191c1d] hover:bg-[#f3f4f5] rounded-lg transition-colors cursor-pointer"
                          title="Editar cliente"
                        >
                          <span className="material-symbols-outlined text-[19px] block">edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de eliminar el cliente "${client.name}"?`)) {
                              onDeleteClient(client.id);
                            }
                          }}
                          className="p-1.5 text-[#757684] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar cliente"
                        >
                          <span className="material-symbols-outlined text-[19px] block">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl animate-in fade-in duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-[#191c1d]">
                {editingClient ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#757684] hover:text-[#191c1d]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#757684] mb-1">
                  Nombre Completo *
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
                  placeholder="+57 300 000 0000"
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
                  placeholder="cliente@turnia.app"
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

              <div className="flex justify-end gap-3 pt-3 border-t border-[#e1e3e4]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#e1e3e4] rounded-lg text-sm text-[#454652] hover:bg-[#f3f4f5]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#24389c] hover:bg-[#1d2d7c] text-white font-semibold rounded-lg text-sm"
                >
                  {editingClient ? 'Guardar Cambios' : 'Guardar cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
