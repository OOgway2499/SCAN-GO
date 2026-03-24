import React from 'react';

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export default function Chip({ children, active, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 transition-all font-display ${
        active
          ? 'bg-primary text-white border border-primary'
          : 'bg-transparent text-t2 border border-border-subtle hover:border-border-hi'
      }`}
    >
      {children}
    </button>
  );
}
