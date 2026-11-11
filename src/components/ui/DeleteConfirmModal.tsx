import React, { useState } from 'react';
import { Modal } from './Modal.js';
import { useFinance } from '../../context/FinanceContext.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { AlertCircle, Trash2 } from 'lucide-react';

export const DeleteConfirmModal: React.FC = () => {
  const { deleteConfirmModal, setDeleteConfirmModal, deleteTransaction } = useFinance();
  const { open, transaction } = deleteConfirmModal;
  const [scope, setScope] = useState<'single' | 'future' | 'all'>('single');
  const [loading, setLoading] = useState(false);

  if (!transaction) return null;

  const isRecurring = !!transaction.recurrenceId;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await deleteTransaction(transaction.id, isRecurring ? scope : 'single');
      setDeleteConfirmModal({ open: false, transaction: null });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDeleteConfirmModal({ open: false, transaction: null });
  };

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title="Confirmar Exclusão"
      subtitle="Esta ação não poderá ser desfeita"
    >
      <div className="space-y-5">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-rose-600 dark:text-rose-400">
              {transaction.title} - {formatCurrency(transaction.amount)}
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Vencimento: {formatDate(transaction.dueDate)} • Categoria: {transaction.category}
            </p>
          </div>
        </div>

        {isRecurring && (
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Este item faz parte de uma despesa recorrente. O que você deseja excluir?
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
                <input
                  type="radio"
                  name="delete-scope"
                  checked={scope === 'single'}
                  onChange={() => setScope('single')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Apenas esta ocorrência
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Remove apenas a despesa do mês atual. Os outros meses permanecem intocados.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
                <input
                  type="radio"
                  name="delete-scope"
                  checked={scope === 'future'}
                  onChange={() => setScope('future')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Esta e todas as ocorrências futuras
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Preserva o histórico dos meses anteriores e remove este mês em diante.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
                <input
                  type="radio"
                  name="delete-scope"
                  checked={scope === 'all'}
                  onChange={() => setScope('all')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                    Todas as ocorrências (toda a série)
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Apaga todas as despesas vinculadas a esta recorrência em todos os anos.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/25 flex items-center gap-2 transition"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? 'Excluindo...' : 'Excluir definitivamente'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
