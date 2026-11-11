import React from 'react';
import { useFinance } from '../../context/FinanceContext.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export const PendingBillsWidget: React.FC = () => {
  const { transactions, toggleTransactionStatus, setActiveTab } = useFinance();

  const pendingExpenses = transactions
    .filter(t => t.type === 'despesa' && (t.status === 'pendente' || t.status === 'atrasado'))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  if (pendingExpenses.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
          Todas as contas do mês estão em dia!
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Nenhuma despesa pendente ou em atraso para este período.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Contas a Pagar no Mês
          </h4>
          <span className="text-xs text-slate-500">
            {pendingExpenses.length} {pendingExpenses.length === 1 ? 'conta aguardando' : 'contas aguardando'} pagamento
          </span>
        </div>
        <button
          onClick={() => setActiveTab('expenses')}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          Ver todas <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5">
        {pendingExpenses.map(item => {
          const isOverdue = item.status === 'atrasado';

          return (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition ${
                isOverdue
                  ? 'bg-rose-500/5 border-rose-500/20 dark:bg-rose-950/20 dark:border-rose-800/40'
                  : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleTransactionStatus(item.id)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition ${
                    isOverdue
                      ? 'border-rose-400 text-rose-500 hover:bg-rose-500 hover:text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:text-emerald-500'
                  }`}
                  title="Marcar como Pago"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>Venc.: {formatDate(item.dueDate)}</span>
                    <span>•</span>
                    <span>{item.category}</span>
                    {isOverdue && (
                      <span className="text-rose-500 font-bold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> Atrasada
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                  {formatCurrency(item.amount)}
                </p>
                <button
                  onClick={() => toggleTransactionStatus(item.id)}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5"
                >
                  Pagar agora
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
