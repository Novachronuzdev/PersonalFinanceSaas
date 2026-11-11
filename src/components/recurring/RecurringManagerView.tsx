import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { RecurringRule, RecurrenceFrequency } from '../../types/finance.js';
import { Modal } from '../ui/Modal.js';
import { CurrencyInput } from '../ui/CurrencyInput.js';
import {
  Repeat,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  Clock,
  Sparkles
} from 'lucide-react';

export const RecurringManagerView: React.FC = () => {
  const {
    recurringRules,
    categories,
    createRecurringRule,
    updateRecurringRule,
    deleteRecurringRule
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('mensal');
  const [intervalMonths, setIntervalMonths] = useState(1);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [dueDay, setDueDay] = useState(10);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Delete modal state
  const [ruleToDelete, setRuleToDelete] = useState<RecurringRule | null>(null);
  const [deleteGeneratedItems, setDeleteGeneratedItems] = useState(false);

  const expenseCategories = categories.filter(c => c.type === 'despesa');

  const totalMonthlyCommitted = recurringRules
    .filter(r => r.active && r.type === 'despesa' && r.frequency === 'mensal')
    .reduce((sum, r) => sum + r.amount, 0);

  const handleOpenCreate = () => {
    setTitle('');
    setAmount(0);
    setCategory(expenseCategories[0]?.name || 'Moradia');
    setFrequency('mensal');
    setIntervalMonths(1);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setDueDay(10);
    setDescription('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    try {
      setLoading(true);
      await createRecurringRule({
        title: title.trim(),
        amount,
        type: 'despesa',
        category,
        frequency,
        intervalMonths: frequency === 'anual' ? 12 : intervalMonths,
        startDate,
        endDate: endDate || null,
        dueDay,
        description: description.trim(),
        active: true
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (rule: RecurringRule) => {
    await updateRecurringRule(rule.id, { active: !rule.active });
  };

  const handleConfirmDelete = async () => {
    if (!ruleToDelete) return;
    try {
      setLoading(true);
      await deleteRecurringRule(ruleToDelete.id, deleteGeneratedItems);
      setRuleToDelete(null);
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
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Repeat className="w-5 h-5" />
            </div>
            Despesas & Receitas Recorrentes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Automação de lançamentos fixos (aluguel, condomínio, internet, assinaturas e salários)
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Recorrência</span>
        </button>
      </div>

      {/* Highlights */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Comprometimento Fixo Mensal
          </span>
          <p className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            {formatCurrency(totalMonthlyCommitted)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Soma de todas as despesas mensais ativas lançadas automaticamente.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-800 dark:text-indigo-300 max-w-md">
          🛡️ <strong>Garantia de integridade:</strong> Ao editar ou excluir uma despesa do mês, o FinControl não altera automaticamente as outras parcelas da série, a não ser que você escolha explicitamente essa opção.
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recurringRules.map(rule => {
          const isExpense = rule.type === 'despesa';

          return (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition hover:shadow-md ${
                rule.active
                  ? 'border-slate-200/80 dark:border-slate-800'
                  : 'border-slate-200/50 dark:border-slate-800/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {rule.title}
                    </h3>
                  </div>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {rule.category}
                  </span>
                </div>

                <span className={`text-base font-black font-mono ${isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-teal-600 dark:text-teal-400'}`}>
                  {isExpense ? '-' : '+'}{formatCurrency(rule.amount)}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Periodicidade:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                    {rule.frequency === 'personalizada' ? `A cada ${rule.intervalMonths} meses` : rule.frequency}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Dia do Vencimento:</span>
                  <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                    Todo dia {rule.dueDay}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Início:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {formatDate(rule.startDate)}
                  </span>
                </div>

                {rule.endDate && (
                  <div className="flex items-center justify-between">
                    <span>Término:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {formatDate(rule.endDate)}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(rule)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition ${
                    rule.active
                      ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                      : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {rule.active ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{rule.active ? 'Ativa' : 'Pausada'}</span>
                </button>

                <button
                  onClick={() => {
                    setRuleToDelete(rule);
                    setDeleteGeneratedItems(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Excluir regra"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Recurring Rule Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Nova Despesa Recorrente"
          subtitle="Configure um pagamento fixo que se repete ao longo do tempo"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Nome da Despesa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Aluguel, Netflix, Internet..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CurrencyInput
                label="Valor (R$)"
                required
                value={amount}
                onChange={setAmount}
              />

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {expenseCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Frequência
                </label>
                <select
                  value={frequency}
                  onChange={e => setFrequency(e.target.value as RecurrenceFrequency)}
                  className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="mensal">Mensal (todos os meses)</option>
                  <option value="anual">Anual (uma vez ao ano)</option>
                  <option value="personalizada">Personalizada</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Dia do Vencimento
                </label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={dueDay}
                  onChange={e => setDueDay(parseInt(e.target.value) || 1)}
                  className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {frequency === 'personalizada' && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Intervalo em Meses
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={intervalMonths}
                  onChange={e => setIntervalMonths(parseInt(e.target.value) || 1)}
                  className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm font-semibold"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Data de Início
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Data de Término (Opcional)
                </label>
                <input
                  type="date"
                  placeholder="Sem término"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Observações
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ex: Contrato de 12 meses..."
                className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25"
              >
                {loading ? 'Salvando...' : 'Criar Recorrência'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Rule Confirmation Modal */}
      {ruleToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setRuleToDelete(null)}
          title="Remover Regra Recorrente"
          subtitle={`Deseja remover a regra "${ruleToDelete.title}"?`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              A regra não fará mais novos lançamentos futuros.
            </p>

            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <input
                type="checkbox"
                checked={deleteGeneratedItems}
                onChange={e => setDeleteGeneratedItems(e.target.checked)}
                className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                Apagar também todas as despesas já geradas por esta regra nos meses
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRuleToDelete(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/25"
              >
                {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
