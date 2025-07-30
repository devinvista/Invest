import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatCurrency, formatDate } from '@/lib/financial-utils';
import { Download, FileText, PieChart, TrendingUp, Calendar, Filter, Search, ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
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
  
  // Transaction filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter((transaction: any) => {
      const category = categories.find((c: any) => c.id === transaction.categoryId);
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category?.name.toLowerCase().includes(searchTerm.toLowerCase()) || '';
      const matchesType = filterType === 'all' || transaction.type === filterType;
      const matchesCategory = filterCategory === 'all' || transaction.categoryId === filterCategory;
      
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a: any, b: any) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = parseFloat(a.amount);
          bValue = parseFloat(b.amount);
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case 'category':
          const categoryA = categories.find((c: any) => c.id === a.categoryId)?.name || '';
          const categoryB = categories.find((c: any) => c.id === b.categoryId)?.name || '';
          aValue = categoryA.toLowerCase();
          bValue = categoryB.toLowerCase();
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Delete transaction mutation
  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir transação",
        description: error.message || "Ocorreu um erro ao excluir a transação.",
        variant: "destructive",
      });
    },
  });

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
    <div className="min-h-screen bg-background">
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

      {/* Complete Transactions Table */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Todas as Transações</span>
            <Badge variant="outline">{filteredTransactions.length} transações</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters Section */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar transações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                  <SelectItem value="transfer">Transferências</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterCategory('all');
                }}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Data</span>
                      {sortBy === 'date' && (
                        sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                      {sortBy !== 'date' && <ArrowUpDown className="w-4 h-4 opacity-50" />}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Descrição</span>
                      {sortBy === 'description' && (
                        sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                      {sortBy !== 'description' && <ArrowUpDown className="w-4 h-4 opacity-50" />}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Categoria</span>
                      {sortBy === 'category' && (
                        sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                      {sortBy !== 'category' && <ArrowUpDown className="w-4 h-4 opacity-50" />}
                    </div>
                  </TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Valor</span>
                      {sortBy === 'amount' && (
                        sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                      {sortBy !== 'amount' && <ArrowUpDown className="w-4 h-4 opacity-50" />}
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma transação encontrada com os filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction: any) => {
                    const category = categories.find((c: any) => c.id === transaction.categoryId);
                    const isIncome = transaction.type === 'income';
                    const isExpense = transaction.type === 'expense';
                    const isTransfer = transaction.type === 'transfer';
                    
                    return (
                      <TableRow key={transaction.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {formatDate(transaction.date)}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          {category ? (
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <span>{category.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Sem categoria</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={isIncome ? "default" : isExpense ? "destructive" : "secondary"}
                            className={
                              isIncome ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                              isExpense ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                              "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            }
                          >
                            {isIncome ? 'Receita' : isExpense ? 'Despesa' : 'Transferência'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-semibold ${
                            isIncome ? 'text-green-600' : 
                            isExpense ? 'text-red-600' : 
                            'text-blue-600'
                          }`}>
                            {isIncome ? '+' : isExpense ? '-' : ''}
                            {formatCurrency(parseFloat(transaction.amount))}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost" 
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Transação</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                                  <br />
                                  <br />
                                  <strong>Transação:</strong> {transaction.description}
                                  <br />
                                  <strong>Valor:</strong> {formatCurrency(parseFloat(transaction.amount))}
                                  <br />
                                  <strong>Data:</strong> {formatDate(transaction.date)}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteTransactionMutation.mutate(transaction.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Info */}
          {filteredTransactions.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Mostrando {filteredTransactions.length} de {transactions.length} transações
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
