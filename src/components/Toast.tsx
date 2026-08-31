import React from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
          type === 'success'
            ? 'bg-white border-emerald-200 text-emerald-900'
            : type === 'error'
            ? 'bg-white border-red-200 text-red-900'
            : 'bg-white border-[#bac3ff] text-[#24389c]'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[20px] ${
            type === 'success'
              ? 'text-emerald-600'
              : type === 'error'
              ? 'text-red-600'
              : 'text-[#24389c]'
          }`}
        >
          {type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
        </span>
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-[#757684] hover:text-[#191c1d] p-0.5 rounded-md"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
};
