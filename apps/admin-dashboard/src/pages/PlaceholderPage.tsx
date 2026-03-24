import React from 'react';

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center animate-fade-in relative z-10">
      <div className="text-[60px] mb-6 opacity-40">🚧</div>
      <h1 className="text-[32px] font-extrabold text-t1 tracking-tight mb-2">{title}</h1>
      <p className="text-t2 text-[15px] max-w-md">
        This section is currently under construction and will be available in the next release according to the implementation plan.
      </p>
    </div>
  );
}
