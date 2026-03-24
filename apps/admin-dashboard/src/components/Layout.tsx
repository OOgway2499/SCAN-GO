import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Tag, BarChart3, Settings, LogOut, ShoppingCart, Menu, X } from 'lucide-react';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem('scango_admin_token');
    localStorage.removeItem('scango_admin_name');
    localStorage.removeItem('scango_admin_role');
    navigate('/login');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-bg relative">
      
      {/* Mobile Header (Visible only on small screens) */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-[16px] shadow-sm">
            🛒
          </div>
          <div className="text-t1 font-extrabold text-[16px] tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            ScanGo<span className="text-primary">.</span>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-t2 bg-elevated rounded-lg hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-[260px] flex-shrink-0 bg-surface border-r border-border-subtle flex flex-col
        transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-border-subtle shrink-0">
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
          <button 
            className="md:hidden p-2 text-t3 hover:text-white hover:bg-elevated rounded-lg transition-colors"
            onClick={closeMobileMenu}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1.5 custom-scrollbar">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 md:py-3 rounded-xl font-semibold text-[15px] md:text-[14px] transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
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
        <div className="p-4 border-t border-border-subtle shrink-0 bg-surface">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-elevated flex items-center justify-center text-t2 font-bold text-[14px] border border-border-subtle">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-t1 font-bold text-[13px] truncate">{userName}</div>
              <div className="text-success text-[11px] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> Online
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 md:py-2.5 rounded-xl text-t3 hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 transition-all text-[14px] md:text-[13px] font-bold"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-bg relative pt-16 md:pt-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
