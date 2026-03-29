import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { useCartStore, CartProduct } from '../stores/cartStore';
import { useUiStore } from '../stores/uiStore';
import Scanner from '../components/Scanner';
import Chip from '../components/Chip';
import Tag from '../components/Tag';
import { formatINR, categories, Category, vibrate } from '@scango/ui';
import { SFX } from '../hooks/useSounds';

export default function ShoppingScreen() {
  const navigate = useNavigate();
  const { phone, sessionId, isActive } = useSessionStore();
  const cart = useCartStore();
  const { pushToast, isScannerOpen, setScannerOpen } = useUiStore();
  
  const [tab, setTab] = useState<'scan' | 'cart'>('scan');
  const [cat, setCat] = useState<Category>('All');
  const [q, setQ] = useState('');
  const [flash, setFlash] = useState<CartProduct | null>(null);
  
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!isActive || !sessionId) {
      navigate('/');
      return;
    }
    
    fetch(`/api/store/store_freshmart_hyd/products?limit=100`)
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(err => console.error(err));
  }, [isActive, sessionId, navigate]);

  const handleScan = (p: CartProduct) => {
    SFX.scan();
    
    // Normalize: API products use 'id', cart uses 'productId'
    const normalized = { ...p, productId: p.productId || p.id };

    fetch(`/api/cart/${sessionId}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: normalized.productId, qty: 1 }),
    }).catch(e => console.error("Sync error:", e));

    cart.addItem(normalized);
    pushToast(`${p.name} added`);
    setFlash(p);
    setScannerOpen(false);
    
    setTimeout(() => setFlash(null), 1800);
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const okCat = cat === 'All' || p.category === cat;
      const okQ = !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase());
      return okCat && okQ;
    });
  }, [products, cat, q]);

  if (!isActive) return null;

  return (
    <div className="min-h-[100dvh] bg-bg font-display max-w-[430px] mx-auto flex flex-col relative w-full overflow-hidden">
      <div className="absolute inset-0 h-[200px] mesh-bg-shopping pointer-events-none z-0" />

      {/* Header */}
      <div className="bg-[#1e1e1e]/98 border-b border-border-subtle p-3.5 px-4 shrink-0 sticky top-0 z-[100]">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-t3 text-[11px] font-bold tracking-wide uppercase">Session</div>
            <div className="text-t2 text-[13px] font-bold">+91 {phone}</div>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="px-3 py-1.5 rounded-lg bg-elevated border border-border-subtle text-t2 text-[11px] font-bold hover:text-primary hover:border-primary/30 transition-colors"
          >
            📋 My Orders
          </button>
          <div className="text-right">
            <div className="text-t3 text-[11px] font-bold tracking-wide uppercase">Total</div>
            <div className="text-primary-light text-[24px] font-extrabold tracking-tight leading-none">
              {formatINR(cart.total())}
            </div>
          </div>
        </div>
        
        <div className="flex gap-1.5 pb-1">
          <button
            onClick={() => setTab('scan')}
            className={`flex-1 py-2 rounded-lg font-bold text-[13px] transition-colors ${
              tab === 'scan' ? 'bg-primary text-white' : 'bg-elevated text-t2 hover:bg-surface'
            }`}
          >
            🔍 Browse
          </button>
          <button
            onClick={() => setTab('cart')}
            className={`flex-1 py-2 rounded-lg font-bold text-[13px] transition-colors relative ${
              tab === 'cart' ? 'bg-primary text-white' : 'bg-elevated text-t2 hover:bg-surface'
            }`}
          >
            🛒 Cart
            {cart.count() > 0 && tab !== 'cart' && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-white text-[10px] font-extrabold flex items-center justify-center">
                {cart.count()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Flash Banner */}
      {flash && (
        <div className="bg-success/10 border-b border-success/20 px-4 py-2 flex items-center gap-2.5 shrink-0 z-50 animate-fade-up">
          <span className="text-[18px]">{flash.icon}</span>
          <span className="text-success font-bold text-[13px] flex-1 truncate">{flash.name} added</span>
          <span className="text-success font-extrabold text-[14px]">{formatINR(flash.price)}</span>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto relative z-10 w-full">
        {tab === 'scan' ? (
          <div className="p-4 flex flex-col pt-2">
            
            <button
              onClick={() => setScannerOpen(true)}
              className="w-full bg-gradient-to-br from-[#5B41DF]/80 to-[#2C2C2C]/80 border border-primary/30 rounded-2xl p-4 flex items-center gap-3.5 mb-4 cursor-pointer relative overflow-hidden text-left"
            >
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-[22px] shrink-0 border border-border-subtle backdrop-blur-sm">
                📷
              </div>
              <div className="flex-1">
                <div className="text-white font-extrabold text-[15px]">Open Camera Scanner</div>
                <div className="text-t2 text-[12px] mt-0.5 font-medium">Scan product barcode to add</div>
              </div>
              <span className="text-primary-light text-[20px]">→</span>
            </button>

            <div className="flex items-center gap-2.5 bg-surface rounded-lg p-2.5 mb-3 border border-border-subtle">
              <span className="text-t3 text-[14px]">🔍</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products, brands..."
                className="border-none bg-transparent text-t1 text-[13px] outline-none font-display flex-1"
              />
              {q && <button onClick={() => setQ('')} className="bg-transparent text-t3 border-none shadow-none">✕</button>}
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide">
              {categories.map((c) => (
                <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
                  {c}
                </Chip>
              ))}
            </div>

            <div className="flex flex-col gap-1.5 pb-20">
              {filtered.map((p, i) => {
                const inCart = cart.items.find((ci) => ci.productId === (p.productId || p.id));
                return (
                  <button
                    key={p.id}
                    onClick={() => handleScan(p)}
                    className="bg-surface border border-border-subtle rounded-[10px] p-3 flex items-center gap-3 cursor-pointer text-left active:border-primary/50 transition-colors stagger-item"
                    style={{ animationDelay: `${i * 20}ms` }}
                  >
                    <div className="w-11 h-11 bg-elevated rounded-[8px] flex items-center justify-center text-[22px] relative border border-border-subtle shrink-0">
                      {p.icon}
                      {inCart && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-white text-[10px] font-extrabold flex items-center justify-center">
                          {inCart.qty}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-t1 font-semibold text-[13px] truncate">{p.name}</div>
                      <div className="text-t3 text-[11px] mt-0.5">{p.brand} · {p.category}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-primary-light font-extrabold text-[14px]">{formatINR(p.price)}</div>
                      {p.mrp > p.price && (
                        <div className="text-t3 text-[11px] line-through">{formatINR(p.mrp)}</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-2.5 pt-2 pb-24">
            {cart.items.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-[48px] mb-3 opacity-20">🛒</div>
                <div className="text-t2 font-semibold">Cart is empty</div>
                <div className="text-t3 text-[13px] mt-1">Switch to Browse to add items</div>
              </div>
            ) : (
              <>
                {cart.savings() > 0 && (
                  <div className="bg-success/15 border border-success/30 rounded-lg p-2.5 flex items-center gap-2 mb-1">
                    <span>🎉</span>
                    <span className="text-success font-bold text-[13px]">
                      Saving {formatINR(cart.savings())} on this order!
                    </span>
                  </div>
                )}
                
                {cart.items.map((item) => (
                  <div key={item.productId} className="bg-surface border border-border-subtle rounded-xl p-3 flex items-center gap-3">
                    <span className="text-[26px] min-w-[36px] text-center">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-t1 font-semibold text-[13px] truncate">{item.name}</div>
                      <div className="text-t3 text-[11px] mt-1 pr-6">{formatINR(item.price)}/ea</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (item.qty === 1) cart.removeItem(item.productId);
                          else cart.updateQty(item.productId, -1);
                        }}
                        className="w-7 h-7 rounded-md bg-elevated border border-border-subtle flex items-center justify-center font-bold text-t1 pb-0.5"
                      >
                        −
                      </button>
                      <span className="w-5 text-center font-extrabold text-[13px]">{item.qty}</span>
                      <button
                        onClick={() => cart.updateQty(item.productId, 1)}
                        className="w-7 h-7 rounded-md bg-primary flex items-center justify-center font-extrabold text-white pb-0.5"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="text-right min-w-[58px] ml-2">
                      <div className="text-primary-light font-extrabold text-[14px]">
                        {formatINR(item.price * item.qty)}
                      </div>
                      <button
                        onClick={() => cart.removeItem(item.productId)}
                        className="bg-transparent border-none text-danger text-[11px] font-bold p-0 mt-1 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="bg-surface border border-border-subtle rounded-xl p-4 mt-2">
                  <div className="text-t1 font-extrabold text-[15px] mb-3">Bill Summary</div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-t2 text-[13px]">Subtotal</span>
                    <span className="text-t1 font-medium text-[13px]">{formatINR(cart.subtotal())}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-t2 text-[13px]">GST Breakup</span>
                    <span className="text-t1 font-medium text-[13px]">{formatINR(cart.gstAmount())}</span>
                  </div>
                  {cart.savings() > 0 && (
                    <div className="flex justify-between mb-3 text-success">
                      <span className="text-[13px] font-bold">You Saved</span>
                      <span className="font-bold text-[13px]">− {formatINR(cart.savings())}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-3 border-t border-dashed border-border-subtle mt-1">
                    <span className="text-t1 font-bold text-[14px]">Total Payable</span>
                    <span className="text-primary-light font-black text-[17px]">{formatINR(cart.total())}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {tab === 'cart' && cart.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-bg via-[#1e1e1e]/90 to-transparent z-[90]">
          <div className="max-w-[430px] mx-auto w-full">
            <button
              onClick={() => navigate('/payment')}
              className="w-full btn-primary p-4 rounded-xl text-white font-extrabold text-[16px] shadow-[0_0_40px_rgba(123,97,255,0.4)] transition-transform active:scale-[0.98]"
            >
              Pay {formatINR(cart.total())} →
            </button>
          </div>
        </div>
      )}

      {isScannerOpen && (
        <Scanner
          onScan={handleScan}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
}
