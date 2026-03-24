import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Tag, BarChart3, Settings, LogOut, ShoppingCart } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/offers', label: 'Offers', icon: Tag },
  { path: '/staff', label: 'Staff & Guards', icon: Users },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('scango_admin_name') || 'Admin';
  
  const handleLogout = () => {
    localStorage.removeItem('scango_admin_token');
    localStorage.removeItem('scango_admin_name');
    localStorage.removeItem('scango_admin_role');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 bg-surface border-r border-border-subtle flex flex-col">
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-[20px] shadow-[0_4px_14px_rgba(123,97,255,0.4)]">
              🛒
            </div>
            <div>
              <div className="text-t1 font-extrabold text-[18px] tracking-tight leading-none">
                ScanGo<span className="text-primary">.</span>
              </div>
              <div className="text-t3 text-[11px] font-bold tracking-widest uppercase mt-1">Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1.5 custom-scrollbar">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[14px] transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-t2 hover:bg-elevated hover:text-t1 border border-transparent'
                }`
              }
            >
              <item.icon className="w-5 h-5" strokeWidth={2.5} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-border-subtle shrink-0">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-elevated flex items-center justify-center text-t2 font-bold text-[14px]">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-t1 font-bold text-[13px] truncate">{userName}</div>
              <div className="text-success text-[11px] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" /> Online
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-t3 hover:text-danger hover:bg-danger/10 transition-colors text-[13px] font-bold"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-bg relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
