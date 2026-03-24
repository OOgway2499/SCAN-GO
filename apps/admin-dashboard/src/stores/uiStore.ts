import { create } from 'zustand';

export type ToastType = 'ok' | 'warn' | 'err';

export interface Toast {
  id: number;
  msg: string;
  type: ToastType;
}

interface UiState {
  toasts: Toast[];
  pushToast: (msg: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  toasts: [],
  pushToast: (msg, type = 'ok') => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, msg, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
