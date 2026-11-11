import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { api } from '../../services/api.js';
import { formatCurrency } from '../../utils/formatters.js';
import { CurrencyInput } from '../ui/CurrencyInput.js';
import { Modal } from '../ui/Modal.js';
import {
  Settings,
  User,
  Moon,
  Sun,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Plus,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Target
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    categories,
    refreshData,
    showToast
  } = useFinance();
  const { theme, toggleTheme } = useTheme();

  // Profile form
  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [savingsGoal, setSavingsGoal] = useState(userProfile?.monthlySavingsGoal || 2000);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // New Category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'despesa' | 'receita'>('despesa');
  const [newCatColor, setNewCatColor] = useState('#10b981');
  const [loadingCat, setLoadingCat] = useState(false);

  // Reset confirmation
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingProfile(true);
      await updateUserProfile({
        name: name.trim(),
        email: email.trim(),
        monthlySavingsGoal: savingsGoal
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      setLoadingCat(true);
      await api.createCategory({
        name: newCatName.trim(),
        type: newCatType,
        color: newCatColor,
        icon: 'Tag'
      });
      showToast('Categoria adicionada com sucesso!', 'success');
      await refreshData();
      setIsCategoryModalOpen(false);
      setNewCatName('');
    } catch (err) {
      showToast('Erro ao criar categoria', 'error');
    } finally {
      setLoadingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Deseja excluir esta categoria?')) {
      await api.deleteCategory(id);
      showToast('Categoria removida!', 'info');
      await refreshData();
    }
  };

  const handleBackupDownload = () => {
    window.location.href = api.getBackupDownloadUrl();
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await api.restoreBackup(json);
        showToast('Backup restaurado com sucesso!', 'success');
        await refreshData();
      } catch (err) {
        showToast('Arquivo de backup inválido!', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSampleData = async () => {
    try {
      setLoadingReset(true);
      await api.resetToSampleData();
      showToast('Dados de exemplo restaurados!', 'success');
      await refreshData();
      setResetModalOpen(false);
    } finally {
      setLoadingReset(false);
    }
  };

  const handleClearAll = async () => {
    try {
      setLoadingReset(true);
      await api.clearAllData();
      showToast('Todos os registros foram zerados!', 'info');
      await refreshData();
      setClearModalOpen(false);
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-500/10 text-slate-500 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          Configurações & Dados
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Personalização da conta, categorias de despesas, tema e segurança de dados
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Profile Form */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Perfil do Usuário</h3>
              <p className="text-xs text-slate-500">Informações pessoais e meta financeira</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold"
              />
            </div>

            <CurrencyInput
              label="Meta Mensal de Economia (R$)"
              value={savingsGoal}
              onChange={setSavingsGoal}
            />

            <button
              type="submit"
              disabled={loadingProfile}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition"
            >
              {loadingProfile ? 'Salvando...' : 'Salvar Perfil'}
            </button>
          </form>
        </div>

        {/* Appearance & Security */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Aparência & Interface</h3>
              <p className="text-xs text-slate-500">Alternância entre Modo Escuro e Claro</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Modo Escuro (Dark Mode)</p>
              <p className="text-xs text-slate-500">Visual sofisticado em tons grafite/slate</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition ${
                theme === 'dark'
                  ? 'bg-slate-800 text-amber-400 border-slate-700'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Currency Format Standard */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Padrão Monetário Brasileiro</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Todas as transações e orçamentos utilizam rigorosamente a notação oficial <strong>R$ 1.500,00</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Manager */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Categorias Cadastradas</h3>
              <p className="text-xs text-slate-500">Classificação para despesas e receitas</p>
            </div>
          </div>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5" /> Nova Categoria
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {cat.name}
                </span>
              </div>
              {cat.isCustom && (
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-slate-400 hover:text-rose-500 ml-1 p-0.5"
                  title="Excluir categoria"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Backup, Restore & Reset */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Backup e Persistência de Dados</h3>
            <p className="text-xs text-slate-500">Seus dados ficam salvos em disco mesmo fechando o navegador</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Export JSON */}
          <button
            onClick={handleBackupDownload}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col items-center justify-center text-center gap-2 transition"
          >
            <Download className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Baixar Backup JSON</span>
            <span className="text-[10px] text-slate-400">Download seguro do banco completo</span>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition">
            <Upload className="w-5 h-5 text-cyan-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Restaurar Backup</span>
            <span className="text-[10px] text-slate-400">Carregar arquivo .json do computador</span>
            <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
          </label>

          {/* Reset to Samples */}
          <button
            onClick={() => setResetModalOpen(true)}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col items-center justify-center text-center gap-2 transition"
          >
            <RefreshCw className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Restaurar Exemplo</span>
            <span className="text-[10px] text-slate-400">Recarrega dados realistas de 2025/2026</span>
          </button>

          {/* Clear all */}
          <button
            onClick={() => setClearModalOpen(true)}
            className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 flex flex-col items-center justify-center text-center gap-2 transition"
          >
            <Trash2 className="w-5 h-5 text-rose-500" />
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Zerar Todos os Dados</span>
            <span className="text-[10px] text-rose-400">Começar do zero absoluto</span>
          </button>
        </div>
      </div>

      {/* Create Category Modal */}
      {isCategoryModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCategoryModalOpen(false)}
          title="Nova Categoria"
          subtitle="Cadastre uma categoria personalizada"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nome da Categoria</label>
              <input
                type="text"
                required
                placeholder="Ex: Viagens, Pets, Cursos..."
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tipo</label>
              <select
                value={newCatType}
                onChange={e => setNewCatType(e.target.value as any)}
                className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
              >
                <option value="despesa">Despesa (Saída)</option>
                <option value="receita">Receita (Entrada)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cor de Identificação</label>
              <input
                type="color"
                value={newCatColor}
                onChange={e => setNewCatColor(e.target.value)}
                className="w-full mt-1 h-10 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loadingCat}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md"
              >
                {loadingCat ? 'Criando...' : 'Adicionar Categoria'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset to Sample Modal */}
      {resetModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setResetModalOpen(false)}
          title="Restaurar Dados de Exemplo?"
          subtitle="Esta ação recarregará os dados completos de demonstração (2025 e 2026)"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Os lançamentos atuais serão substituídos pelos dados de exemplo padrão.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetSampleData}
                disabled={loadingReset}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl"
              >
                {loadingReset ? 'Restaurando...' : 'Confirmar Restauração'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Clear all modal */}
      {clearModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setClearModalOpen(false)}
          title="Zerar Absolutamente Tudo?"
          subtitle="Atenção: todos os lançamentos, despesas e receitas serão apagados."
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-rose-500 font-semibold">
              Esta ação deixará seu sistema zerado para você começar a cadastrar do zero absoluto.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setClearModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleClearAll}
                disabled={loadingReset}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md"
              >
                {loadingReset ? 'Zerando...' : 'Sim, Zerar Tudo'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
