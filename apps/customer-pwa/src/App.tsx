import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUiStore } from './stores/uiStore';
import Toasts from './components/Toasts';
import SplashScreen from './components/SplashScreen';
import EntryScreen from './screens/EntryScreen';
import ShoppingScreen from './screens/ShoppingScreen';
import PaymentScreen from './screens/PaymentScreen';
import ReceiptScreen from './screens/ReceiptScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import GuardLoginScreen from './screens/guard/GuardLoginScreen';
import GuardDashboard from './screens/guard/GuardDashboard';

export default function App() {
  const toasts = useUiStore((s) => s.toasts);
  const [splashDone, setSplashDone] = useState(false);

  return (
    <div className="min-h-screen bg-bg font-display text-t1 relative overflow-x-hidden">
      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
      <Toasts list={toasts} />
      
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<EntryScreen />} />
        <Route path="/shopping" element={<ShoppingScreen />} />
        <Route path="/payment" element={<PaymentScreen />} />
        <Route path="/receipt/:receiptId" element={<ReceiptScreen />} />
        <Route path="/orders" element={<OrderHistoryScreen />} />
        
        {/* Guard Routes */}
        <Route path="/guard" element={<GuardLoginScreen />} />
        <Route path="/guard/dashboard" element={<GuardDashboard />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

