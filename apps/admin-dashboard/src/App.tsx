import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useUiStore } from './stores/uiStore';
import Layout from './components/Layout';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const StaffPage = lazy(() => import('./pages/StaffPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));

function Toasts() {
  const toasts = useUiStore((s) => s.toasts);
  if (!toasts.length) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg font-medium text-[14px] shadow-lg flex items-center gap-2 animate-fade-in ${
            t.type === 'err' ? 'bg-danger text-white' : 
            t.type === 'warn' ? 'bg-warning text-[#111]' : 
            'bg-surface border border-border-subtle text-white'
          }`}
        >
          {t.type === 'ok' && <span className="text-success">✓</span>}
          {t.type === 'warn' && <span>⚠️</span>}
          {t.type === 'err' && <span>✕</span>}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// Simple Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('scango_admin_token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-t1 font-display">
      <Toasts />
      
      <Suspense fallback={<div className="min-h-screen bg-bg flex items-center justify-center text-primary font-bold">Scanning secure connection...</div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="offers" element={<PlaceholderPage title="Offers & Discounts" />} />
            <Route path="reports" element={<PlaceholderPage title="Analytics & Reports" />} />
            <Route path="settings" element={<PlaceholderPage title="Store Settings" />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
