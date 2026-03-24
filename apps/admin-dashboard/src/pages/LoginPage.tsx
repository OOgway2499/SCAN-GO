import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '../stores/uiStore';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const pushToast = useUiStore((s) => s.pushToast);

  // Check if already logged in
  useEffect(() => {
    if (localStorage.getItem('scango_admin_token')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;
    
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, storeId: 'store_freshmart_hyd' }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      if (data.staff.role !== 'admin') {
        throw new Error('Access denied. Administrator role required.');
      }

      localStorage.setItem('scango_admin_token', data.token);
      localStorage.setItem('scango_admin_name', data.staff.name);
      localStorage.setItem('scango_admin_role', data.staff.role);
      
      pushToast(`Welcome back, ${data.staff.name}`);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      pushToast(err.message, 'err');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative">
      <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="glass-panel p-10 rounded-[24px] w-full max-w-[420px] relative z-10 shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-[72px] h-[72px] rounded-[20px] bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-5 text-[32px] shadow-[0_8px_30px_rgba(123,97,255,0.4)]">
            🛍️
          </div>
          <h1 className="text-[28px] font-extrabold tracking-tight mb-2">ScanGo Admin</h1>
          <p className="text-t2 text-[14px]">Enter admin PIN to access dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div>
            <label className="block text-t3 text-[12px] font-bold uppercase tracking-widest mb-2">
              Security PIN
            </label>
            <input
              type="password"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-elevated border border-border-hi rounded-xl px-5 py-4 text-t1 text-[18px] font-bold outline-none focus:border-primary transition-colors tracking-[1em] text-center"
              autoFocus
              maxLength={4}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || pin.length < 4}
            className="w-full btn-primary py-4 rounded-xl font-bold text-[16px] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border-subtle text-center text-t3 text-[12px]">
          Demo Admin PIN: 1234
        </div>
      </div>
    </div>
  );
}
