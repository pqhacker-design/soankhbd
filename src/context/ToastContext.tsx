import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    if (!message) return;
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((prev) => {
      // Avoid exact duplicate toasts showing simultaneously
      if (prev.some((t) => t.message === message)) return prev;
      return [...prev, { id, message, type }];
    });

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const toast = {
    success: (msg: string) => showToast(msg, 'success'),
    error: (msg: string) => showToast(msg, 'error'),
    warning: (msg: string) => showToast(msg, 'warning'),
    info: (msg: string) => showToast(msg, 'info'),
  };

  // Attach global fallback window.showAppToast
  useEffect(() => {
    (window as any).showAppToast = (msg: string, type: ToastType = 'info') => {
      showToast(msg, type);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all animate-fadeIn ${
              t.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-100 dark:bg-emerald-950/90 dark:border-emerald-600'
                : t.type === 'error'
                ? 'bg-slate-900/95 border-rose-500/50 text-rose-100 dark:bg-rose-950/90 dark:border-rose-600'
                : t.type === 'warning'
                ? 'bg-slate-900/95 border-amber-500/50 text-amber-100 dark:bg-amber-950/90 dark:border-amber-600'
                : 'bg-slate-900/95 border-blue-500/50 text-blue-100 dark:bg-blue-950/90 dark:border-blue-600'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {t.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs font-semibold leading-relaxed break-words">{t.message}</div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return fallback if used outside provider
    return {
      showToast: (msg: string, type: ToastType = 'info') => {
        if ((window as any).showAppToast) {
          (window as any).showAppToast(msg, type);
        } else {
          console.log(`[Toast ${type}]: ${msg}`);
        }
      },
      toast: {
        success: (msg: string) => (window as any).showAppToast?.(msg, 'success'),
        error: (msg: string) => (window as any).showAppToast?.(msg, 'error'),
        warning: (msg: string) => (window as any).showAppToast?.(msg, 'warning'),
        info: (msg: string) => (window as any).showAppToast?.(msg, 'info'),
      },
    };
  }
  return context;
};
