import { useState, useEffect } from 'react';
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
  const [budgetType, setBudgetType] = useState<'default' | 'custom'>('default');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [budgetForm, setBudgetForm] = useState({
    totalIncome: '',
    necessitiesBudget: '',
    wantsBudget: '',
    savingsBudget: '',
    isDefault: true,
  });
  
  const [customCategories, setCustomCategories] = useState<{[key: string]: string}>({});
  const [budgetCategories, setBudgetCategories] = useState<any[]>([]);

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

  // Query for budget categories when budget exists
  const { data: existingBudgetCategories = [] } = useQuery<any[]>({
    queryKey: ['/api/budget', budget?.id, 'categories'],
    queryFn: () => {
      if (budget?.id && budget.id !== 'undefined' && budget.id !== 'NaN' && typeof budget.id === 'string') {
        return fetch(`/api/budget/${budget.id}/categories`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          }
        }).then(res => res.json());
      }
      return Promise.resolve([]);
    },
    enabled: !!budget?.id && budget.id !== 'undefined' && budget.id !== 'NaN' && typeof budget.id === 'string',
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (budgetData: any) => {
      return apiRequest('POST', '/api/budget', budgetData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget'] });
      setIsEditing(false);
      toast({
        title: 'Sucesso',
        description: 'Orçamento criado com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar orçamento',
        variant: 'destructive',
      });
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async (budgetData: any) => {
      return apiRequest('PUT', `/api/budget/${selectedMonth}/${selectedYear}`, budgetData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget'] });
      setIsEditing(false);
      toast({
        title: 'Sucesso',
        description: 'Orçamento atualizado com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar orçamento',
        variant: 'destructive',
      });
    },
  });

  // Initialize form with budget data when budget loads
  useEffect(() => {
    if (budget && !isEditing) {
      setBudgetForm({
        totalIncome: budget.totalIncome?.toString() || '',
        necessitiesBudget: budget.necessitiesBudget?.toString() || '',
        wantsBudget: budget.wantsBudget?.toString() || '',
        savingsBudget: budget.savingsBudget?.toString() || '',
        isDefault: budget.isDefault || false,
      });
    }
  }, [budget, isEditing]);

  // Initialize custom categories from existing budget categories
  useEffect(() => {
    if (existingBudgetCategories.length > 0) {
      const categoryMap: {[key: string]: string} = {};
      existingBudgetCategories.forEach((bc: any) => {
        categoryMap[bc.categoryId] = bc.allocatedAmount.toString();
      });
      setCustomCategories(categoryMap);
    }
  }, [existingBudgetCategories]);

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalIncome = parseFloat(budgetForm.totalIncome) || 0;
    const necessitiesBudget = parseFloat(budgetForm.necessitiesBudget) || 0;
    const wantsBudget = parseFloat(budgetForm.wantsBudget) || 0;
    const savingsBudget = parseFloat(budgetForm.savingsBudget) || 0;

    if (totalIncome <= 0) {
      toast({
        title: 'Erro',
        description: 'A renda total deve ser maior que zero',
        variant: 'destructive',
      });
      return;
    }

    const budgetData = {
      month: selectedMonth,
      year: selectedYear,
      totalIncome,
      necessitiesBudget,
      wantsBudget,
      savingsBudget,
      isDefault: budgetForm.isDefault,
      budgetCategories: budgetType === 'custom' ? Object.entries(customCategories)
        .filter(([_, amount]) => parseFloat(amount) > 0)
        .map(([categoryId, amount]) => ({ categoryId, allocatedAmount: amount })) : undefined
    };

    if (budget) {
      updateBudgetMutation.mutate(budgetData);
    } else {
      createBudgetMutation.mutate(budgetData);
    }
  };

  const handleCalculate502020 = () => {
    const totalIncome = parseFloat(budgetForm.totalIncome) || 0;
    if (totalIncome > 0) {
      const necessities = totalIncome * 0.5;
      const wants = totalIncome * 0.3;
      const savings = totalIncome * 0.2;
      
      setBudgetForm(prev => ({
        ...prev,
        necessitiesBudget: necessities.toFixed(2),
        wantsBudget: wants.toFixed(2),
        savingsBudget: savings.toFixed(2),
      }));
    }
  };

  // Helper functions for custom budget
  const handleCustomCategoryChange = (categoryId: string, amount: string) => {
    setCustomCategories(prev => ({
      ...prev,
      [categoryId]: amount
    }));
  };

  const getTotalByType = (type: string) => {
    return categories
      .filter((cat: any) => cat.type === type)
      .reduce((sum: number, cat: any) => {
        const amount = parseFloat(customCategories[cat.id] || '0');
        return sum + amount;
      }, 0);
  };

  const getRemainingByType = (type: string) => {
    const budget = parseFloat(budgetForm[`${type}Budget` as keyof typeof budgetForm] as string) || 0;
    const used = getTotalByType(type);
    return Math.max(0, budget - used);
  };

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
              <div className="space-y-6">
                {/* Financial Overview Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="financial-card">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Renda Total</p>
                          <p className="text-xl font-bold text-green-600">
                            {balanceVisible ? formatCurrency(budget?.totalIncome || 0) : '••••••'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="financial-card">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                          <Target className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Gastos Realizados</p>
                          <p className="text-xl font-bold text-orange-600">
                            {balanceVisible ? formatCurrency(spendingByType.necessities + spendingByType.wants + spendingByType.savings) : '••••••'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="financial-card">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <Calculator className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Orçamento Total</p>
                          <p className="text-xl font-bold text-blue-600">
                            {balanceVisible ? formatCurrency((budget?.necessitiesBudget || 0) + (budget?.wantsBudget || 0) + (budget?.savingsBudget || 0)) : '••••••'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="financial-card">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Disponível</p>
                          <p className="text-xl font-bold text-purple-600">
                            {balanceVisible ? formatCurrency((budget?.totalIncome || 0) - ((budget?.necessitiesBudget || 0) + (budget?.wantsBudget || 0) + (budget?.savingsBudget || 0))) : '••••••'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Overview Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded bg-orange-500"></div>
                            <span>Necessidades (50%)</span>
                          </div>
                          <span className="font-medium">{formatCurrency(budget?.necessitiesBudget || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded bg-green-500"></div>
                            <span>Desejos (30%)</span>
                          </div>
                          <span className="font-medium">{formatCurrency(budget?.wantsBudget || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded bg-blue-500"></div>
                            <span>Poupança (20%)</span>
                          </div>
                          <span className="font-medium">{formatCurrency(budget?.savingsBudget || 0)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Category Breakdown - Necessidades */}
                  <Card className="financial-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded bg-orange-500"></div>
                          <span>Necessidades (50%)</span>
                        </div>
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          {budget?.necessitiesBudget ? Math.round((spendingByType.necessities / parseFloat(budget.necessitiesBudget)) * 100) : 0}% usado
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span>Orçado:</span>
                        <span className="font-medium">{formatCurrency(budget?.necessitiesBudget || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Gasto:</span>
                        <span className="font-medium text-orange-600">{formatCurrency(spendingByType.necessities)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Restante:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(Math.max(0, (parseFloat(budget?.necessitiesBudget || '0') - spendingByType.necessities)))}
                        </span>
                      </div>
                      <Progress 
                        value={budget?.necessitiesBudget ? Math.min(100, (spendingByType.necessities / parseFloat(budget.necessitiesBudget)) * 100) : 0}
                        className="h-2"
                        style={{ 
                          '--progress-background': '#FF8C42',
                          '--progress-foreground': '#FF8C42'
                        } as any}
                      />
                      <div className="pt-2 space-y-1">
                        {categories
                          .filter((cat: any) => cat.type === 'necessities')
                          .slice(0, 3)
                          .map((category: any) => {
                            const categorySpent = transactions
                              .filter((t: any) => t.categoryId === category.id && t.type === 'expense')
                              .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
                            
                            return (
                              <div key={category.id} className="flex justify-between text-xs text-muted-foreground">
                                <span>{category.name}</span>
                                <span>{formatCurrency(categorySpent)}</span>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Category Breakdown - Desejos */}
                  <Card className="financial-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded bg-green-500"></div>
                          <span>Desejos (30%)</span>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          {budget?.wantsBudget ? Math.round((spendingByType.wants / parseFloat(budget.wantsBudget)) * 100) : 0}% usado
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span>Orçado:</span>
                        <span className="font-medium">{formatCurrency(budget?.wantsBudget || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Gasto:</span>
                        <span className="font-medium text-green-600">{formatCurrency(spendingByType.wants)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Restante:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(Math.max(0, (parseFloat(budget?.wantsBudget || '0') - spendingByType.wants)))}
                        </span>
                      </div>
                      <Progress 
                        value={budget?.wantsBudget ? Math.min(100, (spendingByType.wants / parseFloat(budget.wantsBudget)) * 100) : 0}
                        className="h-2"
                        style={{ 
                          '--progress-background': '#4ADE80',
                          '--progress-foreground': '#4ADE80'
                        } as any}
                      />
                      <div className="pt-2 space-y-1">
                        {categories
                          .filter((cat: any) => cat.type === 'wants')
                          .slice(0, 3)
                          .map((category: any) => {
                            const categorySpent = transactions
                              .filter((t: any) => t.categoryId === category.id && t.type === 'expense')
                              .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
                            
                            return (
                              <div key={category.id} className="flex justify-between text-xs text-muted-foreground">
                                <span>{category.name}</span>
                                <span>{formatCurrency(categorySpent)}</span>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Second Row - Poupança and Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Category Breakdown - Poupança */}
                  <Card className="financial-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded bg-blue-500"></div>
                          <span>Poupança (20%)</span>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          {budget?.savingsBudget ? Math.round((spendingByType.savings / parseFloat(budget.savingsBudget)) * 100) : 0}% usado
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span>Orçado:</span>
                        <span className="font-medium">{formatCurrency(budget?.savingsBudget || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Investido:</span>
                        <span className="font-medium text-blue-600">{formatCurrency(spendingByType.savings)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Meta Restante:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(Math.max(0, (parseFloat(budget?.savingsBudget || '0') - spendingByType.savings)))}
                        </span>
                      </div>
                      <Progress 
                        value={budget?.savingsBudget ? Math.min(100, (spendingByType.savings / parseFloat(budget.savingsBudget)) * 100) : 0}
                        className="h-2"
                        style={{ 
                          '--progress-background': '#60A5FA',
                          '--progress-foreground': '#60A5FA'
                        } as any}
                      />
                      <div className="pt-2 space-y-1">
                        {categories
                          .filter((cat: any) => cat.type === 'savings')
                          .slice(0, 3)
                          .map((category: any) => {
                            const categorySpent = transactions
                              .filter((t: any) => t.categoryId === category.id && t.type === 'expense')
                              .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
                            
                            return (
                              <div key={category.id} className="flex justify-between text-xs text-muted-foreground">
                                <span>{category.name}</span>
                                <span>{formatCurrency(categorySpent)}</span>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Insights */}
                  <Card className="financial-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <span>Insights do Mês</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                              Taxa de Poupança
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-300">
                              {budget ? Math.round(((budget.savingsBudget || 0) / (budget.totalIncome || 1)) * 100) : 0}% da renda
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                          <Target className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              Aderência Total
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300">
                              {budget ? Math.round((1 - Math.abs(((spendingByType.necessities + spendingByType.wants + spendingByType.savings) - (parseFloat(budget.necessitiesBudget || '0') + parseFloat(budget.wantsBudget || '0') + parseFloat(budget.savingsBudget || '0'))) / (budget.totalIncome || 1))) * 100) : 0}% do planejado
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                          <DollarSign className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                              Dias Restantes
                            </p>
                            <p className="text-xs text-orange-600 dark:text-orange-300">
                              {new Date(selectedYear, selectedMonth, 0).getDate() - new Date().getDate()} dias no mês
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="financial-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5 text-primary" />
                        <span>Ações Rápidas</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        onClick={() => setIsEditing(true)}
                        className="w-full justify-start pharos-gradient"
                        size="sm"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        {budget ? 'Editar Orçamento' : 'Criar Orçamento'}
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                        onClick={() => setActiveTab('analytics')}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Ver Análises Detalhadas
                      </Button>

                      <Button 
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                        onClick={() => setActiveTab('projection')}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Ver Projeções
                      </Button>

                      {budget && (
                        <div className="pt-2 border-t text-center">
                          <p className="text-xs text-muted-foreground">
                            Última atualização: {new Date().toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
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
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
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
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
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
            {isEditing ? (
              // Budget Edit Form
              <Card className="financial-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Edit3 className="h-5 w-5 text-primary" />
                    <span>{budget ? 'Editar Orçamento' : 'Criar Novo Orçamento'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBudgetSubmit} className="space-y-6">
                    {/* Budget Type Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card 
                        className={`cursor-pointer transition-all ${budgetType === 'default' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                        onClick={() => setBudgetType('default')}
                      >
                        <CardContent className="p-4 text-center">
                          <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <h3 className="font-semibold">Simplificado</h3>
                          <p className="text-xs text-muted-foreground">Regra 50/30/20</p>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className={`cursor-pointer transition-all ${budgetType === 'custom' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                        onClick={() => setBudgetType('custom')}
                      >
                        <CardContent className="p-4 text-center">
                          <Settings className="h-8 w-8 mx-auto mb-2 text-green-600" />
                          <h3 className="font-semibold">Completo</h3>
                          <p className="text-xs text-muted-foreground">Por categoria</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Income Input */}
                    <div className="space-y-2">
                      <Label htmlFor="totalIncome">Renda Total Mensal</Label>
                      <Input
                        id="totalIncome"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 5000.00"
                        value={budgetForm.totalIncome}
                        onChange={(e) => setBudgetForm(prev => ({ ...prev, totalIncome: e.target.value }))}
                        required
                      />
                    </div>

                    {/* 50/30/20 Budget Inputs */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Distribuição do Orçamento</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCalculate502020}
                          disabled={!budgetForm.totalIncome}
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calcular 50/30/20
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Necessidades */}
                        <div className="space-y-2">
                          <Label className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded bg-orange-500"></div>
                            <span>Necessidades (50%)</span>
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Ex: 2500.00"
                            value={budgetForm.necessitiesBudget}
                            onChange={(e) => setBudgetForm(prev => ({ ...prev, necessitiesBudget: e.target.value }))}
                          />
                          <p className="text-xs text-muted-foreground">
                            Moradia, alimentação, transporte, saúde
                          </p>
                        </div>

                        {/* Desejos */}
                        <div className="space-y-2">
                          <Label className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded bg-green-500"></div>
                            <span>Desejos (30%)</span>
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Ex: 1500.00"
                            value={budgetForm.wantsBudget}
                            onChange={(e) => setBudgetForm(prev => ({ ...prev, wantsBudget: e.target.value }))}
                          />
                          <p className="text-xs text-muted-foreground">
                            Entretenimento, viagens, compras
                          </p>
                        </div>

                        {/* Poupança */}
                        <div className="space-y-2">
                          <Label className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded bg-blue-500"></div>
                            <span>Poupança (20%)</span>
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Ex: 1000.00"
                            value={budgetForm.savingsBudget}
                            onChange={(e) => setBudgetForm(prev => ({ ...prev, savingsBudget: e.target.value }))}
                          />
                          <p className="text-xs text-muted-foreground">
                            Reserva de emergência, investimentos
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Custom Budget Categories */}
                    {budgetType === 'custom' && (
                      <div className="space-y-6">
                        <div className="border-t pt-4">
                          <h3 className="text-lg font-semibold mb-4">Configuração por Categoria</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Configure o orçamento individual para cada categoria dentro dos limites 50/30/20
                          </p>

                          {/* Necessidades */}
                          <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 rounded bg-orange-500"></div>
                                <h4 className="font-medium">Necessidades (50%)</h4>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatCurrency(getTotalByType('necessities'))} / {formatCurrency(parseFloat(budgetForm.necessitiesBudget) || 0)}
                                <span className="ml-2">
                                  (Restante: {formatCurrency(getRemainingByType('necessities'))})
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {categories
                                .filter((cat: any) => cat.type === 'necessities')
                                .map((category: any) => (
                                  <div key={category.id} className="space-y-2">
                                    <Label className="text-sm">{category.name}</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={customCategories[category.id] || ''}
                                      onChange={(e) => handleCustomCategoryChange(category.id, e.target.value)}
                                      className="text-sm"
                                    />
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Desejos */}
                          <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 rounded bg-green-500"></div>
                                <h4 className="font-medium">Desejos (30%)</h4>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatCurrency(getTotalByType('wants'))} / {formatCurrency(parseFloat(budgetForm.wantsBudget) || 0)}
                                <span className="ml-2">
                                  (Restante: {formatCurrency(getRemainingByType('wants'))})
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {categories
                                .filter((cat: any) => cat.type === 'wants')
                                .map((category: any) => (
                                  <div key={category.id} className="space-y-2">
                                    <Label className="text-sm">{category.name}</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={customCategories[category.id] || ''}
                                      onChange={(e) => handleCustomCategoryChange(category.id, e.target.value)}
                                      className="text-sm"
                                    />
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Poupança */}
                          <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 rounded bg-blue-500"></div>
                                <h4 className="font-medium">Poupança (20%)</h4>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatCurrency(getTotalByType('savings'))} / {formatCurrency(parseFloat(budgetForm.savingsBudget) || 0)}
                                <span className="ml-2">
                                  (Restante: {formatCurrency(getRemainingByType('savings'))})
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {categories
                                .filter((cat: any) => cat.type === 'savings')
                                .map((category: any) => (
                                  <div key={category.id} className="space-y-2">
                                    <Label className="text-sm">{category.name}</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={customCategories[category.id] || ''}
                                      onChange={(e) => handleCustomCategoryChange(category.id, e.target.value)}
                                      className="text-sm"
                                    />
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Default Budget Toggle */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isDefault"
                        checked={budgetForm.isDefault}
                        onCheckedChange={(checked) => setBudgetForm(prev => ({ ...prev, isDefault: checked }))}
                      />
                      <Label htmlFor="isDefault">
                        Definir como orçamento padrão para todos os meses
                      </Label>
                    </div>

                    {/* Budget Summary */}
                    {budgetForm.totalIncome && (
                      <div className="p-4 rounded-lg bg-muted">
                        <h4 className="font-medium mb-2">Resumo do Orçamento</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span>Total Planejado:</span>
                            <span className="float-right font-medium">
                              {formatCurrency(
                                (parseFloat(budgetForm.necessitiesBudget) || 0) +
                                (parseFloat(budgetForm.wantsBudget) || 0) +
                                (parseFloat(budgetForm.savingsBudget) || 0)
                              )}
                            </span>
                          </div>
                          <div>
                            <span>Sobra:</span>
                            <span className="float-right font-medium">
                              {formatCurrency(
                                (parseFloat(budgetForm.totalIncome) || 0) -
                                ((parseFloat(budgetForm.necessitiesBudget) || 0) +
                                (parseFloat(budgetForm.wantsBudget) || 0) +
                                (parseFloat(budgetForm.savingsBudget) || 0))
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex space-x-3">
                      <Button
                        type="submit"
                        className="flex-1 pharos-gradient"
                        disabled={createBudgetMutation.isPending || updateBudgetMutation.isPending}
                      >
                        {createBudgetMutation.isPending || updateBudgetMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Target className="w-4 h-4 mr-2" />
                            {budget ? 'Atualizar Orçamento' : 'Criar Orçamento'}
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        disabled={createBudgetMutation.isPending || updateBudgetMutation.isPending}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              // Settings Overview
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
                      <div className="space-y-3 pt-4 border-t">
                        <div className="text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mês/Ano:</span>
                            <span className="font-medium">
                              {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tipo:</span>
                            <span className="font-medium">
                              {budget.isDefault ? 'Padrão para todos os meses' : 'Específico deste mês'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Última atualização:</span>
                            <span className="font-medium">
                              {new Date().toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}