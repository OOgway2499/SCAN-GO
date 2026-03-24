import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { useUiStore } from '../stores/uiStore';

interface OrderItem {
  name: string;
  qty: number;
  unitPrice: number;
  icon: string;
  total: number;
}

interface Order {
  orderId: string;
  receiptId: string;
  storeName: string;
  storeBranch: string;
  total: number;
  subtotal: number;
  gstAmount: number;
  paymentMethod: string;
  itemCount: number;
  items: OrderItem[];
  createdAt: string;
}

interface HistoryData {
  phone: string;
  totalOrders: number;
  totalSpent: number;
  orders: Order[];
}

export default function OrderHistoryScreen() {
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const { pushToast } = useUiStore();
  const phone = useSessionStore((s) => s.phone);
  const navigate = useNavigate();

  useEffect(() => {
    if (!phone) {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [phone]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/history/${phone}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHistory(data);
    } catch (err: any) {
      pushToast(err.message, 'err');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center p-6 relative overflow-hidden font-display">
      <div className="absolute inset-0 mesh-bg pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/shopping')} className="w-10 h-10 rounded-xl bg-elevated border border-border-subtle flex items-center justify-center text-t2 hover:text-t1 transition-colors">
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-[22px] font-extrabold tracking-tight">My Orders</h1>
            <p className="text-t3 text-[12px] font-medium">+91 {phone}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-t3 font-bold">Loading your orders...</div>
        ) : history && history.totalOrders > 0 ? (
          <div className="space-y-4">
            {/* Summary Card */}
            <div className="glass-card p-5 border-primary/20">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-t3 text-[11px] font-bold uppercase tracking-widest">Total Orders</div>
                  <div className="text-[28px] font-extrabold text-primary">{history.totalOrders}</div>
                </div>
                <div className="text-right">
                  <div className="text-t3 text-[11px] font-bold uppercase tracking-widest">Total Spent</div>
                  <div className="text-[28px] font-extrabold text-success">₹{history.totalSpent.toFixed(0)}</div>
                </div>
              </div>
            </div>

            {/* Order Cards */}
            {history.orders.map((order) => (
              <div
                key={order.orderId}
                className="glass-card p-4 border-border-subtle hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.orderId ? null : order.orderId)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-primary font-extrabold text-[14px] tracking-wider">{order.receiptId}</div>
                    <div className="text-t3 text-[12px] mt-0.5">{formatDate(order.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-t1 font-extrabold text-[18px]">₹{order.total.toFixed(2)}</div>
                    <div className="text-t3 text-[11px]">{order.itemCount} items · {order.paymentMethod.toUpperCase()}</div>
                  </div>
                </div>

                {/* Expanded item list */}
                {expandedOrder === order.orderId && (
                  <div className="mt-3 pt-3 border-t border-border-subtle space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[13px]">
                        <div className="flex items-center gap-2">
                          <span>{item.icon}</span>
                          <span className="text-t2">{item.name}</span>
                          <span className="text-t3">x{item.qty}</span>
                        </div>
                        <span className="text-t1 font-bold">₹{item.total.toFixed(0)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-border-subtle text-[12px] text-t3">
                      <span>Subtotal: ₹{order.subtotal.toFixed(2)}</span>
                      <span>GST: ₹{order.gstAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-t3">
            <div className="text-[48px] mb-3">🛒</div>
            <div className="font-bold text-[16px]">No orders yet</div>
            <div className="text-[13px] mt-1">Complete a purchase to see your history here!</div>
          </div>
        )}
      </div>
    </div>
  );
}
