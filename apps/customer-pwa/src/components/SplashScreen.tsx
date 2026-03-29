import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  minDisplayMs?: number;
}

export default function SplashScreen({ onComplete, minDisplayMs = 2400 }: SplashScreenProps) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    // Phase 1: Logo entrance animation (600ms)
    const enterTimer = setTimeout(() => setPhase('hold'), 600);

    // Phase 2: Hold the branding (then exit)
    const holdTimer = setTimeout(() => setPhase('exit'), minDisplayMs - 500);

    // Phase 3: Fade out and call onComplete
    const exitTimer = setTimeout(onComplete, minDisplayMs);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete, minDisplayMs]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0D0D0F] transition-opacity duration-500 ${
        phase === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-0"
          style={{
            background: 'radial-gradient(circle, rgba(123,97,255,0.35) 0%, rgba(123,97,255,0.08) 40%, transparent 70%)',
            animation: phase !== 'enter' ? 'none' : undefined,
            ...(phase !== 'enter' ? { opacity: 1 } : {}),
            transition: 'opacity 0.8s ease-out',
          }}
        />
        <div
          className="absolute top-[30%] left-[20%] w-[200px] h-[200px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 60%)',
            animation: 'pulse 3s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-[25%] right-[15%] w-[160px] h-[160px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(244,114,182,0.10) 0%, transparent 60%)',
            animation: 'pulse 3.5s ease-in-out infinite 0.5s',
          }}
        />
      </div>

      {/* Logo Container */}
      <div
        className="relative z-10 flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          transform: phase === 'enter' ? 'scale(0.7) translateY(20px)' : 'scale(1) translateY(0)',
          opacity: phase === 'enter' ? 0 : 1,
        }}
      >
        {/* Icon */}
        <div
          className="w-[80px] h-[80px] rounded-[22px] bg-gradient-to-br from-[#7B61FF] to-[#5B41DF] flex items-center justify-center text-[40px] mb-5 relative"
          style={{
            boxShadow: '0 0 60px rgba(123,97,255,0.5), 0 20px 40px rgba(0,0,0,0.3)',
          }}
        >
          <span
            style={{
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
            }}
          >
            🛒
          </span>
          {/* Shine sweep */}
          <div
            className="absolute inset-0 rounded-[22px] overflow-hidden"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.05) 50%, transparent 55%)',
              animation: 'shine 2s ease-in-out infinite 1s',
            }}
          />
        </div>

        {/* Brand Name */}
        <div className="flex items-baseline gap-0">
          <span
            className="text-white font-extrabold text-[36px] tracking-[-0.04em] leading-none"
            style={{
              textShadow: '0 2px 20px rgba(123,97,255,0.3)',
            }}
          >
            Scan
          </span>
          <span
            className="font-extrabold text-[36px] tracking-[-0.04em] leading-none"
            style={{
              background: 'linear-gradient(135deg, #7B61FF, #A78BFA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
            }}
          >
            Go
          </span>
          <span
            className="text-[#7B61FF] text-[36px] font-extrabold leading-none ml-[1px]"
            style={{
              animation: 'blink 1.5s ease-in-out infinite',
            }}
          >
            .
          </span>
        </div>

        {/* Tagline */}
        <div
          className="text-[#808080] text-[13px] font-medium tracking-[0.2em] uppercase mt-3 transition-all duration-700 delay-300"
          style={{
            opacity: phase === 'enter' ? 0 : 0.7,
            transform: phase === 'enter' ? 'translateY(8px)' : 'translateY(0)',
          }}
        >
          Scan • Pay • Go
        </div>
      </div>

      {/* Loading indicator */}
      <div
        className="absolute bottom-[15%] flex flex-col items-center gap-4 transition-all duration-500 delay-500"
        style={{
          opacity: phase === 'enter' ? 0 : (phase === 'exit' ? 0 : 1),
        }}
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-[6px] h-[6px] rounded-full bg-[#7B61FF]"
              style={{
                animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes shine {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(200%); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
