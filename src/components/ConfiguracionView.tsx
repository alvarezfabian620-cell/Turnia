import React, { useState } from 'react';
import { BusinessConfig } from '../types';

interface ConfiguracionViewProps {
  config: BusinessConfig;
  onSaveConfig: (updated: BusinessConfig) => void;
}

export const ConfiguracionView: React.FC<ConfiguracionViewProps> = ({
  config: initialConfig,
  onSaveConfig,
}) => {
  const [activeTab, setActiveTab] = useState<
    'info' | 'reservas' | 'notificaciones' | 'cuenta'
  >('info');
  const [form, setForm] = useState<BusinessConfig>(initialConfig);
  const [isSaved, setIsSaved] = useState(false);

  React.useEffect(() => {
    if (initialConfig) {
      setForm(initialConfig);
    }
  }, [initialConfig]);

  // Additional settings states
  const [cancellationHours, setCancellationHours] = useState('24');
  const [requireDeposit, setRequireDeposit] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setForm({ ...form, logoUrl: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-[28px] font-bold text-[#191c1d] tracking-tight">
            Configuración
          </h2>
          <p className="text-[#454652] text-sm md:text-base mt-1">
            Gestiona los datos de tu negocio, reservas y preferencias de la cuenta.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isSaved ? 'check' : 'save'}
          </span>
          <span>{isSaved ? '¡Guardado con éxito!' : 'Guardar cambios'}</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-[#e1e3e4] gap-6 overflow-x-auto text-sm font-medium">
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-3 relative transition-colors whitespace-nowrap ${
            activeTab === 'info'
              ? 'text-[#24389c] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#24389c]'
              : 'text-[#757684] hover:text-[#191c1d]'
          }`}
        >
          Información del negocio
        </button>
        <button
          onClick={() => setActiveTab('reservas')}
          className={`pb-3 relative transition-colors whitespace-nowrap ${
            activeTab === 'reservas'
              ? 'text-[#24389c] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#24389c]'
              : 'text-[#757684] hover:text-[#191c1d]'
          }`}
        >
          Políticas de Reservas
        </button>
        <button
          onClick={() => setActiveTab('notificaciones')}
          className={`pb-3 relative transition-colors whitespace-nowrap ${
            activeTab === 'notificaciones'
              ? 'text-[#24389c] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#24389c]'
              : 'text-[#757684] hover:text-[#191c1d]'
          }`}
        >
          Notificaciones & Recordatorios
        </button>
        <button
          onClick={() => setActiveTab('cuenta')}
          className={`pb-3 relative transition-colors whitespace-nowrap ${
            activeTab === 'cuenta'
              ? 'text-[#24389c] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#24389c]'
              : 'text-[#757684] hover:text-[#191c1d]'
          }`}
        >
          Seguridad & Cuenta
        </button>
      </div>

      {/* Tab 1: Info del Negocio */}
      {activeTab === 'info' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-[#e1e3e4] rounded-xl p-6 shadow-2xs space-y-6">
            <h3 className="font-bold text-base text-[#191c1d]">Datos Principales</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
                  Nombre del Negocio
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-[#e1e3e4] rounded-lg px-3.5 py-2 text-sm text-[#191c1d] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/20 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
                  Categoría
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-[#e1e3e4] rounded-lg px-3.5 py-2 text-sm text-[#191c1d] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/20 outline-none transition-all"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
                  Descripción del negocio
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-[#e1e3e4] rounded-lg px-3.5 py-2 text-sm text-[#191c1d] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#f3f4f5] grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
                  Teléfono de contacto
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-[#e1e3e4] rounded-lg px-3.5 py-2 text-sm text-[#191c1d] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/20 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-[#e1e3e4] rounded-lg px-3.5 py-2 text-sm text-[#191c1d] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/20 outline-none transition-all"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
                  Dirección física
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full border border-[#e1e3e4] rounded-lg px-3.5 py-2 text-sm text-[#191c1d] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Logo upload block */}
            <div className="pt-4 border-t border-[#f3f4f5]">
              <label className="block text-xs font-semibold uppercase text-[#757684] mb-2 tracking-wider">
                Logo del Negocio
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-[#e1e3e4] bg-[#f8f9fa] flex items-center justify-center overflow-hidden p-2">
                  <img
                    src={form.logoUrl}
                    alt="Business Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e1e3e4] rounded-lg text-xs font-semibold text-[#191c1d] hover:bg-[#f3f4f5] transition-colors shadow-2xs">
                    <span className="material-symbols-outlined text-[16px] text-[#24389c]">
                      upload
                    </span>
                    <span>Cambiar imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-[#757684] mt-1">
                    Formatos recomendados: PNG, JPG, SVG (Máx 2MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Switches */}
            <div className="pt-4 border-t border-[#f3f4f5] space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-semibold text-[#191c1d] block">
                    Aceptar nuevas reservas online
                  </span>
                  <span className="text-xs text-[#757684]">
                    Permite que los clientes puedan solicitar citas desde la página pública.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={form.acceptNewBookings}
                  onChange={(e) => setForm({ ...form, acceptNewBookings: e.target.checked })}
                  className="w-5 h-5 accent-[#24389c] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-semibold text-[#191c1d] block">
                    Mostrar precios públicamente
                  </span>
                  <span className="text-xs text-[#757684]">
                    Los clientes verán las tarifas de los servicios antes de agendar.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={form.showPricesPublicly}
                  onChange={(e) => setForm({ ...form, showPricesPublicly: e.target.checked })}
                  className="w-5 h-5 accent-[#24389c] rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Políticas de Reservas */}
      {activeTab === 'reservas' && (
        <div className="bg-white border border-[#e1e3e4] rounded-xl p-6 shadow-2xs space-y-6">
          <h3 className="font-bold text-base text-[#191c1d]">Políticas de Cancelación y Pagos</h3>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
                Tiempo límite para cancelación sin cargo
              </label>
              <select
                value={cancellationHours}
                onChange={(e) => setCancellationHours(e.target.value)}
                className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm text-[#191c1d] bg-white outline-none focus:border-[#24389c]"
              >
                <option value="12">12 horas de anticipación</option>
                <option value="24">24 horas de anticipación (Recomendado)</option>
                <option value="48">48 horas de anticipación</option>
              </select>
            </div>

            <label className="flex items-center justify-between cursor-pointer pt-3">
              <div>
                <span className="text-sm font-semibold text-[#191c1d] block">
                  Exigir seña o depósito previo
                </span>
                <span className="text-xs text-[#757684]">
                  Solicita un porcentaje del total para confirmar la reserva.
                </span>
              </div>
              <input
                type="checkbox"
                checked={requireDeposit}
                onChange={(e) => setRequireDeposit(e.target.checked)}
                className="w-5 h-5 accent-[#24389c] rounded cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}

      {/* Tab 3: Notificaciones */}
      {activeTab === 'notificaciones' && (
        <div className="bg-white border border-[#e1e3e4] rounded-xl p-6 shadow-2xs space-y-6">
          <h3 className="font-bold text-base text-[#191c1d]">Canales de Recordatorio</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-[#191c1d] block">
                  Confirmación y recordatorio por WhatsApp
                </span>
                <span className="text-xs text-[#757684]">
                  Envía recordatorios automáticos 24h antes del turno.
                </span>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="w-5 h-5 accent-[#24389c] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-[#191c1d] block">
                  Notificaciones por Correo Electrónico
                </span>
                <span className="text-xs text-[#757684]">
                  Envía el comprobante digital al cliente y aviso al profesional asignado.
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-5 h-5 accent-[#24389c] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-[#191c1d] block">
                  Alertas por SMS
                </span>
                <span className="text-xs text-[#757684]">
                  Canal de contingencia para citas urgentes.
                </span>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-5 h-5 accent-[#24389c] rounded cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}

      {/* Tab 4: Seguridad & Cuenta */}
      {activeTab === 'cuenta' && (
        <div className="bg-white border border-[#e1e3e4] rounded-xl p-6 shadow-2xs space-y-6">
          <h3 className="font-bold text-base text-[#191c1d]">Credenciales y Seguridad</h3>
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
                Contraseña actual
              </label>
              <input
                type="password"
                defaultValue="••••••••••••"
                className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
                Nueva contraseña
              </label>
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                className="w-full border border-[#e1e3e4] rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-[#f8f9fa] hover:bg-[#edeeef] border border-[#e1e3e4] text-[#191c1d] rounded-lg text-xs font-semibold"
            >
              Actualizar contraseña
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
