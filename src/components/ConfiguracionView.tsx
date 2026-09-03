import React, { useState, useEffect } from 'react';
import { BusinessConfig } from '../types';

interface ConfiguracionViewProps {
  config: BusinessConfig;
  onSaveConfig: (config: BusinessConfig) => void;
}

export const ConfiguracionView: React.FC<ConfiguracionViewProps> = ({
  config: initialConfig,
  onSaveConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'politicas' | 'notificaciones' | 'cuenta'>(
    'info'
  );
  const [form, setForm] = useState<BusinessConfig>(initialConfig);
  const [isSaved, setIsSaved] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setForm(initialConfig);
      setImageError(false);
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
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen seleccionada supera los 5MB. Por favor elige una imagen más ligera.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newLogoUrl = event.target.result as string;
          const updated = { ...form, logoUrl: newLogoUrl };
          setForm(updated);
          setImageError(false);
          onSaveConfig(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    const updated = { ...form, logoUrl: '' };
    setForm(updated);
    setImageError(false);
    onSaveConfig(updated);
  };

  const hasValidLogo = Boolean(form.logoUrl && form.logoUrl.trim() && !imageError);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-[28px] font-bold text-[#191c1d] tracking-tight">
            Configuración
          </h2>
          <p className="text-[#454652] text-sm md:text-base mt-1">
            Gestiona los datos de tu negocio, identidad de marca, reservas y cuenta.
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
          Información del Negocio
        </button>
        <button
          onClick={() => setActiveTab('politicas')}
          className={`pb-3 relative transition-colors whitespace-nowrap ${
            activeTab === 'politicas'
              ? 'text-[#24389c] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#24389c]'
              : 'text-[#757684] hover:text-[#191c1d]'
          }`}
        >
          Políticas de Reserva
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
            <h3 className="font-bold text-base text-[#191c1d]">Identidad & Datos Principales</h3>

            {/* SECCIÓN DEL LOGO MEJORADA Y PROFESIONAL */}
            <div className="bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl p-5 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Contenedor del Logo con Vista Previa */}
                  <div className="relative group">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-dashed border-[#bac3ff] bg-white flex items-center justify-center overflow-hidden shadow-xs p-1.5 transition-all group-hover:border-[#24389c]">
                      {hasValidLogo ? (
                        <img
                          src={form.logoUrl}
                          alt="Logo del Negocio"
                          className="w-full h-full object-contain rounded-xl"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="w-full h-full rounded-xl bg-gradient-to-tr from-[#24389c] to-[#4c56af] flex flex-col items-center justify-center text-white shadow-2xs">
                          <span className="material-symbols-outlined text-[30px]">storefront</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5 opacity-90">
                            Logo
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Textos y Estado */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-[#191c1d]">
                        Logo del Negocio
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          hasValidLogo
                            ? 'bg-[#dee0ff] text-[#24389c]'
                            : 'bg-[#e1e3e4] text-[#757684]'
                        }`}
                      >
                        {hasValidLogo ? 'Personalizado' : 'Predeterminado'}
                      </span>
                    </div>
                    <p className="text-xs text-[#454652] max-w-sm">
                      Este logo se mostrará en el menú lateral, encabezados, comprobantes y en la página pública de reservas.
                    </p>
                    <p className="text-[11px] text-[#757684]">
                      Formatos: PNG, JPG, SVG, WebP (Recomendado: fondo transparente).
                    </p>
                  </div>
                </div>

                {/* Botones de Acción para el Logo */}
                <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                  <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#24389c] hover:bg-[#1d2d7c] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors">
                    <span className="material-symbols-outlined text-[16px]">upload</span>
                    <span>Subir imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>

                  {hasValidLogo && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/40 border border-[#ffdad6] rounded-lg text-xs font-medium transition-colors"
                      title="Restablecer logo por defecto"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      <span>Quitar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
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

      {/* Tab 2: Políticas */}
      {activeTab === 'politicas' && (
        <div className="bg-white border border-[#e1e3e4] rounded-xl p-6 shadow-2xs space-y-6">
          <h3 className="font-bold text-base text-[#191c1d]">Reglas y Políticas de Citas</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#757684] mb-1.5 tracking-wider">
                Tiempo mínimo de cancelación
              </label>
              <select
                value={cancellationHours}
                onChange={(e) => setCancellationHours(e.target.value)}
                className="w-full max-w-xs border border-[#e1e3e4] rounded-lg px-3.5 py-2 text-sm bg-white focus:border-[#24389c] outline-none"
              >
                <option value="2">2 horas antes</option>
                <option value="6">6 horas antes</option>
                <option value="12">12 horas antes</option>
                <option value="24">24 horas antes</option>
                <option value="48">48 horas antes</option>
              </select>
            </div>

            <label className="flex items-center justify-between cursor-pointer pt-4 border-t border-[#f3f4f5]">
              <div>
                <span className="text-sm font-semibold text-[#191c1d] block">
                  Exigir anticipo / seña para reservar
                </span>
                <span className="text-xs text-[#757684]">
                  Solicita un porcentaje del valor del servicio al momento de confirmar el turno.
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
          <h3 className="font-bold text-base text-[#191c1d]">Canales de Notificación</h3>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-[#191c1d] block">
                  Recordatorios automáticos por WhatsApp
                </span>
                <span className="text-xs text-[#757684]">
                  Envía confirmaciones y avisos 2 horas antes de cada cita.
                </span>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="w-5 h-5 accent-[#24389c] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer pt-4 border-t border-[#f3f4f5]">
              <div>
                <span className="text-sm font-semibold text-[#191c1d] block">
                  Notificaciones por Correo Electrónico
                </span>
                <span className="text-xs text-[#757684]">
                  Envía el comprobante digital con botón para añadir al calendario de Google.
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-5 h-5 accent-[#24389c] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer pt-4 border-t border-[#f3f4f5]">
              <div>
                <span className="text-sm font-semibold text-[#191c1d] block">Mensajes SMS</span>
                <span className="text-xs text-[#757684]">
                  Avisos de urgencia si hay reprogramaciones de última hora.
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

      {/* Tab 4: Cuenta */}
      {activeTab === 'cuenta' && (
        <div className="bg-white border border-[#e1e3e4] rounded-xl p-6 shadow-2xs space-y-6">
          <h3 className="font-bold text-base text-[#191c1d]">Cuenta & Facturación SaaS</h3>

          <div className="p-4 bg-[#f8f9fa] border border-[#bac3ff] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#24389c] uppercase tracking-wider">
                Plan Actual
              </span>
              <h4 className="font-bold text-lg text-[#191c1d] mt-0.5">Turnia Pro Business</h4>
              <p className="text-xs text-[#757684]">Reservas ilimitadas · Múltiples profesionales</p>
            </div>
            <span className="px-3 py-1 bg-[#dee0ff] text-[#24389c] font-bold text-xs rounded-full">
              Activo
            </span>
          </div>

          <div className="pt-4 border-t border-[#f3f4f5] flex justify-between items-center">
            <div>
              <span className="text-sm font-semibold text-[#191c1d] block">
                Exportar base de datos
              </span>
              <span className="text-xs text-[#757684]">
                Descarga una copia completa de tus clientes y reservas en CSV.
              </span>
            </div>
            <a
              href="/api/reports/export-csv"
              download
              className="px-4 py-2 border border-[#e1e3e4] hover:bg-[#f3f4f5] text-[#191c1d] rounded-lg text-xs font-semibold transition-colors"
            >
              Exportar CSV
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
