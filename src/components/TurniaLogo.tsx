import React, { useState } from 'react';

interface TurniaLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  logoUrl?: string;
  businessName?: string;
  category?: string;
}

export const TurniaLogo: React.FC<TurniaLogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
  logoUrl,
  businessName,
  category,
}) => {
  const [imageError, setImageError] = useState(false);

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  const hasValidCustomLogo = Boolean(logoUrl && logoUrl.trim() && !imageError);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon Container */}
      <div
        className={`${iconSizes[size]} rounded-xl flex items-center justify-center shrink-0 shadow-xs overflow-hidden border border-[#e1e3e4] bg-white transition-transform hover:scale-105`}
      >
        {hasValidCustomLogo ? (
          <img
            src={logoUrl}
            alt={businessName || 'Logo del Negocio'}
            className="w-full h-full object-contain p-1"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#24389c] to-[#4c56af] flex items-center justify-center text-white font-bold">
            <svg
              viewBox="0 0 24 24"
              className="w-5/6 h-5/6 stroke-current fill-none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        )}
      </div>

      {/* Brand & Business Name */}
      {showText && (
        <div className="flex flex-col min-w-0 max-w-[170px]">
          <span
            className={`font-bold tracking-tight text-[#191c1d] ${textSizes[size]} font-sans truncate leading-tight`}
            title={businessName || 'TURNIA'}
          >
            {businessName || 'TURNIA'}
          </span>
          <span className="text-[11px] font-semibold text-[#24389c] truncate tracking-wide">
            {category || 'SaaS Reservas'}
          </span>
        </div>
      )}
    </div>
  );
};
