import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface Banner {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface Modal {
  id: string;
  type: 'confirm' | 'alert' | 'custom';
  title?: string;
  message?: string;
  component?: React.ComponentType<any>;
  props?: any;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ErrorDisplay {
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface UIState {
  // Loading states
  isLoading: boolean;
  loadingMessage: string | null;
  
  // Toast notifications
  toasts: Toast[];
  
  // Banners
  banners: Banner[];
  
  // Modals
  activeModal: Modal | null;
  
  // Error display
  error: ErrorDisplay | null;
  
  // Network status
  isOnline: boolean;
  
  // Tab bar visibility
  isTabBarVisible: boolean;
  
  // Actions
  setLoading: (isLoading: boolean, message?: string) => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showBanner: (banner: Omit<Banner, 'id'>) => void;
  removeBanner: (id: string) => void;
  showModal: (modal: Omit<Modal, 'id'>) => void;
  hideModal: () => void;
  showError: (error: ErrorDisplay) => void;
  clearError: () => void;
  setOnline: (isOnline: boolean) => void;
  setTabBarVisible: (isVisible: boolean) => void;
  reset: () => void;
}

const initialState = {
  isLoading: false,
  loadingMessage: null,
  toasts: [],
  banners: [],
  activeModal: null,
  error: null,
  isOnline: true,
  isTabBarVisible: true,
};

export const uiStore = create<UIState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    
    setLoading: (isLoading, message) => 
      set({ 
        isLoading, 
        loadingMessage: message || null,
      }),
    
    showToast: (toast) => {
      const id = Date.now().toString();
      const newToast = { ...toast, id };
      
      set(state => ({
        toasts: [...state.toasts, newToast],
      }));
      
      // Auto-remove toast after duration
      if (toast.duration !== 0) {
        setTimeout(() => {
          get().removeToast(id);
        }, toast.duration || 3000);
      }
    },
    
    removeToast: (id) =>
      set(state => ({
        toasts: state.toasts.filter(t => t.id !== id),
      })),
    
    showBanner: (banner) => {
      const id = Date.now().toString();
      set(state => ({
        banners: [...state.banners, { ...banner, id }],
      }));
    },
    
    removeBanner: (id) =>
      set(state => ({
        banners: state.banners.filter(b => b.id !== id),
      })),
    
    showModal: (modal) =>
      set({
        activeModal: { ...modal, id: Date.now().toString() },
      }),
    
    hideModal: () =>
      set({ activeModal: null }),
    
    showError: (error) =>
      set({ error }),
    
    clearError: () =>
      set({ error: null }),
    
    setOnline: (isOnline) =>
      set({ isOnline }),
    
    setTabBarVisible: (isTabBarVisible) =>
      set({ isTabBarVisible }),
    
    reset: () => set(initialState),
  }))
);

// Selectors
export const selectIsLoading = (state: UIState) => state.isLoading;
export const selectToasts = (state: UIState) => state.toasts;
export const selectBanners = (state: UIState) => state.banners;
export const selectActiveModal = (state: UIState) => state.activeModal;
export const selectError = (state: UIState) => state.error;
export const selectIsOnline = (state: UIState) => state.isOnline; 