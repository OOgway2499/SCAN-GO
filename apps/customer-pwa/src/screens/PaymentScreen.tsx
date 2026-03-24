import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { useCartStore } from '../stores/cartStore';
import { useUiStore } from '../stores/uiStore';
import Tag from '../components/Tag';
import { formatINR, vibrate } from '@scango/ui';

export default function PaymentScreen() {
  const navigate = useNavigate();
  const cart = useCartStore();
  const { sessionId, isActive } = useSessionStore();
  const { pushToast } = useUiStore();
  
  const [method, setMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isActive) {
    navigate('/');
    return null;
  }

  const handlePay = async () => {
    if (!method) return;
    vibrate();
    setIsProcessing(true);

    try {
      // 1. Create Order
      const resC = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, paymentMethod: method }),
      });
      const dataC = await resC.json();
      if (!resC.ok) throw new Error(dataC.error);

      // (If method !== cash, would trigger Razorpay UI here)
      // For now, simulate 1.5s delay and auto-verify
      await new Promise(r => setTimeout(r, 1500));

      const resV = await fetch(`/api/orders/${dataC.orderId}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: 'mock_tx_' + Date.now() }),
      });
      const dataV = await resV.json();
      if (!resV.ok) throw new Error(dataV.error);

      // Payment successful
      cart.clearCart();
      setIsProcessing(false);
      navigate(`/receipt/${dataV.receiptId}`, { replace: true });
      
    } catch (err: any) {
      setIsProcessing(false);
      pushToast(err.message, 'err');
    }
  };

  const methods = [
    { id: 'gpay', label: 'Google Pay', sub: 'UPI · Instant', icon: '🟦', badge: 'Recommended' },
    { id: 'phonepe', label: 'PhonePe', sub: 'UPI · Instant', icon: '🟪', badge: null },
    { id: 'upi', label: 'Other UPI', sub: 'Any UPI ID', icon: '📱', badge: null },
    { id: 'card', label: 'Credit / Debit', sub: 'Visa, MasterCard, RuPay', icon: '💳', badge: null },
    { id: 'cash', label: 'Cash at Exit', sub: 'Pay guard at gate', icon: '💵', badge: null },
  ];

  if (isProcessing) {
    return (
      <div className="min-h-[100dvh] bg-bg flex flex-col items-center justify-center relative font-display">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(123,97,255,0.2)_0%,transparent_60%)] pointer-events-none" />
        <div className="w-[60px] h-[60px] rounded-full border-[3px] border-primary border-t-transparent animate-spin-slow z-10" />
        <div className="text-t1 font-bold text-[18px] mt-5 z-10">Processing Payment...</div>
        <div className="text-t2 text-[13px] mt-1 z-10">Please do not close this window</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-bg font-display max-w-[430px] mx-auto p-5 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 mesh-bg-shopping pointer-events-none z-0" />
      
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 bg-elevated border border-border-subtle rounded-lg flex items-center justify-center text-t2 font-bold"
          >
            ←
          </button>
          <div>
            <div className="text-t1 font-extrabold text-[20px]">Checkout</div>
            <div className="text-t3 text-[12px] font-medium">{cart.count()} items</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#5B41DF]/90 to-surface border border-primary/30 rounded-2xl p-6 mb-6 relative overflow-hidden shadow-lg">
          <div className="absolute -top-10 -right-10 w-[120px] h-[120px] rounded-full bg-primary/20 blur-xl" />
          <div className="text-white/60 text-[13px] font-bold tracking-wide uppercase mb-1">Total Payable</div>
          <div className="text-white text-[42px] font-extrabold tracking-tight leading-none mb-3">
            {formatINR(cart.total())}
          </div>
          <div className="flex gap-2.5 flex-wrap items-center">
            <span className="text-white/50 text-[12px] font-medium">Subtotal {formatINR(cart.subtotal())}</span>
            <span className="text-white/20">•</span>
            <span className="text-white/50 text-[12px] font-medium">GST {formatINR(cart.gstAmount())}</span>
            {cart.savings() > 0 && (
              <>
                <span className="text-white/20">•</span>
                <span className="text-success text-[12px] font-extrabold">Saved {formatINR(cart.savings())}</span>
              </>
            )}
          </div>
        </div>

        <div className="text-t3 text-[11px] font-bold uppercase tracking-widest mb-3">Payment Method</div>
        
        <div className="flex flex-col gap-2 mb-6">
          {methods.map((m) => (
            <div
              key={m.id}
              onClick={() => { setMethod(m.id); vibrate(); }}
              className={`bg-surface rounded-xl p-3.5 flex items-center gap-3.5 cursor-pointer transition-all border-[1.5px] ${
                method === m.id ? 'border-primary shadow-[0_0_20px_rgba(123,97,255,0.2)]' : 'border-border-subtle'
              }`}
            >
              <span className="text-[24px] min-w-[32px] text-center">{m.icon}</span>
              <div className="flex-1">
                <div className="text-t1 font-bold text-[14px] flex items-center gap-2">
                  {m.label}
                  {m.badge && <Tag color="violet">{m.badge}</Tag>}
                </div>
                <div className="text-t3 text-[12px] mt-0.5">{m.sub}</div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                method === m.id ? 'border-primary bg-primary' : 'border-border-subtle'
              }`}>
                {method === m.id && <span className="text-white text-[11px] font-extrabold">✓</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <button
            onClick={handlePay}
            disabled={!method}
            className={`w-full p-4 rounded-xl text-[16px] font-extrabold font-display transition-all ${
              method 
                ? 'btn-primary text-white shadow-[0_0_40px_rgba(123,97,255,0.4)]' 
                : 'bg-elevated text-t3 border-none cursor-not-allowed'
            }`}
          >
            {method === 'cash' ? 'Generate Exit Pass →' : method ? `Pay ${formatINR(cart.total())} →` : 'Select a payment method'}
          </button>
        </div>
      </div>
    </div>
  );
}
