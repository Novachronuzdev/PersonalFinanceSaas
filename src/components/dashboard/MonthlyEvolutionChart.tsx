import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { useFinance } from '../../context/FinanceContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { api } from '../../services/api.js';
import { AnnualReport } from '../../types/finance.js';
import { formatCurrency, MONTH_SHORT_NAMES } from '../../utils/formatters.js';

ChartJS.register(...registerables);

export const MonthlyEvolutionChart: React.FC = () => {
  const { selectedYear, selectedMonth } = useFinance();
  const { theme } = useTheme();
  const [report, setReport] = useState<AnnualReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchAnnualData = async () => {
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
    fetchAnnualData();
    return () => {
      isMounted = false;
    };
  }, [selectedYear]);

  if (!report) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400">
        Carregando evolução financeira...
      </div>
    );
  }

  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';

  const labels = MONTH_SHORT_NAMES;
  const revenuesData = report.monthlyBreakdown.map(m => m.revenues);
  const expensesData = report.monthlyBreakdown.map(m => m.expenses);
  const balancesData = report.monthlyBreakdown.map(m => m.balance);

  const data = {
    labels,
    datasets: [
      {
        type: 'line' as const,
        label: 'Saldo Mensal',
        data: balancesData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2.5,
        tension: 0.35,
        pointBackgroundColor: '#10b981',
        pointHoverRadius: 6,
        pointRadius: 4,
        yAxisID: 'y',
        fill: false,
      },
      {
        type: 'bar' as const,
        label: 'Receitas',
        data: revenuesData,
        backgroundColor: isDark ? 'rgba(20, 184, 166, 0.65)' : 'rgba(13, 148, 136, 0.75)',
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: 'Despesas',
        data: expensesData,
        backgroundColor: isDark ? 'rgba(244, 63, 94, 0.65)' : 'rgba(225, 29, 72, 0.75)',
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
        yAxisID: 'y',
      }
    ]
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          color: textColor,
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          font: {
            size: 11,
            weight: '600',
            family: 'Plus Jakarta Sans'
          }
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        cornerRadius: 10,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const val = context.parsed.y;
            return ` ${label}: ${formatCurrency(val)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: textColor,
          font: {
            size: 11,
            family: 'Plus Jakarta Sans'
          }
        }
      },
      y: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
          font: {
            size: 11,
            family: 'Plus Jakarta Sans'
          },
          callback: (value: any) => `R$ ${value >= 1000 ? `${value / 1000}k` : value}`
        }
      }
    }
  };

  return (
    <div className="h-72 w-full">
      <Chart type="bar" data={data} options={options} />
    </div>
  );
};
