import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { useUiStore } from '../stores/uiStore';

export default function EntryScreen() {
  const [phoneInput, setPhoneInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const navigate = useNavigate();
  const setSession = useSessionStore((s) => s.setSession);
  const storeName = useSessionStore((s) => s.storeName);
  const storeBranch = useSessionStore((s) => s.storeBranch);
  const storeCode = useSessionStore((s) => s.storeCode);
  const storeId = useSessionStore((s) => s.storeId);
  const pushToast = useUiStore((s) => s.pushToast);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const isValid = phoneInput.length === 10 && /^[6-9]/.test(phoneInput);

  const handleStartShopping = async () => {
    if (!isValid) return;

    try {
      const res = await fetch('/api/auth/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput, storeId }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to start session');

      setSession({
        phone: data.phone,
        sessionId: data.sessionId,
        isActive: true,
      });
      
      navigate('/shopping');
    } catch (err: any) {
      pushToast(err.message, 'err');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 relative overflow-hidden font-display">
      <div className="absolute inset-0 mesh-bg-entry pointer-events-none" />
      <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />

      <div
        className={`w-full max-w-[360px] relative z-10 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <div className="text-center mb-10">
          <div className="w-[68px] h-[68px] rounded-[20px] flex items-center justify-center mx-auto mb-4 text-[30px] shadow-[0_0_40px_rgba(123,97,255,0.35)] bg-gradient-to-br from-primary to-pink">
            🛒
          </div>
          <div className="text-t1 text-[30px] font-extrabold tracking-tight">
            ScanGo<span className="text-primary">.</span>
          </div>
          <div className="text-t2 text-[13px] mt-1.5">
            Skip the queue. Shop smarter.
          </div>
        </div>

        <div className="glass-card p-3 mb-3.5 flex items-center gap-3">
          <div className="w-10 h-10 bg-elevated rounded-[10px] flex items-center justify-center text-lg shrink-0">
            🏪
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-t1 font-bold text-[14px] truncate">{storeName}</div>
            <div className="text-t3 text-[12px] truncate">
              {storeBranch} · #{storeCode}
            </div>
          </div>
          <span className="bg-success/20 text-success border border-success/30 rounded-full px-2.5 py-[3px] text-[11px] font-bold shrink-0">
            ● Open
          </span>
        </div>

        <div className="bg-[#2C2C2C]/85 border border-border-subtle rounded-2xl p-5 mb-3 backdrop-blur-md">
          <div className="text-t2 text-[11px] font-bold uppercase tracking-widest mb-2.5">
            Mobile number
          </div>
          
          <div
            className={`flex items-center gap-2.5 bg-elevated rounded-lg p-3 transition-colors duration-200 border-[1.5px] mb-3.5 ${
              isFocused ? 'border-primary' : 'border-border-subtle'
            }`}
          >
            <span className="text-t2 text-[14px] font-bold">+91</span>
            <div className="w-[1px] h-[18px] bg-border-hi" />
            <input
              type="tel"
              maxLength={10}
              placeholder="9876543210"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="border-none bg-transparent text-t1 text-[18px] font-bold outline-none tracking-[2px] w-full caret-primary font-display"
            />
            {isValid && <span className="text-success text-[16px]">✓</span>}
          </div>

          <p className="text-t3 text-[12px] m-0 mb-4 leading-relaxed">
            Cart and receipt linked to this number. No OTP needed.
          </p>

          <button
            onClick={handleStartShopping}
            disabled={!isValid}
            className={`w-full p-4 rounded-xl text-[15px] font-extrabold font-display transition-all duration-300 ${
              isValid ? 'btn-primary text-white' : 'bg-elevated text-t3 border-none'
            }`}
          >
            Start Shopping →
          </button>
        </div>

        <button
          onClick={() => navigate('/guard')}
          className="w-full p-3 bg-transparent border border-border-subtle rounded-xl text-t3 text-[13px] font-semibold cursor-pointer font-display hover:bg-elevated/50 transition-colors"
        >
          🔐 Staff / Guard Login
        </button>
      </div>
    </div>
  );
}
