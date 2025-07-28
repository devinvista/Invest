export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function calculate502020(income: number) {
  return {
    necessities: income * 0.5,
    wants: income * 0.3,
    savings: income * 0.2,
  };
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 90) return 'text-red-600';
  if (percentage >= 75) return 'text-yellow-600';
  return 'text-green-600';
}

export function getCategoryColor(type: 'necessities' | 'wants' | 'savings'): string {
  const colors = {
    necessities: 'hsl(207, 90%, 54%)',
    wants: 'hsl(38, 92%, 50%)',
    savings: 'hsl(122, 39%, 49%)',
  };
  return colors[type];
}

export function getTransactionTypeColor(type: 'income' | 'expense' | 'transfer'): string {
  const colors = {
    income: 'text-green-600',
    expense: 'text-red-600',
    transfer: 'text-blue-600',
  };
  return colors[type];
}

export function calculateGoalProgress(current: number, target: number): number {
  return Math.min((current / target) * 100, 100);
}

export function calculateMonthsToGoal(current: number, target: number, monthly: number): number {
  if (monthly <= 0) return Infinity;
  return Math.ceil((target - current) / monthly);
}

export function getAssetVariation(currentPrice: number, averagePrice: number): number {
  return ((currentPrice - averagePrice) / averagePrice) * 100;
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
  return formatDate(dateObj);
}
