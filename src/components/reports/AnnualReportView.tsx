import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { api } from '../../services/api.js';
import { AnnualReport, YearComparison } from '../../types/finance.js';
import { formatCurrency, formatPercent, getMonthName, MONTH_NAMES } from '../../utils/formatters.js';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  Printer,
  Sparkles,
  PieChart as PieIcon,
  Flame,
  Award
} from 'lucide-react';

ChartJS.register(...registerables);

export const AnnualReportView: React.FC = () => {
  const { selectedYear, setSelectedYear, years } = useFinance();
  const { theme } = useTheme();

  const [activeSubTab, setActiveSubTab] = useState<'annual' | 'compare'>('annual');
  const [report, setReport] = useState<AnnualReport | null>(null);
  const [loading, setLoading] = useState(false);

  // Comparison states
  const [compareYear1, setCompareYear1] = useState<number>(() => {
    return years.includes(selectedYear - 1) ? selectedYear - 1 : selectedYear;
  });
  const [compareYear2, setCompareYear2] = useState<number>(selectedYear);
  const [comparison, setComparison] = useState<YearComparison | null>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  // Load single year report
  useEffect(() => {
    let isMounted = true;
    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await api.getAnnualReport(selectedYear);
        if (isMounted) setReport(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchReport();
    return () => {
      isMounted = false;
    };
  }, [selectedYear]);

  // Load comparison report
  useEffect(() => {
    if (activeSubTab !== 'compare') return;
    let isMounted = true;
    const fetchComparison = async () => {
      try {
        setLoadingCompare(true);
        const data = await api.getYearComparison(compareYear1, compareYear2);
        if (isMounted) setComparison(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoadingCompare(false);
      }
    };
    fetchComparison();
    return () => {
      isMounted = false;
    };
  }, [compareYear1, compareYear2, activeSubTab]);

  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';

  // Chart 1: 12 Months Evolution
  const evolutionChartData = report ? {
    labels: MONTH_NAMES.map(m => m.slice(0, 3)),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Receitas',
        data: report.monthlyBreakdown.map(m => m.revenues),
        backgroundColor: 'rgba(20, 184, 166, 0.75)',
        borderRadius: 6,
      },
      {
        type: 'bar' as const,
        label: 'Despesas',
        data: report.monthlyBreakdown.map(m => m.expenses),
        backgroundColor: 'rgba(244, 63, 94, 0.75)',
        borderRadius: 6,
      }
    ]
  } : null;

  // Chart 2: Category distribution
  const categoryChartData = report && report.categoryBreakdown.length > 0 ? {
    labels: report.categoryBreakdown.map(c => c.category),
    datasets: [
      {
        data: report.categoryBreakdown.map(c => c.amount),
        backgroundColor: report.categoryBreakdown.map(c => c.color),
        borderColor: isDark ? '#0f172a' : '#ffffff',
        borderWidth: 2
      }
    ]
  } : null;

  // Comparison Chart Data
  const comparisonChartData = comparison ? {
    labels: MONTH_NAMES.map(m => m.slice(0, 3)),
    datasets: [
      {
        label: `Despesas ${comparison.year1}`,
        data: comparison.monthlyComparison.map(m => m.year1Expenses),
        backgroundColor: 'rgba(99, 102, 241, 0.75)',
        borderRadius: 6,
      },
      {
        label: `Despesas ${comparison.year2}`,
        data: comparison.monthlyComparison.map(m => m.year2Expenses),
        backgroundColor: 'rgba(244, 63, 94, 0.75)',
        borderRadius: 6,
      }
    ]
  } : null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            Relatórios Anuais
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Análise consolidada de desempenho financeiro e comparativo entre anos
          </p>
        </div>

        {/* Tab switcher: Relatório Consolidado vs Comparativo */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('annual')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeSubTab === 'annual'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Relatório Anual
            </button>
            <button
              onClick={() => setActiveSubTab('compare')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeSubTab === 'compare'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Comparar 2 Anos
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition"
            title="Imprimir relatório"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VIEW 1: ANNUAL CONSOLIDATED REPORT */}
      {activeSubTab === 'annual' && report && (
        <div className="space-y-6">
          {/* Year selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Ano em Análise:</span>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-emerald-600 dark:text-emerald-400 focus:outline-none cursor-pointer"
            >
              {years.map(yr => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* KPI Cards Required in Item 7 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Receitas */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total de Receitas</span>
              <p className="text-xl font-black font-mono text-teal-600 dark:text-teal-400 mt-1">
                {formatCurrency(report.totalRevenues)}
              </p>
              <span className="text-xs text-slate-500">Média de {formatCurrency(report.monthlyAverageRevenues)}/mês</span>
            </div>

            {/* Total Despesas */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total de Despesas</span>
              <p className="text-xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
                {formatCurrency(report.totalExpenses)}
              </p>
              <span className="text-xs text-slate-500">Média de {formatCurrency(report.monthlyAverageExpenses)}/mês</span>
            </div>

            {/* Saldo Acumulado */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase text-slate-400">Saldo Acumulado</span>
              <p className={`text-xl font-black font-mono mt-1 ${report.accumulatedBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatCurrency(report.accumulatedBalance)}
              </p>
              <span className="text-xs text-slate-500">Resultado anual</span>
            </div>

            {/* Categoria Top 1 */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase text-slate-400">Categoria Mais Consumida</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1 truncate">
                {report.topExpenseCategory.category}
              </p>
              <span className="text-xs text-rose-500 font-semibold font-mono">
                {formatCurrency(report.topExpenseCategory.amount)} ({report.topExpenseCategory.percentage}%)
              </span>
            </div>
          </div>

          {/* Extremes Cards: Mês com Maior Gasto & Menor Gasto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400">Mês com Maior Gasto</span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {getMonthName(report.highestExpenseMonth.month)}
                  </h4>
                </div>
              </div>
              <p className="text-lg font-black font-mono text-rose-600 dark:text-rose-400">
                {formatCurrency(report.highestExpenseMonth.amount)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400">Mês com Menor Gasto</span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {getMonthName(report.lowestExpenseMonth.month)}
                  </h4>
                </div>
              </div>
              <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(report.lowestExpenseMonth.amount)}
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
                Evolução Financeira durante os 12 Meses de {selectedYear}
              </h3>
              {evolutionChartData && (
                <div className="h-64">
                  <Bar
                    data={evolutionChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: { grid: { display: false }, ticks: { color: textColor } },
                        y: { grid: { color: gridColor }, ticks: { color: textColor } }
                      },
                      plugins: { legend: { labels: { color: textColor } } }
                    }}
                  />
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                Divisão por Categorias no Ano
              </h3>
              {categoryChartData ? (
                <div className="h-60 relative">
                  <Doughnut
                    data={categoryChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '65%',
                      plugins: { legend: { display: false } }
                    }}
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-10">Sem despesas registradas no ano</p>
              )}
            </div>
          </div>

          {/* 12 Months Detailed Table */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              Tabela Analítica Mês a Mês ({selectedYear})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950/60 uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Mês</th>
                    <th className="py-2.5 px-3 text-right">Receitas</th>
                    <th className="py-2.5 px-3 text-right">Despesas</th>
                    <th className="py-2.5 px-3 text-right">Saldo do Mês</th>
                    <th className="py-2.5 px-3 text-right">Margem / Poupança</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {report.monthlyBreakdown.map(item => {
                    const margin = item.revenues > 0
                      ? Math.round(((item.revenues - item.expenses) / item.revenues) * 100)
                      : 0;

                    return (
                      <tr key={item.month} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          {item.monthName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-teal-600 dark:text-teal-400">
                          {formatCurrency(item.revenues)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-600 dark:text-rose-400">
                          {formatCurrency(item.expenses)}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono font-bold ${item.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {formatCurrency(item.balance)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                          {margin}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: COMPARISON BETWEEN TWO YEARS */}
      {activeSubTab === 'compare' && (
        <div className="space-y-6">
          {/* Year comparison selectors */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Primeiro Ano:</span>
              <select
                value={compareYear1}
                onChange={e => setCompareYear1(Number(e.target.value))}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-indigo-500 cursor-pointer"
              >
                {years.map(yr => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-sm font-black text-slate-400">VS</span>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Segundo Ano:</span>
              <select
                value={compareYear2}
                onChange={e => setCompareYear2(Number(e.target.value))}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-rose-500 cursor-pointer"
              >
                {years.map(yr => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {comparison && (
            <>
              {/* Variance KPI cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Variação de Receitas</span>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-lg font-black font-mono text-slate-900 dark:text-white">
                      {formatCurrency(comparison.metrics.year1Revenues)} → {formatCurrency(comparison.metrics.year2Revenues)}
                    </p>
                  </div>
                  <span className={`text-xs font-bold flex items-center gap-0.5 mt-1 ${comparison.metrics.revenueDiffPercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {comparison.metrics.revenueDiffPercent >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {comparison.metrics.revenueDiffPercent > 0 ? '+' : ''}{comparison.metrics.revenueDiffPercent}% no período
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Variação de Despesas</span>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-lg font-black font-mono text-slate-900 dark:text-white">
                      {formatCurrency(comparison.metrics.year1Expenses)} → {formatCurrency(comparison.metrics.year2Expenses)}
                    </p>
                  </div>
                  <span className={`text-xs font-bold flex items-center gap-0.5 mt-1 ${comparison.metrics.expenseDiffPercent <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {comparison.metrics.expenseDiffPercent > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {comparison.metrics.expenseDiffPercent > 0 ? '+' : ''}{comparison.metrics.expenseDiffPercent}% gastos
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Variação do Saldo</span>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-lg font-black font-mono text-slate-900 dark:text-white">
                      {formatCurrency(comparison.metrics.year1Balance)} → {formatCurrency(comparison.metrics.year2Balance)}
                    </p>
                  </div>
                  <span className={`text-xs font-bold flex items-center gap-0.5 mt-1 ${comparison.metrics.balanceDiffPercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {comparison.metrics.balanceDiffPercent >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {comparison.metrics.balanceDiffPercent > 0 ? '+' : ''}{comparison.metrics.balanceDiffPercent}% de saldo
                  </span>
                </div>
              </div>

              {/* Comparison Chart */}
              {comparisonChartData && (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
                    Comparativo Mensal de Despesas: {comparison.year1} vs {comparison.year2}
                  </h3>
                  <div className="h-64">
                    <Bar
                      data={comparisonChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: { grid: { display: false }, ticks: { color: textColor } },
                          y: { grid: { color: gridColor }, ticks: { color: textColor } }
                        },
                        plugins: { legend: { labels: { color: textColor } } }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Side-by-side table */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                  Comparação Detalhada Mês a Mês
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950/60 uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Mês</th>
                        <th className="py-2.5 px-3 text-right">Gastos {comparison.year1}</th>
                        <th className="py-2.5 px-3 text-right">Gastos {comparison.year2}</th>
                        <th className="py-2.5 px-3 text-right">Diferença (R$)</th>
                        <th className="py-2.5 px-3 text-right">Variação %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {comparison.monthlyComparison.map(m => {
                        const diff = m.year2Expenses - m.year1Expenses;
                        const pct = m.year1Expenses > 0 ? Math.round((diff / m.year1Expenses) * 1000) / 10 : 0;

                        return (
                          <tr key={m.month} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                              {m.monthName}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                              {formatCurrency(m.year1Expenses)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                              {formatCurrency(m.year2Expenses)}
                            </td>
                            <td className={`py-2.5 px-3 text-right font-mono font-bold ${diff <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                            </td>
                            <td className={`py-2.5 px-3 text-right font-mono font-bold ${pct <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {pct > 0 ? '+' : ''}{pct}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
