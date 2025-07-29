import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, calculate502020, getProgressColor } from '@/lib/financial-utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Calculator, TrendingUp, Target, Plus, Edit3, Eye, EyeOff, BarChart3, PieChart as PieChartIcon, Calendar, Settings, DollarSign, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';

export function Budget() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [isEditing, setIsEditing] = useState(false);
  const [budgetType, setBudgetType] = useState<'default' | 'specific' | 'custom'>('default');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [budgetForm, setBudgetForm] = useState({
    totalIncome: '',
    necessitiesBudget: '',
    wantsBudget: '',
    savingsBudget: '',
    isDefault: true,
  });

  const { data: budget, isLoading } = useQuery<any>({
    queryKey: ['/api/budget', selectedMonth, selectedYear],
    queryFn: () => fetch(`/api/budget/${selectedMonth}/${selectedYear}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    }).then(res => res.json()),
  });

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ['/api/transactions', selectedMonth, selectedYear],
    queryFn: () => fetch(`/api/transactions?month=${selectedMonth}&year=${selectedYear}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    }).then(res => res.json()),
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });

  // Calculate spending by category type
  const spendingByType = {
    necessities: 0,
    wants: 0,
    savings: 0,
  };

  categories.forEach((category: any) => {
    const categoryTransactions = transactions.filter((t: any) => 
      t.categoryId === category.id && t.type === 'expense'
    );
    const totalSpent = categoryTransactions.reduce((sum: number, t: any) => 
      sum + parseFloat(t.amount), 0
    );
    
    if (category.type in spendingByType) {
      spendingByType[category.type as keyof typeof spendingByType] += totalSpent;
    }
  });

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2].map(year => ({ value: year, label: year.toString() }));

  // Cash flow projection data based on current budget
  const cashFlowData = [
    { month: 'Jan', income: budget?.totalIncome || 7400, expenses: spendingByType.necessities + spendingByType.wants + spendingByType.savings || 6200, balance: (budget?.totalIncome || 7400) - (spendingByType.necessities + spendingByType.wants + spendingByType.savings || 6200) },
    { month: 'Fev', income: budget?.totalIncome || 7400, expenses: 6500, balance: (budget?.totalIncome || 7400) - 6500 },
    { month: 'Mar', income: budget?.totalIncome || 7400, expenses: 5800, balance: (budget?.totalIncome || 7400) - 5800 },
    { month: 'Abr', income: budget?.totalIncome || 7400, expenses: 6300, balance: (budget?.totalIncome || 7400) - 6300 },
    { month: 'Mai', income: budget?.totalIncome || 7400, expenses: 6000, balance: (budget?.totalIncome || 7400) - 6000 },
    { month: 'Jun', income: budget?.totalIncome || 7400, expenses: 6700, balance: (budget?.totalIncome || 7400) - 6700 },
  ];

  const budgetDistributionData = [
    { name: 'Necessidades', value: parseFloat(budget?.necessitiesBudget) || 0, color: '#FF8C42' },  // Orange
    { name: 'Desejos', value: parseFloat(budget?.wantsBudget) || 0, color: '#4ADE80' },  // Green
    { name: 'Poupança', value: parseFloat(budget?.savingsBudget) || 0, color: '#60A5FA' }  // Blue
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-slate-50/30 to-blue-50/20">
        <div className="p-4 sm:p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50/30 to-blue-50/20 dark:from-background dark:via-slate-900/30 dark:to-blue-950/20">
      <div className="p-4 sm:p-6 space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-primary/80 p-6 lg:p-8 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-blue-600/80 to-primary/70" />
          <div className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <PieChartIcon className="h-8 w-8" />
                  <h1 className="text-2xl lg:text-3xl font-bold">Orçamento Inteligente</h1>
                </div>
                <p className="text-white/90 text-sm lg:text-base">
                  Controle total das suas finanças com análises avançadas e projeções futuras
                </p>
                {budget?.isDefault && (
                  <Badge variant="secondary" className="mt-3 bg-white/20 text-white border-white/30">
                    <Target className="w-3 h-3 mr-1" />
                    Orçamento Padrão Ativo
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/10 p-2"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                >
                  {balanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                    <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger className="w-20 bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year.value} value={year.value.toString()}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="projection" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Projeções</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Análises</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configurar</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            {!budget && !isEditing ? (
              // No budget created yet
              <Card className="vibrant-card-pink">
                <CardContent className="pt-6 text-center">
                  <Calculator className="h-12 w-12 text-vibrant-pink mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Crie seu primeiro orçamento</h3>
                  <p className="text-muted-foreground mb-6">
                    Configure seu orçamento usando o método 50/30/20 para organizar suas finanças
                  </p>
                  <Button onClick={() => setIsEditing(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Orçamento
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Overview cards and content
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Budget Summary Cards */}
                <Card className="lg:col-span-2 financial-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span>Resumo do Orçamento</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30">
                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                          {balanceVisible ? formatCurrency(budget?.totalIncome || 0) : '••••••'}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-300">Renda Total</div>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                          {balanceVisible ? formatCurrency((budget?.necessitiesBudget || 0) + (budget?.wantsBudget || 0) + (budget?.savingsBudget || 0)) : '••••••'}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-300">Orçamento Total</div>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30">
                        <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                          {balanceVisible ? formatCurrency((budget?.totalIncome || 0) - ((budget?.necessitiesBudget || 0) + (budget?.wantsBudget || 0) + (budget?.savingsBudget || 0))) : '••••••'}
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-300">Disponível</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Budget Distribution Chart */}
                <Card className="financial-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChartIcon className="h-5 w-5 text-primary" />
                      <span>Distribuição 50/30/20</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={budgetDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {budgetDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="projection" className="space-y-6">
            <Card className="financial-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Projeção de Fluxo de Caixa</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Area type="monotone" dataKey="income" stackId="1" stroke="#195AB4" fill="#195AB4" name="Receita" />
                    <Area type="monotone" dataKey="expenses" stackId="2" stroke="#dc2626" fill="#dc2626" name="Gastos" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="financial-card">
                <CardHeader>
                  <CardTitle>Análise de Gastos por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { category: 'Necessidades', planned: budget?.necessitiesBudget || 0, spent: spendingByType.necessities },
                      { category: 'Desejos', planned: budget?.wantsBudget || 0, spent: spendingByType.wants },
                      { category: 'Poupança', planned: budget?.savingsBudget || 0, spent: spendingByType.savings }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="planned" fill="#195AB4" name="Planejado" />
                      <Bar dataKey="spent" fill="#3399FF" name="Gasto" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="financial-card">
                <CardHeader>
                  <CardTitle>Métricas de Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
                      <div className="text-xl font-bold text-green-600">
                        {budget ? Math.round(((budget.savingsBudget || 0) / (budget.totalIncome || 1)) * 100) : 0}%
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">Taxa de Poupança</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                      <div className="text-xl font-bold text-blue-600">
                        {budget ? Math.round((1 - (spendingByType.necessities + spendingByType.wants + spendingByType.savings) / (budget.totalIncome || 1)) * 100) : 0}%
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Sobra Mensal</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="financial-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <span>Configurações do Orçamento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="w-full pharos-gradient"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {budget ? 'Editar Orçamento' : 'Criar Orçamento'}
                  </Button>
                  
                  {budget && (
                    <div className="text-center text-sm text-muted-foreground">
                      Última atualização: {new Date().toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}