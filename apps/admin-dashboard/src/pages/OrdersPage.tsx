import React, { useState, useEffect } from 'react';
import { useUiStore } from '../stores/uiStore';

interface OrderItem {
  name: string;
  qty: number;
  unitPrice: number;
  icon: string;
}

interface Order {
  orderId: string;
  receiptId: string;
  phone: string;
  storeName: string;
  total: number;
  subtotal: number;
  gstAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  riskFlag: string;
  isVerified: boolean;
  itemCount: number;
  items: OrderItem[];
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const pushToast = useUiStore((s) => s.pushToast);

  const fetchOrders = async (page = 1, phone = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('scango_admin_token');
      const params = new URLSearchParams({
        storeId: 'store_freshmart_hyd',
        page: String(page),
        limit: '15',
      });
      if (phone) params.set('phone', phone);

      const res = await fetch(`/api/orders/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err: any) {
      pushToast(err.message, 'err');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleSearch = () => fetchOrders(1, searchPhone);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight">Order History</h1>
          <p className="text-t2 text-[14px] mt-1">
            {pagination.total} total orders
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel rounded-2xl p-5 mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-t3 text-[11px] font-bold uppercase tracking-widest mb-2">
            Search by Phone Number
          </label>
          <input
            type="text"
            placeholder="e.g. 9876543210"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            className="w-full bg-elevated border border-border-hi rounded-xl px-4 py-3 text-t1 text-[14px] font-semibold outline-none focus:border-primary transition-colors"
          />
        </div>
        <button
          onClick={handleSearch}
          className="btn-primary px-6 py-3 rounded-xl font-bold text-[14px]"
        >
          Search
        </button>
        {searchPhone && (
          <button
            onClick={() => { setSearchPhone(''); fetchOrders(1, ''); }}
            className="px-4 py-3 rounded-xl bg-elevated border border-border-subtle text-t2 font-bold text-[14px] hover:text-t1 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-t3 font-bold">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-[48px] mb-3">📦</div>
            <div className="text-t3 font-bold text-[16px]">No orders found</div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle text-t3 text-[11px] font-bold uppercase tracking-widest">
                <th className="text-left p-4">Receipt ID</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Items</th>
                <th className="text-right p-4">Total</th>
                <th className="text-center p-4">Payment</th>
                <th className="text-center p-4">Status</th>
                <th className="text-left p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order.orderId}>
                  <tr
                    className="border-b border-border-subtle/50 hover:bg-elevated/50 transition-colors cursor-pointer"
                    onClick={() => setExpandedOrder(expandedOrder === order.orderId ? null : order.orderId)}
                  >
                    <td className="p-4">
                      <span className="text-primary font-extrabold text-[13px] tracking-wider">{order.receiptId}</span>
                    </td>
                    <td className="p-4 text-t2 text-[13px] font-mono">{order.phone}</td>
                    <td className="p-4 text-t2 text-[13px]">{order.itemCount} items</td>
                    <td className="p-4 text-right text-t1 font-extrabold text-[14px]">₹{order.total.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 rounded-lg bg-elevated text-t2 text-[11px] font-bold uppercase">
                        {order.paymentMethod || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-bold uppercase ${
                        order.paymentStatus === 'paid' ? 'bg-success/20 text-success' :
                        order.paymentStatus === 'pending' ? 'bg-warning/20 text-warning' :
                        'bg-elevated text-t3'
                      }`}>
                        {order.paymentStatus}
                      </span>
                      {order.isVerified && (
                        <span className="ml-1 text-[10px]" title="Guard Verified">✓</span>
                      )}
                    </td>
                    <td className="p-4 text-t3 text-[12px]">{formatDate(order.createdAt)}</td>
                  </tr>
                  {/* Expanded row */}
                  {expandedOrder === order.orderId && (
                    <tr>
                      <td colSpan={7} className="p-4 bg-elevated/30">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[13px] text-t2">
                              <span>{item.icon}</span>
                              <span>{item.name}</span>
                              <span className="text-t3">x{item.qty}</span>
                              <span className="ml-auto font-bold text-t1">₹{(item.unitPrice * item.qty).toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-2 border-t border-border-subtle flex gap-6 text-[12px] text-t3">
                          <span>Subtotal: ₹{order.subtotal.toFixed(2)}</span>
                          <span>GST: ₹{order.gstAmount.toFixed(2)}</span>
                          <span>Risk: <span className={order.riskFlag === 'red' ? 'text-danger' : 'text-success'}>{order.riskFlag}</span></span>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => fetchOrders(pagination.page - 1, searchPhone)}
            disabled={pagination.page <= 1}
            className="px-4 py-2 rounded-xl bg-elevated border border-border-subtle text-t2 font-bold text-[13px] disabled:opacity-30"
          >
            ← Prev
          </button>
          <span className="flex items-center text-t3 text-[13px] font-bold">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchOrders(pagination.page + 1, searchPhone)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-4 py-2 rounded-xl bg-elevated border border-border-subtle text-t2 font-bold text-[13px] disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
