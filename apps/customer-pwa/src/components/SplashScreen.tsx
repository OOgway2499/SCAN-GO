import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  minDisplayMs?: number;
}

export default function SplashScreen({ onComplete, minDisplayMs = 3800 }: SplashScreenProps) {
  const [phase, setPhase] = useState(0); // 0=enter, 1=scan, 2=checkout, 3=logo, 4=exit

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),     // Character appears
      setTimeout(() => setPhase(2), 1400),     // Scan happens
      setTimeout(() => setPhase(3), 2400),     // Checkout + logo
      setTimeout(() => setPhase(4), minDisplayMs - 400), // Start fade
      setTimeout(onComplete, minDisplayMs),     // Done
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete, minDisplayMs]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#0A0A0F] overflow-hidden transition-opacity duration-400 ${
        phase >= 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Starfield background */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] bg-white/30 rounded-full"
            style={{
              left: `${5 + (i * 47) % 90}%`,
              top: `${3 + (i * 31) % 90}%`,
              animation: `twinkle ${1.5 + (i % 3) * 0.5}s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Ambient purple floor glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[40%]"
        style={{
          background: 'linear-gradient(to top, rgba(123,97,255,0.08) 0%, transparent 100%)',
        }}
      />

      {/* ═══ SCENE: THE STORE ═══ */}
      <div className="absolute inset-0 flex items-end justify-center pb-[28%]">

        {/* Floor line */}
        <div
          className="absolute bottom-[27%] left-[10%] right-[10%] h-[1px] transition-all duration-700"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(123,97,255,0.3), transparent)',
            opacity: phase >= 1 ? 1 : 0,
          }}
        />

        {/* ─── Shelf with products ─── */}
        <div
          className="absolute bottom-[28%] right-[18%] transition-all duration-700 ease-out"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateX(0)' : 'translateX(30px)',
          }}
        >
          {/* Shelf structure */}
          <div className="relative">
            <div className="w-[60px] h-[2px] bg-[#333] rounded-full" />
            <div className="w-[60px] h-[2px] bg-[#333] rounded-full mt-[18px]" />
            {/* Products on shelf */}
            <div className="absolute bottom-[10px] left-[6px] flex gap-[5px]">
              <div className="w-[10px] h-[14px] rounded-[2px] bg-gradient-to-b from-[#FF6B6B] to-[#ee5a5a]" />
              <div className="w-[10px] h-[14px] rounded-[2px] bg-gradient-to-b from-[#4ECDC4] to-[#3dbdb5]" />
              <div className="w-[10px] h-[14px] rounded-[2px] bg-gradient-to-b from-[#FFE66D] to-[#efd55c]" />
              <div className="w-[8px] h-[12px] rounded-[2px] bg-gradient-to-b from-[#A78BFA] to-[#967ae9]" />
            </div>
            {/* Products on top shelf */}
            <div className="absolute top-[-16px] left-[4px] flex gap-[6px]">
              <div className="w-[12px] h-[14px] rounded-[2px] bg-gradient-to-b from-[#6366F1] to-[#5254e0]" />
              <div className="w-[10px] h-[12px] rounded-[2px] bg-gradient-to-b from-[#F472B6] to-[#e361a5]" />
              <div className="w-[12px] h-[14px] rounded-[2px] bg-gradient-to-b from-[#34D399] to-[#23c288]" />
            </div>
          </div>
        </div>

        {/* ─── Character ─── */}
        <div
          className="absolute bottom-[28%] transition-all ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            left: phase === 0 ? '-10%' : phase >= 2 ? '55%' : '38%',
            opacity: phase === 0 ? 0 : 1,
            transitionDuration: phase === 0 ? '0ms' : '800ms',
          }}
        >
          <svg width="50" height="70" viewBox="0 0 50 70" fill="none">
            {/* Head */}
            <circle cx="25" cy="10" r="8" fill="#E8D5C4" />
            {/* Hair */}
            <path d="M17 8 Q18 2, 25 3 Q32 2, 33 8 Q34 5, 30 4 Q26 1, 20 4 Q16 5, 17 8Z" fill="#2D2D3F" />
            {/* Eyes */}
            <ellipse cx="22" cy="10" rx="1.5" ry="2" fill="#2D2D3F" />
            <ellipse cx="28" cy="10" rx="1.5" ry="2" fill="#2D2D3F" />
            {/* Eye shine */}
            <circle cx="22.5" cy="9.5" r="0.5" fill="white" />
            <circle cx="28.5" cy="9.5" r="0.5" fill="white" />
            {/* Smile */}
            <path d="M22 13 Q25 15, 28 13" stroke="#C4A882" strokeWidth="0.8" fill="none" strokeLinecap="round" />
            {/* Body / T-shirt */}
            <path d="M15 20 Q15 18, 25 18 Q35 18, 35 20 L37 38 Q37 40, 25 40 Q13 40, 13 38 Z" fill="#7B61FF" />
            {/* T-shirt collar */}
            <path d="M21 18 Q25 21, 29 18" stroke="#6951EE" strokeWidth="1" fill="none" />
            {/* Arms */}
            <line x1="14" y1="22" x2="8" y2="32" stroke="#E8D5C4" strokeWidth="3.5" strokeLinecap="round" />
            {/* Right arm holding phone - animates during scan */}
            <line
              x1="36"
              y1="22"
              x2={phase >= 1 && phase < 3 ? "44" : "42"}
              y2={phase >= 1 && phase < 3 ? "26" : "32"}
              stroke="#E8D5C4"
              strokeWidth="3.5"
              strokeLinecap="round"
              style={{ transition: 'all 0.5s ease-out' }}
            />
            {/* Phone in hand */}
            <rect
              x={phase >= 1 && phase < 3 ? "42" : "40"}
              y={phase >= 1 && phase < 3 ? "22" : "30"}
              width="7"
              height="12"
              rx="1.5"
              fill="#1a1a2e"
              stroke="#333"
              strokeWidth="0.5"
              style={{ transition: 'all 0.5s ease-out' }}
            />
            {/* Phone screen glow */}
            <rect
              x={phase >= 1 && phase < 3 ? "43" : "41"}
              y={phase >= 1 && phase < 3 ? "23.5" : "31.5"}
              width="5"
              height="9"
              rx="0.5"
              fill={phase >= 2 ? "#34D399" : "#7B61FF"}
              opacity="0.6"
              style={{ transition: 'all 0.3s' }}
            />
            {/* Legs / Jeans */}
            <rect x="17" y="40" width="5" height="22" rx="2" fill="#394867" />
            <rect x="27" y="40" width="5" height="22" rx="2" fill="#394867" />
            {/* Shoes */}
            <ellipse cx="19" cy="63" rx="5" ry="2.5" fill="#2D2D3F" />
            <ellipse cx="30" cy="63" rx="5" ry="2.5" fill="#2D2D3F" />
          </svg>
        </div>

        {/* ─── Scan laser beam ─── */}
        {phase >= 1 && phase < 3 && (
          <div
            className="absolute bottom-[44%] right-[22%] w-[40px] h-[2px]"
            style={{
              background: 'linear-gradient(90deg, rgba(123,97,255,0.8), rgba(168,85,247,0.4), transparent)',
              boxShadow: '0 0 8px rgba(123,97,255,0.6), 0 0 20px rgba(123,97,255,0.3)',
              animation: 'scanLine 0.8s ease-in-out infinite',
              transformOrigin: 'left center',
            }}
          />
        )}

        {/* ─── Scan sparkle particles ─── */}
        {phase === 2 && (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={`spark-${i}`}
                className="absolute rounded-full"
                style={{
                  width: i % 2 === 0 ? '3px' : '4px',
                  height: i % 2 === 0 ? '3px' : '4px',
                  background: i % 2 === 0 ? '#7B61FF' : '#34D399',
                  bottom: `${38 + i * 4}%`,
                  right: `${20 + i * 3}%`,
                  animation: `sparkFloat 0.8s ease-out ${i * 0.1}s forwards`,
                  boxShadow: `0 0 6px ${i % 2 === 0 ? 'rgba(123,97,255,0.8)' : 'rgba(52,211,153,0.8)'}`,
                }}
              />
            ))}
          </>
        )}

        {/* ─── Checkout success checkmark ─── */}
        {phase >= 2 && (
          <div
            className="absolute bottom-[52%] left-1/2 -translate-x-1/2 transition-all duration-500"
            style={{
              opacity: phase >= 2 ? 1 : 0,
              transform: `translateX(-50%) scale(${phase >= 2 ? 1 : 0.5})`,
            }}
          >
            <div
              className="w-[32px] h-[32px] rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #34D399, #059669)',
                boxShadow: '0 0 20px rgba(52,211,153,0.5), 0 0 40px rgba(52,211,153,0.2)',
                animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L6.5 11.5L13 4.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* ═══ LOGO REVEAL ═══ */}
      <div
        className="absolute top-[12%] left-0 right-0 flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.9)',
        }}
      >
        <div className="flex items-baseline">
          <span
            className="text-white font-extrabold text-[42px] tracking-[-0.04em] leading-none"
            style={{ textShadow: '0 2px 30px rgba(123,97,255,0.4)' }}
          >
            Scan
          </span>
          <span
            className="font-extrabold text-[42px] tracking-[-0.04em] leading-none"
            style={{
              background: 'linear-gradient(135deg, #7B61FF, #A78BFA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Go
          </span>
          <span className="text-[#7B61FF] text-[42px] font-extrabold leading-none ml-[1px]">.</span>
        </div>
        <div
          className="text-[#808080] text-[12px] font-medium tracking-[0.25em] uppercase mt-3 transition-all duration-500 delay-200"
          style={{
            opacity: phase >= 3 ? 0.6 : 0,
          }}
        >
          Scan • Pay • Go
        </div>
      </div>

      {/* ═══ Bottom caption ═══ */}
      <div
        className="absolute bottom-[8%] left-0 right-0 text-center transition-all duration-500"
        style={{ opacity: phase >= 1 && phase < 4 ? 0.4 : 0 }}
      >
        <div className="text-[#606060] text-[11px] font-medium tracking-wider">
          {phase < 2 ? '📱 scanning products...' : phase < 3 ? '✅ checkout complete!' : 'ready to shop'}
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes scanLine {
          0%, 100% { transform: scaleX(0.6) translateY(0px); opacity: 0.5; }
          50% { transform: scaleX(1) translateY(-4px); opacity: 1; }
        }
        @keyframes sparkFloat {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(-15px, -30px) scale(0); opacity: 0; }
        }
        @keyframes popIn {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
