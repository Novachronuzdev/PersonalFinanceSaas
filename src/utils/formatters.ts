// Format monetary values to Brazilian Real (e.g., R$ 1.500,00)
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Format date to Brazilian format (DD/MM/AAAA)
export function formatDate(dateString?: string | null): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

// Format percentage (e.g., 42,5%)
export function formatPercent(value: number): string {
  if (isNaN(value)) return '0%';
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
}

// Month names in Portuguese
export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

export const MONTH_SHORT_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export function getMonthName(monthNumber: number): string {
  return MONTH_NAMES[monthNumber - 1] || `Mês ${monthNumber}`;
}

export function getMonthShortName(monthNumber: number): string {
  return MONTH_SHORT_NAMES[monthNumber - 1] || `M${monthNumber}`;
}

// Parse string like "R$ 1.500,50" or "1500,50" into number 1500.5
export function parseCurrencyInput(value: string): number {
  if (!value) return 0;
  // Remove R$, spaces, dots and convert comma to dot
  const clean = value.replace(/[^\d,-]/g, '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}
