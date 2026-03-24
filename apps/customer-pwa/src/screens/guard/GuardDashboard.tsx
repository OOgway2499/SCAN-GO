import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '../../stores/uiStore';
import { formatINR, formatTime } from '@scango/ui';
import { io } from 'socket.io-client';

export default function GuardDashboard() {
  const navigate = useNavigate();
  const { pushToast } = useUiStore();
  const [receiptId, setReceiptId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [physicalCount, setPhysicalCount] = useState<number | ''>('');
  
  const guardName = localStorage.getItem('scango_guard_name') || 'Guard';
  const guardId = localStorage.getItem('scango_guard_id');
  const token = localStorage.getItem('scango_guard_token');

  useEffect(() => {
    if (!token) {
      navigate('/guard');
      return;
    }
    
    // Connect Socket.io to listen for new paid receipts to flash on dashboard
    const socket = io('/', {
      path: '/socket.io',
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Guard dashboard connected to real-time events');
      socket.emit('join:guard', 'store_freshmart_hyd');
      pushToast("Live tracking active for store", "ok");
    });

    socket.on('order:unverified', (data: any) => {
      pushToast(`🔔 New exit receipt: ${data.receiptId}`, 'warn');
      // Auto-populate lookup field to save guard time
      setReceiptId(data.receiptId);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLookup = async () => {
    if (!receiptId) return;
    setIsLoading(true);
    setReceipt(null);
    setPhysicalCount('');

    try {
      const res = await fetch(`/api/guard/receipt/${receiptId}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setReceipt(data);
    } catch (err: any) {
      pushToast(err.message, 'err');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (physicalCount === '' || !receipt) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/guard/verify/${receipt.orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ physicalCount: Number(physicalCount), guardId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.mismatchCount === 0) {
        pushToast("Verified! Customer clear to exit.", "ok");
        setReceipt(null);
        setReceiptId('');
      } else {
        pushToast(`${data.mismatchCount} unbilled items found!`, "warn");
        // Update receipt with verification status showing mismatch
        setReceipt({ ...receipt, verification: data });
      }
    } catch (err: any) {
      pushToast(err.message, 'err');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('scango_guard_token');
    localStorage.removeItem('scango_guard_id');
    localStorage.removeItem('scango_guard_name');
    navigate('/guard');
  };

  return (
    <div className="min-h-screen bg-bg font-display flex flex-col max-w-[500px] mx-auto relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg-guard pointer-events-none" />

      {/* Header */}
      <div className="bg-[#1e1e1e]/90 border-b border-border-subtle p-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-elevated rounded-xl flex items-center justify-center text-[20px] shadow-inner border border-border-subtle">
            🛡️
          </div>
          <div>
            <div className="text-t1 font-bold text-[15px]">{guardName}</div>
            <div className="text-success text-[12px] font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Active at Main Gate
            </div>
          </div>
        </div>
        <button onClick={logout} className="text-t3 text-[13px] font-bold bg-transparent border-none p-2 hover:text-white transition-colors">
          Logout
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col z-10">
        
        {/* Lookup Section */}
        {!receipt && (
          <div className="glass-card p-5 border-primary/20 animate-fade-up">
            <h2 className="text-t1 font-extrabold text-[18px] mb-4">Validate Receipt</h2>
            
            <div className="bg-elevated border border-border-subtle rounded-xl flex items-center p-1.5 mb-4">
              <input
                type="text"
                placeholder="Scan QR or Enter ID (SG-XXXX)"
                value={receiptId}
                onChange={(e) => setReceiptId(e.target.value.toUpperCase())}
                className="bg-transparent border-none text-t1 font-mono text-[15px] font-bold outline-none px-3 flex-1 uppercase"
                autoFocus
              />
              <button 
                onClick={handleLookup}
                disabled={isLoading || !receiptId}
                className="bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-[8px] font-bold text-[13px] transition-all disabled:opacity-50"
              >
                {isLoading ? '...' : 'Lookup'}
              </button>
            </div>
            
            <button className="w-full bg-surface border border-border-subtle rounded-xl p-4 flex items-center justify-center gap-2 text-t2 font-bold hover:bg-elevated transition-colors">
              <span>📷</span> Tap to Scan QR
            </button>
          </div>
        )}

        {/* Verification Flow */}
        {receipt && !receipt.verification && (
          <div className="animate-fade-up flex-1 flex flex-col">
            <button 
              onClick={() => { setReceipt(null); setReceiptId(''); }}
              className="mb-4 text-t3 text-[13px] font-bold flex items-center gap-1 hover:text-t2 self-start"
            >
              ← Back to Search
            </button>
            
            <div className="glass-card p-5 mb-5 border-success/30 shadow-[0_0_30px_rgba(52,211,153,0.1)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-success font-extrabold text-[20px] mb-1 flex items-center gap-2">
                    ✓ Paid Receipt
                  </div>
                  <div className="text-primary-light font-mono text-[14px]">{receipt.receiptId}</div>
                </div>
                {receipt.riskFlag === 'red' && (
                  <div className="bg-danger/20 text-danger border border-danger/30 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                    ⚠️ High Risk
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-surface rounded-lg p-3 border border-border-subtle">
                  <div className="text-t3 text-[11px] font-bold uppercase mb-1">Items Billed</div>
                  <div className="text-t1 text-[24px] font-extrabold">{receipt.billedCount}</div>
                </div>
                <div className="bg-surface rounded-lg p-3 border border-border-subtle">
                  <div className="text-t3 text-[11px] font-bold uppercase mb-1">Time</div>
                  <div className="text-t1 text-[16px] font-bold mt-1.5">{formatTime(new Date(receipt.createdAt))}</div>
                </div>
              </div>

              <div className="bg-elevated rounded-xl p-4 border border-border-subtle mb-6">
                <div className="text-t1 font-extrabold text-[15px] mb-3">Item Breakdown</div>
                <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {receipt.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border-subtle/50 last:border-0">
                      <span className="text-[18px]">{item.icon}</span>
                      <div className="flex-1 text-t2 text-[13px] truncate">{item.name}</div>
                      <div className="text-t1 font-bold text-[14px]">×{item.qty}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical Count Input */}
              <div className="bg-surface rounded-xl p-4 border border-border-subtle">
                <div className="text-t1 font-bold text-[14px] mb-3">Record Physical Count</div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={physicalCount}
                    onChange={(e) => setPhysicalCount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="E.g. 5"
                    className="flex-1 bg-elevated border-none text-t1 font-bold text-[18px] px-4 py-3 rounded-[10px] outline-none font-mono"
                  />
                  <button
                    onClick={handleVerify}
                    disabled={physicalCount === '' || isLoading}
                    className="btn-primary w-[120px] py-3 rounded-[10px] text-white font-extrabold text-[15px] disabled:opacity-50"
                  >
                    Verify →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mismatch UI */}
        {receipt && receipt.verification && receipt.verification.status === 'pending' && (
          <div className="animate-fade-up glass-card p-5 border-danger/40 shadow-[0_0_40px_rgba(248,113,113,0.15)] mt-4">
             <div className="text-center mb-5">
              <div className="w-[60px] h-[60px] bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-3 text-[28px] border border-danger/40">
                🚨
              </div>
              <div className="text-danger font-extrabold text-[22px]">Count Mismatch!</div>
              <div className="text-t2 text-[13px] mt-2 font-medium">
                Customer has <span className="text-t1 font-bold">{receipt.verification.mismatchCount} unbilled items</span>.
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                className="flex-1 p-3.5 bg-elevated rounded-xl font-bold text-[14px] text-t1 hover:bg-surface border border-border-subtle transition-all"
                onClick={() => { setReceipt(null); setReceiptId(''); }}
              >
                Cancel
              </button>
              <button 
                className="flex-1 p-3.5 rounded-xl font-extrabold text-[14px] text-[#111] bg-danger border border-danger transition-all hover:opacity-90 shadow-[0_4px_14px_rgba(248,113,113,0.4)]"
                onClick={() => pushToast("Add Extra Items screen coming soon", "warn")}
              >
                Bill Extras →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
