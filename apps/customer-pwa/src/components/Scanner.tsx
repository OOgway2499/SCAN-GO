import React, { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';
import { useUiStore } from '../stores/uiStore';
import { CartProduct } from '../stores/cartStore';
import Tag from '../components/Tag';
import { formatINR } from '@scango/ui';

// Fallback products for demo search if offline/no API
const DEMO_PRODUCTS = [
  {id:"P01",productId:"P01",name:"Aashirvaad Atta 5kg",brand:"ITC",price:280,mrp:310,cat:"Staples",icon:"🌾",gstRate:0.05,qty:1},
  {id:"P04",productId:"P04",name:"Cadbury Silk 160g",brand:"Cadbury",price:180,mrp:195,cat:"Snacks",icon:"🍫",gstRate:0.18,qty:1},
  {id:"P05",productId:"P05",name:"Maggi Noodles 70g",brand:"Nestlé",price:14,mrp:14,cat:"Instant",icon:"🍜",gstRate:0.18,qty:1},
  {id:"P10",productId:"P10",name:"Tomato (Loose) 500g",brand:"Fresh",price:35,mrp:35,cat:"Vegetables",icon:"🍅",gstRate:0,qty:1},
];

interface ScannerProps {
  onScan: (product: CartProduct) => void;
  onClose: () => void;
}

export default function Scanner({ onScan, onClose }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [q, setQ] = useState('');
  const [linePos, setLinePos] = useState(10);
  const pushToast = useUiStore((s) => s.pushToast);

  // Scan line animation
  useEffect(() => {
    let af: number;
    const tick = () => {
      setLinePos((p) => (p >= 90 ? 10 : p + 0.8));
      af = requestAnimationFrame(tick);
    };
    af = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(af);
  }, []);

  // zxing integration
  useEffect(() => {
    let codeReader: BrowserMultiFormatReader;
    
    // Defer camera start slightly for smoother UI transition
    const timer = setTimeout(() => {
      if (!videoRef.current) return;
      
      codeReader = new BrowserMultiFormatReader();
      codeReader.decodeFromVideoDevice(
        null, // null = automatically pick rear camera usually
        videoRef.current,
        (result: Result | null, err: any) => {
          if (result) {
            handleBarcodeDecode(result.getText());
          }
        }
      ).catch((e) => {
        console.error("Camera error:", e);
        pushToast("Camera access denied or unavailable", "err");
      });
    }, 400);

    return () => {
      clearTimeout(timer);
      codeReader?.reset();
    };
  }, []);

  const handleBarcodeDecode = async (barcode: string) => {
    try {
      const res = await fetch(`/api/products/barcode/${barcode}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Product not found');
      
      // Found product!
      onScan({
        id: data.id,
        productId: data.id,
        name: data.name,
        brand: data.brand,
        icon: data.icon,
        price: data.price,
        mrp: data.mrp,
        gstRate: data.gstRate,
        category: data.category,
        barcode: data.barcode,
        qty: 1
      });
    } catch (err: any) {
      pushToast(err.message, 'warn');
    }
  };

  // Mock search results
  const list = DEMO_PRODUCTS.filter(
    p => !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/95 z-[600] flex flex-col font-display">
      <div className="flex items-center justify-between p-5 pb-0 shrink-0">
        <div>
          <div className="text-white font-bold text-[17px]">Scan Barcode</div>
          <div className="text-t2 text-[12px] mt-0.5">Point camera at product barcode</div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-elevated border border-border-subtle text-t2 flex items-center justify-center text-[16px]"
        >
          ✕
        </button>
      </div>

      {/* Viewfinder Area */}
      <div className="h-[220px] flex items-center justify-center shrink-0 mt-4 bg-black/40 relative overflow-hidden">
        {/* Real video feed */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          muted
          playsInline
        />
        
        <div className="relative w-[220px] h-[140px] z-10">
          {/* Corners */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-primary rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-primary rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-primary rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-primary rounded-br-lg" />
          
          {/* Scan line overlay */}
          <div
            className="absolute left-2 right-2 h-0.5 shadow-[0_0_8px_#7B61FF]"
            style={{
              top: `${linePos}%`,
              background: `linear-gradient(90deg, transparent, #7B61FF, transparent)`,
              transition: 'top 0.02s linear'
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
      </div>

      {/* Manual Search Fallback Bottom Sheet */}
      <div className="flex-1 bg-surface rounded-t-[20px] p-4 flex flex-col overflow-hidden mt-2 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="w-10 h-1 bg-border-hi rounded-full mx-auto mb-4" />
        
        <div className="flex items-center gap-2.5 bg-elevated rounded-xl p-3 mb-3 border border-border-subtle">
          <span className="text-t3 text-[14px]">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Or search manually..."
            className="border-none bg-transparent text-t1 text-[14px] outline-none font-display flex-1"
          />
          {q && (
            <button onClick={() => setQ('')} className="bg-transparent border-none text-t3 text-[13px] px-1">
              ✕
            </button>
          )}
        </div>
        
        <div className="overflow-y-auto flex-1 flex flex-col gap-2 pb-6">
          {list.map((p) => (
            <button
              key={p.id}
              onClick={() => onScan(p as unknown as CartProduct)}
              className="bg-elevated border border-border-subtle rounded-xl p-3 flex items-center gap-3 w-full text-left font-display active:scale-[0.98] transition-all"
            >
              <span className="text-[22px] min-w-[32px] text-center">{p.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-t1 font-semibold text-[13px] truncate">{p.name}</div>
                <div className="text-t3 text-[11px] mt-0.5">{p.brand}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-primary-light font-bold text-[14px]">{formatINR(p.price)}</div>
                {p.mrp > p.price && (
                  <div className="text-t3 text-[11px] line-through">{formatINR(p.mrp)}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
