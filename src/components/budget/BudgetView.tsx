import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext.js';
import { formatCurrency, formatPercent, getMonthName } from '../../utils/formatters.js';
import { Modal } from '../ui/Modal.js';
import { CurrencyInput } from '../ui/CurrencyInput.js';
import {
  PieChart,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Wallet,
  Sparkles
} from 'lucide-react';

export const BudgetView: React.FC = () => {
  const {
    selectedMonth,
    selectedYear,
    summary,
    transactions,
    categories,
    budgets,
    setBudget
  } = useFinance();

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const monthName = getMonthName(selectedMonth);
  const expenseCategories = categories.filter(c => c.type === 'despesa');

  // Compute expenses realized per category
  const expenses = transactions.filter(t => t.type === 'despesa');
  const actualByCategory = new Map<string, number>();

  for (const exp of expenses) {
    const cur = actualByCategory.get(exp.category) || 0;
    actualByCategory.set(exp.category, cur + exp.amount);
  }

  // Combine category budgets with actual spending
  const budgetItems = expenseCategories.map(cat => {
    const budgetObj = budgets.find(b => b.category === cat.name);
    const planned = budgetObj ? budgetObj.plannedAmount : 0;
    const actual = actualByCategory.get(cat.name) || 0;
    const diff = planned - actual;
    const percent = planned > 0 ? (actual / planned) * 100 : (actual > 0 ? 100 : 0);

    return {
      category: cat.name,
      color: cat.color,
      icon: cat.icon,
      planned,
      actual,
      diff,
      percent: Math.min(Math.round(percent * 10) / 10, 999),
      isOver: actual > planned && planned > 0,
      isWarning: percent >= 80 && actual <= planned
    };
  });

  // Calculate totals
  const totalRevenues = summary ? summary.totalRevenues : 0;
  const totalPlanned = budgetItems.reduce((acc, item) => acc + item.planned, 0);
  const totalActual = summary ? summary.totalExpenses : 0;
  const totalDiff = totalPlanned - totalActual;
  const overallPercent = totalPlanned > 0
    ? Math.min(Math.round((totalActual / totalPlanned) * 1000) / 10, 999)
    : 0;

  const isGlobalOverbudget = totalActual > totalPlanned && totalPlanned > 0;

  const handleOpenEdit = (catName: string, currentPlanned: number) => {
    setEditingCategory(catName);
    setBudgetAmount(currentPlanned);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      setLoading(true);
      await setBudget(editingCategory, budgetAmount);
      setEditingCategory(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
            Planejamento & Orçamento Mensal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Estabeleça metas de gastos para {monthName} de {selectedYear} e evite surpresas
          </p>
        </div>
      </div>

      {/* Global Alert if over budget */}
      {isGlobalOverbudget && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 flex items-center gap-3.5 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">
              ALERTA CRÍTICO: Orçamento Mensal Ultrapassado!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Seus gastos reais atingiram <strong>{formatCurrency(totalActual)}</strong>, ultrapassando o teto planejado de {formatCurrency(totalPlanned)} em{' '}
              <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(Math.abs(totalDiff))} ({overallPercent}%)</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Prevista */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400">Receita Prevista</span>
          <p className="text-xl font-black font-mono text-teal-600 dark:text-teal-400 mt-1">
            {formatCurrency(totalRevenues)}
          </p>
          <span className="text-xs text-slate-500">Base disponível</span>
        </div>

        {/* Despesas Planejadas */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400">Teto Planejado</span>
          <p className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalPlanned)}
          </p>
          <span className="text-xs text-slate-500">Soma dos limites por categoria</span>
        </div>

        {/* Despesas Realizadas */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-rose-500">Gasto Realizado</span>
          <p className="text-xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(totalActual)}
          </p>
          <span className="text-xs text-slate-500">{overallPercent}% do teto consumido</span>
        </div>

        {/* Saldo Disponível no Orçamento */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400">
            {totalDiff >= 0 ? 'Saldo Restante no Orçamento' : 'Estouro do Orçamento'}
          </span>
          <p className={`text-xl font-black font-mono mt-1 ${totalDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurrency(totalDiff)}
          </p>
          <span className="text-xs text-slate-500">
            {totalDiff >= 0 ? 'Folga restante para gastar' : 'Excedeu a meta estipulada'}
          </span>
        </div>
      </div>

      {/* Overall Budget Progress Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700 dark:text-slate-300">
            Progresso Geral do Orçamento ({monthName})
          </span>
          <span className={`font-mono font-bold ${overallPercent > 100 ? 'text-rose-500' : overallPercent > 80 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {overallPercent}% consumido
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallPercent > 100 ? 'bg-rose-500' : overallPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(overallPercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Gasto até agora: {formatCurrency(totalActual)}</span>
          <span>Limite planejado: {formatCurrency(totalPlanned)}</span>
        </div>
      </div>

      {/* Category Budget Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Limites e Acompanhamento por Categoria
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetItems.map(item => {
            const hasPlanned = item.planned > 0;

            return (
              <div
                key={item.category}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition hover:shadow-md ${
                  item.isOver
                    ? 'border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/10'
                    : item.isWarning
                    ? 'border-amber-500/40'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Category Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.category}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(item.category, item.planned)}
                    className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Definir teto orçamentário"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Values */}
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Planejado (Teto):</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
                      {hasPlanned ? formatCurrency(item.planned) : 'Não definido'}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Realizado (Gasto):</span>
                    <span className="font-bold font-mono text-rose-600 dark:text-rose-400">
                      {formatCurrency(item.actual)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <span>{item.diff >= 0 ? 'Disponível:' : 'Estourou em:'}</span>
                    <span className={`font-bold font-mono ${item.diff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {formatCurrency(Math.abs(item.diff))}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                {hasPlanned && (
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold">
                      <span className="text-slate-400">Consumo</span>
                      <span className={item.isOver ? 'text-rose-500 font-bold' : item.isWarning ? 'text-amber-500' : 'text-emerald-500'}>
                        {item.percent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.isOver ? 'bg-rose-500' : item.isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(item.percent, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Status Badges */}
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  {item.isOver ? (
                    <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Limite estourado!
                    </span>
                  ) : item.isWarning ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Atenção (&gt; 80%)
                    </span>
                  ) : hasPlanned ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Dentro do limite
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Sem limite estipulado</span>
                  )}

                  <button
                    onClick={() => handleOpenEdit(item.category, item.planned)}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {hasPlanned ? 'Ajustar' : 'Definir'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Set Budget Modal */}
      {editingCategory && (
        <Modal
          isOpen={true}
          onClose={() => setEditingCategory(null)}
          title={`Definir Orçamento: ${editingCategory}`}
          subtitle={`Estabeleça o teto máximo de gastos para ${editingCategory} em ${monthName} de ${selectedYear}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveBudget} className="space-y-4">
            <CurrencyInput
              label="Teto Planejado (R$)"
              required
              autoFocus
              value={budgetAmount}
              onChange={setBudgetAmount}
            />

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              💡 Você receberá alertas visuais e avisos quando suas despesas nesta categoria atingirem 80% e 100% do valor definido.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/25"
              >
                {loading ? 'Salvando...' : 'Salvar Teto'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
