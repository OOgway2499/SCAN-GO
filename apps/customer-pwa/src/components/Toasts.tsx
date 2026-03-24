import React from 'react';
import { Toast } from '../stores/uiStore';

interface ToastsProps {
  list: Toast[];
}

export default function Toasts({ list }: ToastsProps) {
  if (list.length === 0) return null;

  return (
    <div className="fixed top-[70px] left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none w-[290px]">
      {list.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-2.5 rounded-lg font-bold text-[13px] shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center gap-2 animate-toast-in ${
            t.type === 'err'
              ? 'bg-danger text-[#111]'
              : t.type === 'warn'
              ? 'bg-warning text-[#111]'
              : 'bg-success text-[#111]'
          }`}
        >
          <span>
            {t.type === 'err' ? '✕' : t.type === 'warn' ? '!' : '✓'}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
