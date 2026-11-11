import React, { useState } from 'react';
import { Modal } from './Modal.js';
import { useFinance } from '../../context/FinanceContext.js';
import { Calendar, Plus } from 'lucide-react';

export const AddYearModal: React.FC = () => {
  const { isAddYearModalOpen, setIsAddYearModalOpen, years, addNewYear } = useFinance();
  const nextRecommendedYear = Math.max(...years, new Date().getFullYear()) + 1;
  const [yearInput, setYearInput] = useState<number>(nextRecommendedYear);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (years.includes(yearInput)) {
      setError(`O ano ${yearInput} já está cadastrado no sistema.`);
      return;
    }
    if (yearInput < 2000 || yearInput > 2100) {
      setError('Por favor insira um ano válido entre 2000 e 2100.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await addNewYear(yearInput);
      setIsAddYearModalOpen(false);
    } catch (err) {
      setError('Erro ao adicionar ano.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isAddYearModalOpen}
      onClose={() => setIsAddYearModalOpen(false)}
      title="Adicionar Novo Ano"
      subtitle="Cadastre um novo ano mantendo todo o histórico anterior intacto"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Ano de Referência
          </label>
          <div className="relative mt-1.5">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="number"
              min={2000}
              max={2100}
              value={yearInput}
              onChange={e => {
                setYearInput(parseInt(e.target.value) || 0);
                setError(null);
              }}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-lg font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          {error && <p className="text-xs text-rose-500 mt-1.5">{error}</p>}
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs">
          💡 Ao adicionar o ano <strong>{yearInput}</strong>, todos os 12 meses (Janeiro a Dezembro) ficarão disponíveis para controle financeiro individual e relatórios consolidados.
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setIsAddYearModalOpen(false)}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            {loading ? 'Adicionando...' : 'Adicionar Ano'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
