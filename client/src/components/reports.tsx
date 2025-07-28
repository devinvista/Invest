import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/financial-utils';
import { Download, FileText, PieChart, TrendingUp, Calendar, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const COLORS = {
  necessities: 'hsl(207, 90%, 54%)',
  wants: 'hsl(38, 92%, 50%)',
  savings: 'hsl(122, 39%, 49%)',
  income: 'hsl(142, 76%, 36%)',
  expense: 'hsl(0, 84%, 60%)',
};

export function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });

  const { data: goals = [] } = useQuery<any[]>({
    queryKey: ['/api/goals'],
  });

  // Generate monthly data for the selected period
  const generateMonthlyData = () => {
    const months = selectedPeriod === '6months' ? 6 : 12;
    const currentDate = new Date();
    const monthlyData = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthTransactions = transactions.filter((t: any) => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === date.getMonth() && 
               transactionDate.getFullYear() === date.getFullYear();
      });

      const income = monthTransactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

      const expenses = monthTransactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

      monthlyData.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        fullMonth: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        income,
        expenses,
        balance: income - expenses,
      });
    }

    return monthlyData;
  };

  // Generate category spending data
  const generateCategoryData = () => {
    const categorySpending = categories.map((category: any) => {
      const categoryTransactions = transactions.filter(
        (t: any) => t.categoryId === category.id && t.type === 'expense'
      );
      const total = categoryTransactions.reduce(
        (sum: number, t: any) => sum + parseFloat(t.amount), 0
      );
      return {
        name: category.name,
        value: total,
        type: category.type,
        color: COLORS[category.type as keyof typeof COLORS] || COLORS.expense,
      };
    });

    return categorySpending.filter((cat: any) => cat.value > 0);
  };

  // Calculate summary metrics
  const totalIncome = transactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

  const totalExpenses = transactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

  const netIncome = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;

  const monthlyData = generateMonthlyData();
  const categoryData = generateCategoryData();

  // Top spending categories
  const topCategories = categoryData
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 5);

  const exportData = () => {
    const reportData = {
      period: selectedPeriod,
      generatedAt: new Date().toISOString(),
      summary: {
        totalIncome,
        totalExpenses,
        netIncome,
        savingsRate,
      },
      monthlyBreakdown: monthlyData,
      categoryBreakdown: categoryData,
      transactions: transactions.map((t: any) => ({
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: categories.find((c: any) => c.id === t.categoryId)?.name || 'N/A',
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-${selectedPeriod}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50/30">
      <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios Financeiros</h1>
          <p className="mt-1 text-muted-foreground">Análise detalhada das suas finanças</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="12months">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receitas Totais</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Despesas Totais</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600 rotate-180" />
            </div>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Líquido</p>
                <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netIncome)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Poupança</p>
                <p className={`text-2xl font-bold ${savingsRate >= 20 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {savingsRate.toFixed(1)}%
                </p>
              </div>
              <PieChart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Income vs Expenses */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle>Receitas vs Despesas Mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatCurrency(Number(value)), 
                      name === 'income' ? 'Receitas' : name === 'expenses' ? 'Despesas' : 'Saldo'
                    ]}
                    labelFormatter={(label) => {
                      const data = monthlyData.find(d => d.month === label);
                      return data?.fullMonth || label;
                    }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke={COLORS.income}
                    strokeWidth={3}
                    dot={{ fill: COLORS.income, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke={COLORS.expense}
                    strokeWidth={3}
                    dot={{ fill: COLORS.expense, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => percent > 5 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories and Monthly Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Spending Categories */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle>Maiores Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.map((category: any, index: number) => {
                const percentage = totalExpenses > 0 ? (category.value / totalExpenses) * 100 : 0;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <div>
                        <p className="font-medium text-foreground">{category.name}</p>
                        <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}% do total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{formatCurrency(category.value)}</p>
                      <Badge variant="outline" className="text-xs">
                        {category.type === 'necessities' ? 'Necessidades' : 
                         category.type === 'wants' ? 'Desejos' : 'Poupança'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Balance Chart */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle>Saldo Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Saldo']}
                    labelFormatter={(label) => {
                      const data = monthlyData.find(d => d.month === label);
                      return data?.fullMonth || label;
                    }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="balance" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle>Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Savings Rate Insight */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Taxa de Poupança
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                {savingsRate >= 20 
                  ? `Excelente! Você está poupando ${savingsRate.toFixed(1)}% da sua renda.`
                  : savingsRate >= 10
                  ? `Você está poupando ${savingsRate.toFixed(1)}%. Tente aumentar para 20%.`
                  : `Sua taxa de poupança está baixa (${savingsRate.toFixed(1)}%). Revise seus gastos.`
                }
              </p>
            </div>

            {/* Top Expense Category */}
            {topCategories.length > 0 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  Maior Gasto
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  Sua maior despesa é "{topCategories[0].name}" com {formatCurrency(topCategories[0].value)}. 
                  Analise se pode otimizar esses gastos.
                </p>
              </div>
            )}

            {/* Balance Trend */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Tendência
              </h3>
              <p className="text-sm text-green-700 dark:text-green-200">
                {netIncome > 0 
                  ? `Parabéns! Você teve um saldo positivo de ${formatCurrency(netIncome)} no período.`
                  : `Atenção: Você gastou ${formatCurrency(Math.abs(netIncome))} a mais do que ganhou.`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
