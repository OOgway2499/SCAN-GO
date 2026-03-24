import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { formatINR, formatDate, formatTime } from '@scango/ui';

export default function ReceiptScreen() {
  const { receiptId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/orders/${receiptId}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, [receiptId]);

  if (!data) return <div className="min-h-screen bg-bg" />;

  return (
    <div className="min-h-[100dvh] bg-bg font-display max-w-[430px] mx-auto pb-12 relative overflow-hidden">
      
      {/* Confetti (CSS animation) */}
      <div className="absolute inset-x-0 top-0 h-[200px] overflow-hidden pointer-events-none z-[100]">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 w-2 h-2 rounded-sm animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#7B61FF', '#F472B6', '#2DD4BF', '#FBBF24', '#fff'][i % 5],
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${1 + Math.random()}s`,
            }}
          />
        ))}
      </div>

      <div className="bg-[radial-gradient(ellipse_90%_70%_at_50%_0%,rgba(123,97,255,0.20)_0%,transparent_60%)] pt-10 px-5 pb-8 text-center relative pointer-events-none">
        <div className="absolute inset-0 dot-grid" />
        <div className="w-[70px] h-[70px] bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-[30px] shadow-[0_0_40px_rgba(123,97,255,0.4)] animate-pop-in text-bg font-bold z-10 relative">
          ✓
        </div>
        <div className="text-t1 font-extrabold text-[26px] z-10 relative">Payment Successful!</div>
        <div className="text-t2 text-[14px] mt-1 z-10 relative">Show QR at exit gate</div>
      </div>

      <div className="px-4 relative z-10">
        <div className="bg-surface border border-border-subtle rounded-2xl p-5 text-center mb-4 -mt-3 shadow-xl">
          <div className="text-t3 text-[11px] font-bold uppercase tracking-widest mb-3.5">
            Exit Pass — Scan at Gate
          </div>
          
          <div className="inline-block bg-white p-2.5 rounded-xl mb-3 shadow-inner">
            <QRCode value={receiptId || ''} size={150} level="M" fgColor="#1e1e1e" />
          </div>
          
          <div className="text-primary-light text-[20px] font-bold tracking-[3px] mb-1 font-mono">
            {receiptId}
          </div>
          <div className="text-t3 text-[12px] font-medium">
            {data.itemCount} items · {formatTime(new Date(data.createdAt))} · {formatDate(new Date(data.createdAt))}
          </div>
        </div>

        <div className="bg-surface border border-border-subtle rounded-xl p-4.5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-t1 font-extrabold text-[15px]">Receipt</div>
            <div className="text-t3 text-[12px] font-medium text-right">
              {data.store.name}<br/>
              #{data.store.gstin || 'GSTIN-PENDING'}
            </div>
          </div>
          
          <div className="mb-2">
            {data.items.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-2.5 py-2 border-b border-border-subtle">
                <span className="text-[16px]">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-t1 text-[13px] font-medium truncate">{item.name}</div>
                  <div className="text-t3 text-[11px]">×{item.qty} @ {formatINR(item.unitPrice)}</div>
                </div>
                <div className="text-t1 font-bold text-[13px]">{formatINR(item.total)}</div>
              </div>
            ))}
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between mb-1.5">
              <span className="text-t2 text-[13px]">Subtotal</span>
              <span className="text-t1 font-medium text-[13px]">{formatINR(data.subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2.5">
              <span className="text-t2 text-[13px]">GST Breakup</span>
              <span className="text-t1 font-medium text-[13px]">{formatINR(data.gstAmount)}</span>
            </div>
            <div className="flex justify-between pt-2.5 border-t border-dashed border-border-subtle">
              <span className="text-t1 font-bold text-[14px]">TOTAL PAID</span>
              <span className="text-primary-light font-black text-[17px]">{formatINR(data.total)}</span>
            </div>
            <div className="text-right mt-1 text-t3 text-[11px] font-medium uppercase">
              VIA {data.paymentMethod}
            </div>
          </div>
        </div>

        <div className="bg-warning/15 border border-warning/30 rounded-xl p-3.5 flex gap-3 shadow-sm">
          <span className="text-[18px] shrink-0 mt-0.5">⚠️</span>
          <div className="text-warning text-[13px] leading-relaxed font-medium">
            <strong>At Exit Gate:</strong> Guard counts your items vs this receipt. Any unscanned item gets billed on the spot.
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/')}
          className="w-full mt-6 p-4 rounded-xl border border-border-subtle text-t2 font-bold hover:bg-elevated transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
