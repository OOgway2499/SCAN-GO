import { create } from 'zustand';

interface SessionState {
  phone: string;
  sessionId: string;
  storeId: string;
  storeName: string;
  storeBranch: string;
  storeCode: string;
  isActive: boolean;
  setSession: (data: Partial<SessionState>) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  phone: '',
  sessionId: '',
  storeId: 'store_freshmart_hyd',  // Default demo store
  storeName: 'FreshMart',
  storeBranch: 'Kondapur, Hyderabad',
  storeCode: 'HYD-042',
  isActive: false,
  setSession: (data) => set((state) => ({ ...state, ...data })),
  clearSession: () =>
    set({
      phone: '',
      sessionId: '',
      isActive: false,
    }),
}));
