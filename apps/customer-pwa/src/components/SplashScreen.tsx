import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  storeName?: string;
  duration?: number;
}

export default function SplashScreen({ onComplete, duration = 2800 }: SplashScreenProps) {
  const [phase, setPhase] = useState(0);
  // 0=dark, 1=enter, 2=settle, 3=scanCharge, 4=scanFire, 5=logoReveal, 6=loading, 7=exit

  useEffect(() => {
    // Check reduced motion preference
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setPhase(6);
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }

    const timers = [
      setTimeout(() => setPhase(1), 50),            // 0.05s - begin entrance
      setTimeout(() => setPhase(2), 350),            // 0.35s - settle
      setTimeout(() => setPhase(3), 650),            // 0.65s - scan charge
      setTimeout(() => setPhase(4), 900),            // 0.9s  - scan fire!
      setTimeout(() => setPhase(5), 1200),           // 1.2s  - logo reveal
      setTimeout(() => setPhase(6), 1600),           // 1.6s  - loading dots
      setTimeout(() => setPhase(7), duration - 400), // exit fade
      setTimeout(onComplete, duration),              // done
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete, duration]);

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden select-none`}
      style={{
        background: '#0D0D0D',
        opacity: phase >= 7 ? 0 : 1,
        transition: 'opacity 0.4s cubic-bezier(0.22,1,0.36,1)',
        willChange: 'opacity',
      }}
    >
      {/* ═══ LAYER 1: Background Mesh ═══ */}
      <div
        className="absolute inset-0"
        style={{
          opacity: phase >= 1 ? 1 : 0,
          transition: 'opacity 0.6s ease-out',
          willChange: 'opacity',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 70% 50% at 15% 60%, rgba(123,97,255,0.20) 0%, transparent 70%),
              radial-gradient(ellipse 50% 40% at 85% 30%, rgba(45,212,191,0.12) 0%, transparent 65%),
              radial-gradient(ellipse 40% 35% at 55% 80%, rgba(244,114,182,0.08) 0%, transparent 60%)
            `,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* ═══ LAYER 2: Ground Shadow ═══ */}
      <div
        className="absolute left-1/2 bottom-[22%] -translate-x-[60%]"
        style={{
          width: 140,
          height: 24,
          background: 'radial-gradient(ellipse, rgba(123,97,255,0.25) 0%, transparent 70%)',
          opacity: phase >= 2 ? 1 : 0,
          transition: 'opacity 0.4s ease-out',
          filter: 'blur(4px)',
        }}
      />

      {/* ═══ LAYER 3: Floating Product Package ═══ */}
      <div
        className="absolute"
        style={{
          right: '18%',
          top: '32%',
          opacity: phase >= 2 ? 1 : 0,
          transition: 'opacity 0.5s ease-out',
          animation: phase >= 2 ? 'productFloat 2s ease-in-out infinite' : 'none',
          willChange: 'transform',
        }}
      >
        <svg width="52" height="68" viewBox="0 0 52 68" fill="none">
          {/* Box body */}
          <rect x="4" y="8" width="44" height="52" rx="4" fill="#1E1E2E" stroke="#333" strokeWidth="1.5" />
          {/* Box top flap */}
          <path d="M4 16 L26 8 L48 16" stroke="#444" strokeWidth="1" fill="none" />
          {/* Barcode area */}
          <rect x="12" y="28" width="28" height="20" rx="2" fill="#14141F" />
          {/* Barcode lines */}
          {[0,4,7,10,12,16,18,21,24].map((x, i) => (
            <rect key={i} x={14 + x} y="30" width={i % 3 === 0 ? 2 : 1} height="14" fill="#555" rx="0.5" />
          ))}
          {/* Product label */}
          <rect x="14" y="46" width="16" height="1.5" rx="0.75" fill="#555" />
          {/* Brand color stripe */}
          <rect x="4" y="8" width="44" height="6" rx="3" fill="rgba(123,97,255,0.3)" />
          {/* Scan flash overlay */}
          <rect
            x="4"
            y="8"
            width="44"
            height="52"
            rx="4"
            fill="white"
            style={{
              opacity: phase === 4 ? 0.25 : 0,
              transition: 'opacity 0.2s',
            }}
          />
        </svg>
      </div>

      {/* ═══ LAYER 4: Scan Laser Beam ═══ */}
      {phase >= 4 && (
        <div
          className="absolute"
          style={{
            left: '42%',
            top: '39%',
            width: '22%',
            height: 2,
            transformOrigin: 'left center',
            animation: 'laserExtend 0.25s ease-out forwards',
            willChange: 'transform',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #7B61FF 0%, rgba(123,97,255,0.5) 60%, transparent 100%)',
              boxShadow: '0 0 8px rgba(123,97,255,0.6), 0 0 20px rgba(123,97,255,0.3)',
              borderRadius: 2,
              animation: phase >= 6 ? 'laserPulse 1.8s ease-in-out infinite' : 'none',
            }}
          />
        </div>
      )}

      {/* ═══ LAYER 4b: Scan Particles ═══ */}
      {phase >= 4 && (
        <div className="absolute" style={{ right: '20%', top: '36%' }}>
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * 360;
            const color = i % 2 === 0 ? '#7B61FF' : '#2DD4BF';
            return (
              <div
                key={`p${i}`}
                className="absolute"
                style={{
                  width: 4,
                  height: 4,
                  background: color,
                  borderRadius: 1,
                  transform: 'rotate(45deg)',
                  boxShadow: `0 0 6px ${color}`,
                  animation: `particleBurst 0.6s ease-out ${i * 0.04}s forwards`,
                  willChange: 'transform, opacity',
                  ['--angle' as any]: `${angle}deg`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* ═══ LAYER 5: Kira — The ScanGo Mascot ═══ */}
      <div
        className="absolute left-1/2 bottom-[22%]"
        style={{
          transform: `translateX(-60%) translateY(${phase >= 1 ? '0px' : '40px'}) scale(${phase >= 7 ? 0.95 : 1})`,
          opacity: phase >= 1 ? 1 : 0,
          transition: phase === 1
            ? 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease-out'
            : 'transform 0.4s ease-out, opacity 0.4s ease-out',
          willChange: 'transform, opacity',
        }}
      >
        <svg width="160" height="220" viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* ── Hair (back layer) ── */}
          <path d="M72 42 Q68 30,78 20 Q88 10,100 8 Q112 10,122 20 Q132 30,128 42 L130 65 Q130 72,126 75 L128 100 Q128 105,118 105 L82 105 Q72 105,72 100 L74 75 Q70 72,70 65 Z"
            fill="#1A1A2E" />

          {/* ── Head / Face ── */}
          <ellipse cx="100" cy="58" rx="28" ry="32" fill="#F5DEB3" />
          {/* Face shadow (cel-shade, left side) */}
          <path d="M72 58 Q72 28,100 26 Q100 26,100 90 Q72 88,72 58Z" fill="rgba(0,0,0,0.06)" />

          {/* ── Hair (front bangs) ── */}
          <path d="M73 45 Q75 32,82 25 Q88 20,95 22 L88 48 Q82 50,76 48 Z" fill="#1A1A2E" />
          <path d="M127 45 Q125 32,118 25 Q112 20,108 22 L112 46 Q118 48,124 46 Z" fill="#1A1A2E" />
          {/* Center strand */}
          <path d="M95 22 Q98 18,102 20 Q100 14,96 16 L98 30 L92 38 Q93 30,95 22Z" fill="#12122A" />
          {/* Side hair wisps */}
          <path d="M70 55 Q66 60,68 72 Q69 68,72 64Z" fill="#1A1A2E" />
          <path d="M130 55 Q134 60,132 72 Q131 68,128 64Z" fill="#1A1A2E" />

          {/* ── Eyes ── */}
          {/* Left eye */}
          <ellipse cx="88" cy="56" rx="6" ry="7" fill="white" />
          <ellipse cx="89" cy="57" rx="4.5" ry="5.5" fill="#5B41DF" />
          <ellipse cx="89" cy="57" rx="3" ry="3.5" fill="#3B21BF" />
          <circle cx="87" cy="54" r="2" fill="white" opacity="0.9" />
          <circle cx="91" cy="59" r="1" fill="white" opacity="0.5" />
          {/* Left eyelid line */}
          <path d="M82 50 Q88 48,94 50" stroke="#1A1A2E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Left eyelashes */}
          <path d="M82 50 L80 48" stroke="#1A1A2E" strokeWidth="1" strokeLinecap="round" />

          {/* Right eye */}
          <ellipse cx="112" cy="56" rx="6" ry="7" fill="white" />
          <ellipse cx="113" cy="57" rx="4.5" ry="5.5" fill="#5B41DF" />
          <ellipse cx="113" cy="57" rx="3" ry="3.5" fill="#3B21BF" />
          <circle cx="111" cy="54" r="2" fill="white" opacity="0.9" />
          <circle cx="115" cy="59" r="1" fill="white" opacity="0.5" />
          {/* Right eyelid line */}
          <path d="M106 50 Q112 48,118 50" stroke="#1A1A2E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Right eyelashes */}
          <path d="M118 50 L120 48" stroke="#1A1A2E" strokeWidth="1" strokeLinecap="round" />

          {/* ── Eyebrows ── */}
          <path d="M82 44 Q88 40,95 43" stroke="#1A1A2E" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M105 43 Q112 40,118 44" stroke="#1A1A2E" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* ── Nose ── */}
          <path d="M99 64 Q100 66,102 65" stroke="#D4B896" strokeWidth="1" fill="none" strokeLinecap="round" />

          {/* ── Mouth (confident small smile) ── */}
          <path d="M93 72 Q100 76,107 72" stroke="#C4956A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M95 72 Q100 74,105 72" fill="rgba(196,149,106,0.15)" />

          {/* ── Ear + Earbud ── */}
          <ellipse cx="72" cy="60" rx="4" ry="6" fill="#F0D5A8" />
          <circle cx="72" cy="60" r="3" fill="#2D2D4F" />
          <circle cx="72" cy="60" r="1.5" fill="#444" />

          {/* ── Neck ── */}
          <rect x="92" y="86" width="16" height="12" rx="2" fill="#F0D5A8" />

          {/* ── Body: White shirt ── */}
          <path d="M72 98 Q72 94,80 93 L120 93 Q128 94,128 98 L132 175 Q132 180,100 180 Q68 180,68 175 Z"
            fill="#EEEEF2" />
          {/* Shirt shadow */}
          <path d="M72 98 Q72 94,80 93 L100 93 L96 180 Q68 180,68 175Z" fill="rgba(0,0,0,0.04)" />
          {/* Collar */}
          <path d="M88 93 L100 105 L112 93" stroke="#DDD" strokeWidth="1.5" fill="rgba(238,238,242,0.5)" />

          {/* ── Apron ── */}
          <path d="M78 110 L122 110 L126 175 Q126 178,100 178 Q74 178,74 175 Z"
            fill="#1B2340" />
          {/* Apron shadow (left cel-shade) */}
          <path d="M78 110 L100 110 L96 178 Q74 178,74 175Z" fill="rgba(0,0,0,0.08)" />
          {/* Apron strap left */}
          <path d="M82 93 L78 110" stroke="#1B2340" strokeWidth="4" strokeLinecap="round" />
          {/* Apron strap right */}
          <path d="M118 93 L122 110" stroke="#1B2340" strokeWidth="4" strokeLinecap="round" />
          {/* Apron pocket */}
          <rect x="86" y="118" width="28" height="18" rx="3" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
          {/* ScanGo badge */}
          <rect x="90" y="121" width="20" height="8" rx="2" fill="#7B61FF" opacity="0.7" />
          <text x="94" y="128" fill="white" fontSize="5" fontWeight="700" fontFamily="sans-serif">SG</text>
          {/* Apron seam line */}
          <line x1="100" y1="110" x2="100" y2="175" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

          {/* ── Left Arm (open palm, relaxed) ── */}
          <path d="M72 98 L58 108 Q50 114,48 128 L50 140 Q52 145,56 142" stroke="#F0D5A8" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* Left hand (open palm) */}
          <circle cx="56" cy="140" r="6" fill="#F5DEB3" />
          <path d="M52 136 L50 132" stroke="#F5DEB3" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M56 134 L55 130" stroke="#F5DEB3" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M60 136 L62 132" stroke="#F5DEB3" strokeWidth="2.5" strokeLinecap="round" />
          {/* Wristband */}
          <rect x="48" y="132" width="14" height="4" rx="2" fill="#2DD4BF" opacity="0.6" />

          {/* ── Right Arm (holding scanner) ── */}
          <path d="M128 98 L142 108 Q148 112,152 120 L154 130"
            stroke="#F0D5A8" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* Right hand grip */}
          <circle cx="154" cy="130" r="5" fill="#F5DEB3" />

          {/* ── Scanner Gun ── */}
          <g
            style={{
              transform: phase >= 3 ? 'translate(0,0) scale(1.03)' : 'translate(0,0) scale(1)',
              transformOrigin: '154px 130px',
              transition: 'transform 0.2s ease-out',
            }}
          >
            {/* Scanner body */}
            <rect x="155" y="122" width="32" height="14" rx="4" fill="#2D2D4F" stroke="#7B61FF" strokeWidth="1.5" />
            {/* Scanner grip */}
            <rect x="158" y="134" width="8" height="16" rx="3" fill="#2D2D4F" />
            {/* Scanner tip (glow) */}
            <circle
              cx="187"
              cy="129"
              r={phase >= 3 ? 4 : 2.5}
              fill="#7B61FF"
              style={{
                filter: phase >= 3 ? 'drop-shadow(0 0 6px rgba(123,97,255,0.8))' : 'none',
                transition: 'r 0.2s, filter 0.2s',
              }}
            />
            {/* Scanner detail lines */}
            <line x1="162" y1="126" x2="180" y2="126" stroke="#444" strokeWidth="0.8" />
            <line x1="162" y1="129" x2="174" y2="129" stroke="#444" strokeWidth="0.8" />
            <line x1="162" y1="132" x2="178" y2="132" stroke="#444" strokeWidth="0.8" />
            {/* Trigger glow */}
            <circle cx="162" cy="138" r="2" fill="#FBBF24" opacity={phase >= 3 ? 0.7 : 0.2} style={{ transition: 'opacity 0.3s' }} />
            {/* Neon edge */}
            <rect x="155" y="122" width="32" height="14" rx="4" fill="none" stroke="#7B61FF" strokeWidth="0.5" opacity="0.4" />
          </g>

          {/* ── Legs ── */}
          {/* Left leg */}
          <path d="M86 175 L84 240 Q84 246,88 246 L96 246 Q100 246,98 240 L94 175" fill="#1E293B" />
          {/* Right leg (slightly forward) */}
          <path d="M106 175 L108 238 Q108 244,112 244 L120 244 Q124 244,122 238 L118 175" fill="#1E293B" />
          {/* Left leg shadow */}
          <path d="M86 175 L84 240 Q84 246,88 246 L92 246 L90 175Z" fill="rgba(0,0,0,0.08)" />

          {/* ── Shoes ── */}
          <ellipse cx="92" cy="248" rx="12" ry="5" fill="white" />
          <ellipse cx="92" cy="247" rx="11" ry="4" fill="#F8F8F8" />
          <path d="M81 248 Q81 245,85 244 L99 244 Q103 245,103 248" fill="white" />
          <ellipse cx="116" cy="246" rx="12" ry="5" fill="white" />
          <ellipse cx="116" cy="245" rx="11" ry="4" fill="#F8F8F8" />
          <path d="M105 246 Q105 243,109 242 L123 242 Q127 243,127 246" fill="white" />
          {/* Shoe accents */}
          <circle cx="92" cy="247" r="1.5" fill="#7B61FF" opacity="0.4" />
          <circle cx="116" cy="245" r="1.5" fill="#7B61FF" opacity="0.4" />
        </svg>
      </div>

      {/* ═══ LAYER 6: Speed Lines ═══ */}
      {(phase === 3 || phase === 4) && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(7)].map((_, i) => (
            <div
              key={`sl${i}`}
              className="absolute bg-white"
              style={{
                width: 40 + (i % 3) * 20,
                height: i % 2 === 0 ? 1 : 0.5,
                opacity: 0,
                right: `${15 + i * 4}%`,
                top: `${28 + i * 5}%`,
                transform: `rotate(${-15 + i * 5}deg)`,
                animation: `speedLine 0.3s ease-out ${i * 0.04}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      {/* ═══ LAYER 7: Logo + UI Overlay ═══ */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center" style={{ bottom: '10%' }}>
        {/* Logo */}
        <div
          style={{
            opacity: phase >= 5 ? 1 : 0,
            transform: phase >= 5 ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
            willChange: 'transform, opacity',
          }}
        >
          <div className="flex items-baseline justify-center">
            <span style={{ color: '#7B61FF', fontWeight: 800, fontSize: 42, fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.04em' }}>S</span>
            <span style={{ color: '#F0F0F0', fontWeight: 800, fontSize: 42, fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.04em' }}>can</span>
            <span style={{ color: '#F0F0F0', fontWeight: 800, fontSize: 42, fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.04em' }}>Go</span>
            <span style={{ color: '#7B61FF', fontWeight: 800, fontSize: 42, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>.</span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            color: '#A0A0A0',
            fontSize: 13,
            letterSpacing: 3,
            fontWeight: 500,
            marginTop: 8,
            textTransform: 'uppercase',
            opacity: phase >= 5 ? 0.6 : 0,
            transform: phase >= 5 ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1) 0.1s',
          }}
        >
          Scan. Pay. Walk out.
        </div>

        {/* Progress bar */}
        {phase >= 6 && (
          <div
            style={{
              width: 120,
              height: 2,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 2,
              marginTop: 24,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: 2,
                background: 'linear-gradient(90deg, #7B61FF, #2DD4BF)',
                animation: `progressFill ${(duration - 1600) / 1000}s linear forwards`,
              }}
            />
          </div>
        )}

        {/* Loading dots */}
        {phase >= 6 && (
          <div className="flex gap-3 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#7B61FF',
                  animation: `dotWave 1s ease-in-out ${i * 0.15}s infinite`,
                  willChange: 'transform',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ═══ KEYFRAME ANIMATIONS ═══ */}
      <style>{`
        @keyframes productFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes laserExtend {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }
        @keyframes laserPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes particleBurst {
          0% {
            transform: rotate(45deg) translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: rotate(45deg) translate(
              calc(cos(var(--angle)) * 30px),
              calc(sin(var(--angle)) * 30px)
            ) scale(0);
            opacity: 0;
          }
        }
        @keyframes speedLine {
          0% { opacity: 0; transform: translateX(0) rotate(inherit); }
          30% { opacity: 0.15; }
          100% { opacity: 0; transform: translateX(-20px) rotate(inherit); }
        }
        @keyframes dotWave {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.4); opacity: 1; }
        }
        @keyframes progressFill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
