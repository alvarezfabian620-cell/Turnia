import React from 'react';

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
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-tr from-[#24389c] to-[#4c56af] flex items-center justify-center shrink-0 shadow-xs text-white`}
      >
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

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-bold tracking-tight text-[#24389c] ${textSizes[size]} font-sans leading-none`}
          >
            TURNIA
          </span>
          <span className="text-[10px] uppercase font-semibold text-[#757684] tracking-wider mt-0.5">
            SaaS Platform
          </span>
        </div>
      )}
    </div>
  );
};
