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
        className={`${iconSizes[size]} rounded-xl flex items-center justify-center shrink-0 shadow-xs overflow-hidden border border-[#e1e3e4] bg-[#0b132b] transition-transform hover:scale-105`}
      >
        {hasValidCustomLogo ? (
          <img
            src={logoUrl}
            alt={businessName || 'Logo del Negocio'}
            className="w-full h-full object-contain p-1 bg-white"
            onError={() => setImageError(true)}
          />
        ) : (
          <svg viewBox="0 0 100 100" className="w-full h-full p-1" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Cyan background arc */}
            <path d="M15 32C15 22 24 16 42 16H60C56 22 50 26 42 26H36C28 26 26 32 26 42C26 56 36 66 48 66C44 72 38 76 30 76C18 76 15 64 15 50V32Z" fill="#00D2FF" />
            {/* Main squircle */}
            <rect x="25" y="18" width="56" height="56" rx="16" fill="#0B132B" stroke="#FFFFFF" strokeWidth="2.5" />
            {/* Calendar dots */}
            <circle cx="41" cy="34" r="2.8" fill="#00D2FF" />
            <circle cx="53" cy="34" r="2.8" fill="#00D2FF" />
            <circle cx="65" cy="34" r="2.8" fill="#00D2FF" />
            <circle cx="41" cy="45" r="2.8" fill="#00D2FF" />
            <circle cx="53" cy="45" r="2.8" fill="#00D2FF" />
            <circle cx="65" cy="45" r="2.8" fill="#00D2FF" />
            {/* Checkmark circle badge */}
            <circle cx="62" cy="59" r="8" fill="#00D2FF" />
            <path d="M59 59L61 61L65 57" stroke="#0B132B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Brand & Business Name */}
      {showText && (
        <div className="flex flex-col min-w-0 max-w-[170px]">
          <span
            className={`font-extrabold tracking-tight text-[#191c1d] ${textSizes[size]} font-sans truncate leading-tight`}
            title={businessName || 'TURNIA'}
          >
            {businessName || 'TURNIA'}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#24389c] truncate">
            {category || 'Gestión & Agenda'}
          </span>
        </div>
      )}
    </div>
  );
};
