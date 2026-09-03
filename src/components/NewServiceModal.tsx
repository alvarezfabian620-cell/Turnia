import React, { useState, useEffect } from 'react';
import { ServiceItem } from '../types';

interface NewServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Omit<ServiceItem, 'id'>) => void;
  editingService?: ServiceItem | null;
}

export const NewServiceModal: React.FC<NewServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingService,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Peluquería');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [price, setPrice] = useState(25.0);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (editingService) {
      setName(editingService.name);
      setCategory(editingService.category);
      setDescription(editingService.description);
      setDurationMinutes(editingService.durationMinutes);
      setPrice(editingService.price);
      setActive(editingService.active);
    } else {
      setName('');
      setCategory('Peluquería');
      setDescription('');
      setDurationMinutes(45);
      setPrice(25.0);
      setActive(true);
    }
  }, [editingService, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name,
      category,
      description,
      durationMinutes: Number(durationMinutes),
      price: Number(price),
      active,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in duration-150">
        <div className="flex justify-between items-center pb-3 border-b border-[#e1e3e4] mb-4">
          <h3 className="font-bold text-lg text-[#191c1d]">
            {editingService ? 'Editar Servicio' : 'Agregar Servicio'}
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
              Nombre del Servicio *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Balayage Luminoso"
              className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm focus:border-[#24389c] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#757684] mb-1">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm bg-white focus:border-[#24389c] outline-none"
            >
              <option value="Peluquería">Peluquería</option>
              <option value="Coloración">Coloración</option>
              <option value="Uñas">Uñas</option>
              <option value="Bienestar">Bienestar & Masajes</option>
              <option value="Estética Facial">Estética Facial</option>
              <option value="Capilar">Capilar</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#757684] mb-1">
              Descripción
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles del procedimiento o productos incluidos..."
              className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm focus:border-[#24389c] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#757684] mb-1">
                Duración (minutos)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                min="10"
                step="5"
                className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm font-mono focus:border-[#24389c] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#757684] mb-1">
                Precio ($)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min="0"
                step="0.5"
                className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm font-mono focus:border-[#24389c] outline-none"
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-2 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 accent-[#24389c] rounded"
            />
            <span className="text-xs font-semibold text-[#191c1d]">
              Servicio activo y disponible para reservas
            </span>
          </label>

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
              {editingService ? 'Actualizar' : 'Guardar servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
