import React from 'react';

interface LegalTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const LegalTermsModal: React.FC<LegalTermsModalProps> = ({
  isOpen,
  onClose,
  title = 'Términos de Servicio & Política de Protección de Datos (Habeas Data / GDPR)',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl animate-in fade-in duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#e1e3e4] shrink-0">
          <div>
            <h3 className="font-bold text-lg text-[#191c1d] tracking-tight">{title}</h3>
            <p className="text-xs text-[#757684] mt-0.5">
              Cumplimiento normativo de Habeas Data (Ley 1581) y estándares internacionales GDPR
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#757684] hover:text-[#191c1d] rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Body with internal scroll */}
        <div className="overflow-y-auto py-5 space-y-5 text-xs text-[#454652] leading-relaxed pr-2">
          <section className="space-y-1.5">
            <h4 className="font-bold text-sm text-[#191c1d]">1. Responsable del Tratamiento</h4>
            <p>
              <strong>Turnia SaaS</strong> y el establecimiento prestador del servicio son los responsables
              del tratamiento de los datos personales recolectados a través de esta plataforma, conforme a los principios de
              legalidad, finalidad, veracidad y seguridad de la información.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-sm text-[#191c1d]">2. Finalidad del Tratamiento de Datos</h4>
            <p>
              Los datos personales recolectados (nombre, teléfono/WhatsApp, correo electrónico, historial de citas) tienen como
              únicas finalidades:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Gestionar, confirmar, reagendar o cancelar citas y reservas solicitadas.</li>
              <li>Enviar notificaciones operativas en tiempo real sobre el estado de sus turnos.</li>
              <li>Generar reportes administrativos y de facturación estrictamente vinculados al servicio.</li>
              <li>Brindar soporte técnico y atención al cliente.</li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-sm text-[#191c1d]">3. Derechos del Titular (Derechos ARCO)</h4>
            <p>
              Como titular de sus datos personales, usted cuenta con los siguientes derechos garantizados por ley:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Conocer y acceder:</strong> Consultar gratuitamente sus datos personales almacenados.</li>
              <li><strong>Actualizar y rectificar:</strong> Modificar datos inexactos, incompletos o desactualizados.</li>
              <li><strong>Supresión (Derecho al olvido):</strong> Solicitar la eliminación total de sus datos cuando no exista un deber legal o contractual que obligue a conservarlos.</li>
              <li><strong>Revocación de autorización:</strong> Revocar el consentimiento otorgado para el tratamiento de su información.</li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-sm text-[#191c1d]">4. Medidas de Seguridad y Cifrado</h4>
            <p>
              Implementamos protocolos de seguridad técnica y administrativa de nivel bancario, incluyendo cifrado en tránsito
              (HTTPS / TLS 1.3), hashes criptográficos con salt (bcrypt) para contraseñas, cortafuegos de aplicaciones (WAF) y
              políticas estrictas de control de acceso por roles.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-sm text-[#191c1d]">5. No Transferencia a Terceros</h4>
            <p>
              Sus datos personales no son vendidos, cedidos ni compartidos con empresas publicitarias ni terceros sin su autorización
              expresa, salvo mandato legal u orden de autoridad competente.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#e1e3e4] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#24389c] hover:bg-[#1d2d7c] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Entendido y Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
