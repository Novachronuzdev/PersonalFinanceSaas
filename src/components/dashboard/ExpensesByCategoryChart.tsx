import React from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useFinance } from '../../context/FinanceContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { formatCurrency, formatPercent } from '../../utils/formatters.js';
import { PieChart as PieIcon } from 'lucide-react';

ChartJS.register(...registerables);

export const ExpensesByCategoryChart: React.FC = () => {
  const { transactions, categories } = useFinance();
  const { theme } = useTheme();

  // Filter only expenses for current view
  const expenses = transactions.filter(t => t.type === 'despesa');

  // Aggregate by category
  const categoryMap = new Map<string, number>();
  let totalExpenses = 0;

  for (const exp of expenses) {
    const current = categoryMap.get(exp.category) || 0;
    categoryMap.set(exp.category, current + exp.amount);
    totalExpenses += exp.amount;
  }

  const categoryEntries = Array.from(categoryMap.entries())
    .map(([name, amount]) => {
      const catObj = categories.find(c => c.name === name);
      return {
        name,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        color: catObj ? catObj.color : '#64748b'
      };
    })
    .sort((a, b) => b.amount - a.amount);

  if (categoryEntries.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <PieIcon className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Nenhuma despesa registrada neste mês
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Cadastre suas contas para visualizar a divisão dos seus gastos por categoria.
        </p>
      </div>
    );
  }

  const isDark = theme === 'dark';

  const data = {
    labels: categoryEntries.map(c => c.name),
    datasets: [
      {
        data: categoryEntries.map(c => c.amount),
        backgroundColor: categoryEntries.map(c => c.color),
        borderColor: isDark ? '#0f172a' : '#ffffff',
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 10,
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const val = context.raw || 0;
            const pct = totalExpenses > 0 ? ((val / totalExpenses) * 100).toFixed(1) : '0';
            return ` ${label}: ${formatCurrency(val)} (${pct}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Donut Canvas */}
      <div className="relative w-48 h-48 shrink-0">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total Gasto
          </span>
          <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
            {formatCurrency(totalExpenses)}
          </span>
        </div>
      </div>

      {/* Categories Legend with Bars */}
      <div className="w-full space-y-2 max-h-56 overflow-y-auto pr-1">
        {categoryEntries.slice(0, 6).map(item => (
          <div key={item.name} className="flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between font-medium">
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate max-w-[120px]">{item.name}</span>
              </span>
              <div className="flex items-center gap-2 font-mono">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(item.amount)}
                </span>
                <span className="text-slate-400 text-[11px] w-9 text-right">
                  {formatPercent(item.percentage)}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
