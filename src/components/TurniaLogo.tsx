import React, { useState } from 'react';
import { TURNIA_LOGO_URL } from '../data/mockData';

interface TurniaLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TurniaLogo: React.FC<TurniaLogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
}) => {
  const [imageError, setImageError] = useState(false);

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-[22px]',
    lg: 'text-[28px]',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {!imageError ? (
        <img
          src={TURNIA_LOGO_URL}
          alt="TURNIA Logo"
          className={`${iconSizes[size]} object-contain rounded-md shrink-0`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className={`${iconSizes[size]} rounded-full border-2 border-[#24389c] bg-white flex items-center justify-center shrink-0 shadow-xs`}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4/6 h-4/6 text-[#24389c] stroke-current fill-none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-bold tracking-tight text-[#24389c] ${textSizes[size]} font-sans leading-none`}
          >
            TURNIA
          </span>
          <span className="text-[10px] uppercase font-semibold text-[#454652] tracking-wider mt-0.5">
            SaaS Platform
          </span>
        </div>
      )}
    </div>
  );
};
