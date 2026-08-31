import React, { useState, useEffect } from 'react';
import { Professional } from '../types';

interface NewProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (professional: Omit<Professional, 'id' | 'monthlyBookings'>) => void;
  editingProfessional?: Professional | null;
}

export const NewProfessionalModal: React.FC<NewProfessionalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProfessional,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Estilista');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialtiesText, setSpecialtiesText] = useState('Corte, Peinado');
  const [status, setStatus] = useState<Professional['status']>('disponible');

  useEffect(() => {
    if (editingProfessional) {
      setName(editingProfessional.name);
      setRole(editingProfessional.role);
      setEmail(editingProfessional.email || '');
      setPhone(editingProfessional.phone || '');
      setSpecialtiesText(editingProfessional.specialties.join(', '));
      setStatus(editingProfessional.status);
    } else {
      setName('');
      setRole('Estilista');
      setEmail('');
      setPhone('');
      setSpecialtiesText('Corte, Peinado');
      setStatus('disponible');
    }
  }, [editingProfessional, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const specialties = specialtiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      name,
      role,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@turnia.app`,
      phone: phone || '+57 300 000 0000',
      specialties: specialties.length > 0 ? specialties : ['General'],
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in duration-150">
        <div className="flex justify-between items-center pb-3 border-b border-[#e1e3e4] mb-4">
          <h3 className="font-bold text-lg text-[#191c1d]">
            {editingProfessional ? 'Editar Profesional' : 'Agregar Profesional'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-[#757684] hover:text-[#191c1d] rounded-lg"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-[#757684] mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Mateo Valenzuela"
              className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm focus:border-[#24389c] outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#757684] mb-1">
                Rol / Puesto
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ej. Barbero Senior"
                className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm focus:border-[#24389c] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#757684] mb-1">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Professional['status'])}
                className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm bg-white focus:border-[#24389c] outline-none"
              >
                <option value="disponible">Disponible</option>
                <option value="ocupado">Ocupado</option>
                <option value="ausente">Ausente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#757684] mb-1">
              Especialidades (separadas por coma)
            </label>
            <input
              type="text"
              value={specialtiesText}
              onChange={(e) => setSpecialtiesText(e.target.value)}
              placeholder="Ej. Corte, Barba, Tratamientos"
              className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm focus:border-[#24389c] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#757684] mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="profesional@turnia.app"
                className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm focus:border-[#24389c] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#757684] mb-1">
                Teléfono
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+57 300 000 0000"
                className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm focus:border-[#24389c] outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e3e4]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#e1e3e4] rounded-lg text-sm text-[#454652] hover:bg-[#f3f4f5]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#24389c] hover:bg-[#1d2d7c] text-white font-semibold rounded-lg text-sm"
            >
              {editingProfessional ? 'Guardar Cambios' : 'Registrar profesional'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
