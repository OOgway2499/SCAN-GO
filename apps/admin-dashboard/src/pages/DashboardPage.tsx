import React, { useEffect, useState } from 'react';
import { useUiStore } from '../stores/uiStore';
import { formatINR } from '@scango/ui';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingCart, TrendingUp, Package, Users } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const { pushToast } = useUiStore();

  useEffect(() => {
    fetch('/api/admin/dashboard/live?storeId=store_freshmart_hyd', {
      headers: { Authorization: `Bearer ${localStorage.getItem('scango_admin_token')}` }
    })
      .then(res => res.json())
      .then(setData)
      .catch(err => pushToast('Failed to load dashboard data', 'err'));
  }, []);

  if (!data) return <div className="p-8 text-t2 font-medium">Loading metrics...</div>;

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-t1 tracking-tight">Store Overview</h1>
          <p className="text-t3 text-[14px] mt-1">Live metrics and performance monitoring</p>
        </div>
        <div className="bg-surface border border-border-subtle rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block" />
          <span className="text-t2 text-[13px] font-bold">Live Sync Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface border border-border-subtle rounded-[20px] p-6 relative overflow-hidden group hover:border-border-hi transition-colors">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
          <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-4">
            <TrendingUp size={20} />
          </div>
          <div className="text-t3 text-[13px] font-bold uppercase tracking-wider mb-1">Today's Revenue</div>
          <div className="text-t1 text-[32px] font-extrabold">{formatINR(data.revenueToday)}</div>
        </div>

        <div className="bg-surface border border-border-subtle rounded-[20px] p-6 relative overflow-hidden group hover:border-border-hi transition-colors">
           <div className="absolute -top-6 -right-6 w-24 h-24 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-colors" />
          <div className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center mb-4">
            <ShoppingCart size={20} />
          </div>
          <div className="text-t3 text-[13px] font-bold uppercase tracking-wider mb-1">Total Orders</div>
          <div className="text-t1 text-[32px] font-extrabold">{data.ordersToday}</div>
        </div>

        <div className="bg-surface border border-border-subtle rounded-[20px] p-6 relative overflow-hidden group hover:border-border-hi transition-colors">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-warning/10 rounded-full blur-2xl group-hover:bg-warning/20 transition-colors" />
          <div className="w-10 h-10 rounded-xl bg-warning/20 text-warning flex items-center justify-center mb-4">
            <Users size={20} />
          </div>
          <div className="text-t3 text-[13px] font-bold uppercase tracking-wider mb-1">Active Carts</div>
          <div className="text-t1 text-[32px] font-extrabold">{data.activeCarts}</div>
          <div className="text-success text-[12px] font-bold mt-2">Currently shopping</div>
        </div>

        <div className="bg-surface border border-border-subtle rounded-[20px] p-6 relative overflow-hidden group hover:border-border-hi transition-colors">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-pink/10 rounded-full blur-2xl group-hover:bg-pink/20 transition-colors" />
          <div className="w-10 h-10 rounded-xl bg-pink/20 text-pink flex items-center justify-center mb-4">
            <Package size={20} />
          </div>
          <div className="text-t3 text-[13px] font-bold uppercase tracking-wider mb-1">Avg Order Value</div>
          <div className="text-t1 text-[32px] font-extrabold">{formatINR(data.avgCartValue)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-surface border border-border-subtle rounded-[24px] p-6">
          <h3 className="text-t1 font-bold text-[18px] mb-6">Hourly Revenue</h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.hourlyRevenue.filter((h: any) => h.revenue > 0 || h.hour > 6)}>
                <XAxis 
                  dataKey="hour" 
                  stroke="#555" 
                  tickFormatter={(val) => `${val}:00`} 
                  fontSize={12}
                  tickMargin={10}
                />
                <YAxis 
                  stroke="#555" 
                  tickFormatter={(val) => `₹${val/1000}k`}
                  fontSize={12}
                  tickMargin={10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: '12px' }}
                  labelFormatter={(val) => `${val}:00 to ${Number(val)+1}:00`}
                  formatter={(val: number) => [formatINR(val), 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#7B61FF" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#7B61FF', strokeWidth: 0 }}
                  activeDot={{ r: 8, fill: '#2DD4BF', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-surface border border-border-subtle rounded-[24px] p-6 flex flex-col">
          <h3 className="text-t1 font-bold text-[18px] mb-4">Top Selling Items</h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {data.topProducts.map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-border-subtle last:border-0 hover:bg-elevated -mx-4 px-4 transition-colors rounded-xl">
                <div className="w-12 h-12 bg-elevated rounded-xl flex items-center justify-center text-[24px] border border-border-hi">
                  {p.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-t1 font-bold text-[14px] truncate">{p.name}</div>
                  <div className="text-t3 text-[12px]">{formatINR(p.price)}</div>
                </div>
                <div className="text-right">
                  <div className="text-t1 font-black text-[15px]">{p.totalSold}</div>
                  <div className="text-t3 text-[11px] font-medium">units</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
