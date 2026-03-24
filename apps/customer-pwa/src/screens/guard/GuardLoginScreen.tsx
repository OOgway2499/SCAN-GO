import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '../../stores/uiStore';

export default function GuardLoginScreen() {
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { pushToast } = useUiStore();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (pin.length !== 4) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/auth/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, storeId: 'store_freshmart_hyd' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid PIN');

      if (data.staff.role !== 'guard' && data.staff.role !== 'admin') {
        throw new Error('Access denied. Guard role required.');
      }

      // Store token (in a real app, this should be in an HttpOnly cookie or secure store)
      localStorage.setItem('scango_guard_token', data.token);
      localStorage.setItem('scango_guard_id', data.staff.id);
      localStorage.setItem('scango_guard_name', data.staff.name);

      pushToast(`Welcome, ${data.staff.name}`);
      navigate('/guard/dashboard', { replace: true });
    } catch (err: any) {
      pushToast(err.message, 'err');
      setPin('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 relative overflow-hidden font-display">
      <div className="absolute inset-0 mesh-bg-guard pointer-events-none" />
      <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />

      <div className="w-full max-w-[360px] relative z-10 glass-card p-6 border-primary/30 shadow-[0_0_50px_rgba(123,97,255,0.1)]">
        <div className="text-center mb-8">
          <div className="w-[60px] h-[60px] bg-elevated rounded-2xl flex items-center justify-center mx-auto mb-4 text-[28px] border border-border-subtle shadow-inner">
            🛡️
          </div>
          <div className="text-t1 text-[24px] font-extrabold tracking-tight">
            Guard Console
          </div>
          <div className="text-t3 text-[13px] mt-1 font-medium">
            Enter 4-digit PIN to access
          </div>
        </div>

        <div className="flex gap-3 justify-center mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-[50px] h-[60px] rounded-xl flex items-center justify-center text-[24px] font-extrabold transition-all border-2 ${
                pin[i]
                  ? 'border-primary bg-primary/20 text-white shadow-[0_0_15px_rgba(123,97,255,0.3)]'
                  : 'border-border-hi bg-elevated text-transparent'
              }`}
            >
              {pin[i] ? '•' : ''}
            </div>
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '←'].map((key) => (
            <button
              key={key}
              onClick={() => {
                if (key === 'C') setPin('');
                else if (key === '←') setPin((p) => p.slice(0, -1));
                else if (pin.length < 4) setPin((p) => p + key);
              }}
              className={`h-[54px] rounded-xl text-[20px] font-bold transition-all active:scale-[0.95] ${
                typeof key === 'number'
                  ? 'bg-elevated hover:bg-surface text-t1 border border-border-subtle'
                  : 'bg-surface hover:bg-elevated text-t2 border border-border-subtle'
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        <button
          onClick={handleLogin}
          disabled={pin.length !== 4 || isProcessing}
          className={`w-full p-4 rounded-xl text-[15px] font-extrabold transition-all ${
            pin.length === 4
              ? 'btn-primary text-white shadow-[0_0_40px_rgba(123,97,255,0.4)]'
              : 'bg-elevated text-t3 border-none cursor-not-allowed'
          }`}
        >
          {isProcessing ? 'Verifying...' : 'Login →'}
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-4 p-3 bg-transparent text-t3 text-[13px] font-semibold cursor-pointer hover:text-t2 transition-colors"
        >
          ← Back to Customer Flow
        </button>

        <div className="mt-6 pt-4 border-t border-border-subtle text-center text-t3 text-[12px] font-medium">
          Demo Guard PIN: 0000
        </div>
      </div>
    </div>
  );
}
