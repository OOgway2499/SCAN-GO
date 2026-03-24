import React from 'react';

interface TagProps {
  children: React.ReactNode;
  color?: 'violet' | 'amber' | 'green' | 'red';
}

const colorStyles = {
  violet: 'bg-primary/20 text-primary border-primary/30',
  amber: 'bg-warning/20 text-warning border-warning/30',
  green: 'bg-success/20 text-success border-success/30',
  red: 'bg-danger/20 text-danger border-danger/30',
};

export default function Tag({ children, color = 'violet' }: TagProps) {
  return (
    <span
      className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold tracking-wide border ${colorStyles[color]} inline-flex items-center gap-1`}
    >
      {children}
    </span>
  );
}
