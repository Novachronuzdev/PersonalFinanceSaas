import React from 'react';
import { useFinance } from '../../context/FinanceContext.js';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useFinance();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-700/50 dark:bg-emerald-950/90 dark:text-emerald-100 dark:border-emerald-600/40'
                : isError
                ? 'bg-rose-950/90 text-rose-100 border-rose-700/50 dark:bg-rose-950/90 dark:text-rose-100 dark:border-rose-600/40'
                : 'bg-slate-900/90 text-slate-100 border-slate-700/50 dark:bg-slate-800/90 dark:text-slate-100 dark:border-slate-700/60'
            }`}
          >
            <div className="flex items-center gap-3">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              {isError && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-cyan-400 shrink-0" />}
              <span className="text-sm font-medium leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
