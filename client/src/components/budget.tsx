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
import { formatCurrency, calculate502020, getProgressColor } from '@/lib/financial-utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Calculator, TrendingUp, TrendingDown, Target, Plus, Edit3, RotateCcw } from 'lucide-react';

export function Budget() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [isEditing, setIsEditing] = useState(false);
  const [budgetType, setBudgetType] = useState<'default' | 'specific' | 'custom'>('default');
  const [budgetForm, setBudgetForm] = useState({
    totalIncome: '',
    necessitiesBudget: '',
    wantsBudget: '',
    savingsBudget: '',
    isDefault: true,
  });
  const [customCategoryBudgets, setCustomCategoryBudgets] = useState<{[categoryId: string]: string}>({});
  const [customGroupBudgets, setCustomGroupBudgets] = useState({
    necessities: '',
    wants: '',
    savings: '',
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

  const createBudgetMutation = useMutation({
    mutationFn: async (budgetData: any) => {
      const response = await apiRequest('POST', '/api/budget', {
        ...budgetData,
        month: budgetType === 'default' ? 0 : selectedMonth, // 0 para orçamento padrão
        year: budgetType === 'default' ? 0 : selectedYear,   // 0 para orçamento padrão
        isDefault: budgetType === 'default',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Orçamento criado com sucesso!',
      });
      // Invalidar todas as queries relacionadas ao orçamento
      queryClient.invalidateQueries({ queryKey: ['/api/budget'] });
      queryClient.invalidateQueries({ queryKey: ['/api/budget', selectedMonth, selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      // Forçar refetch imediato da query atual
      queryClient.refetchQueries({ queryKey: ['/api/budget', selectedMonth, selectedYear] });
      // Pequeno delay para garantir que o servidor processou a mudança
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/budget', selectedMonth, selectedYear] });
      }, 100);
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleIncomeChange = (income: string) => {
    const incomeValue = parseFloat(income) || 0;
    const allocation = calculate502020(incomeValue);
    
    setBudgetForm({
      ...budgetForm,
      totalIncome: income,
      necessitiesBudget: allocation.necessities.toString(),
      wantsBudget: allocation.wants.toString(),
      savingsBudget: allocation.savings.toString(),
    });

    // Para orçamento personalizado, também atualizar os grupos personalizados
    if (budgetType === 'custom') {
      setCustomGroupBudgets({
        necessities: allocation.necessities.toString(),
        wants: allocation.wants.toString(),
        savings: allocation.savings.toString(),
      });
    }
  };

  const handleBudgetTypeChange = (type: 'default' | 'specific' | 'custom') => {
    setBudgetType(type);
    setBudgetForm({
      ...budgetForm,
      isDefault: true, // Sempre deixar como padrão marcado
    });
    
    // Se mudou para personalizado, limpar orçamentos personalizados e inicializar grupos
    if (type === 'custom') {
      setCustomCategoryBudgets({});
      // Inicializar grupos com valores 50/30/20 se há renda
      if (budgetForm.totalIncome) {
        const allocation = calculate502020(parseFloat(budgetForm.totalIncome));
        setCustomGroupBudgets({
          necessities: allocation.necessities.toString(),
          wants: allocation.wants.toString(),
          savings: allocation.savings.toString(),
        });
      }
    }
  };

  const handleCreateBudget = () => {
    let budgetData;
    
    if (budgetType === 'custom') {
      // Para orçamento personalizado, usar a soma das receitas como receita total
      const totalIncomeFromCategories = calculateCustomTotals().income;
      budgetData = {
        totalIncome: totalIncomeFromCategories > 0 ? totalIncomeFromCategories : (parseFloat(customGroupBudgets.necessities) + parseFloat(customGroupBudgets.wants) + parseFloat(customGroupBudgets.savings)),
        necessitiesBudget: parseFloat(customGroupBudgets.necessities),
        wantsBudget: parseFloat(customGroupBudgets.wants),
        savingsBudget: parseFloat(customGroupBudgets.savings),
        isDefault: budgetForm.isDefault, // Permitir orçamento personalizado como padrão
      };
      
      const budgetCategories = Object.entries(customCategoryBudgets)
        .filter(([_, amount]) => parseFloat(amount) > 0)
        .map(([categoryId, amount]) => ({
          categoryId,
          allocatedAmount: amount
        }));
      
      createBudgetMutation.mutate({
        ...budgetData,
        budgetCategories
      });
    } else {
      // Para orçamento padrão ou específico, usar valores do formulário
      budgetData = {
        totalIncome: parseFloat(budgetForm.totalIncome),
        necessitiesBudget: parseFloat(budgetForm.necessitiesBudget),
        wantsBudget: parseFloat(budgetForm.wantsBudget),
        savingsBudget: parseFloat(budgetForm.savingsBudget),
        isDefault: budgetForm.isDefault,
      };
      
      createBudgetMutation.mutate(budgetData);
    }
  };
  
  const handleCustomBudgetChange = (categoryId: string, amount: string, categoryType: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;
    
    const newAmount = parseFloat(amount) || 0;
    const currentTypeTotal = calculateCustomTotals()[categoryType as keyof ReturnType<typeof calculateCustomTotals>];
    const currentCategoryAmount = parseFloat(customCategoryBudgets[categoryId] || '0');
    const otherCategoriesTotal = currentTypeTotal - currentCategoryAmount;
    
    // Para categorias de receita, não há limite
    if (categoryType === 'income') {
      setCustomCategoryBudgets(prev => {
        const updatedBudgets = {
          ...prev,
          [categoryId]: amount
        };
        
        // Calcular nova receita total baseada nas categorias
        const newTotalIncome = Object.entries(updatedBudgets)
          .filter(([catId, _]) => {
            const cat = categories.find(c => c.id === catId);
            return cat && cat.transactionType === 'income';
          })
          .reduce((sum, [_, amt]) => sum + (parseFloat(amt) || 0), 0);
        
        // Atualizar automaticamente a renda total e recalcular grupos 50/30/20
        if (newTotalIncome > 0) {
          const allocation = calculate502020(newTotalIncome);
          setBudgetForm(prev => ({ ...prev, totalIncome: newTotalIncome.toString() }));
          setCustomGroupBudgets({
            necessities: allocation.necessities.toString(),
            wants: allocation.wants.toString(),
            savings: allocation.savings.toString(),
          });
        }
        
        return updatedBudgets;
      });
      return;
    }
    
    // Para categorias de despesa, verificar limite baseado nos grupos personalizados
    const maxAllowed = parseFloat(customGroupBudgets[categoryType as keyof typeof customGroupBudgets]) || 0;
    
    // Verificar se o novo valor não excede o limite do grupo
    if (otherCategoriesTotal + newAmount > maxAllowed) {
      const maxPossible = maxAllowed - otherCategoriesTotal;
      setCustomCategoryBudgets(prev => ({
        ...prev,
        [categoryId]: Math.max(0, maxPossible).toFixed(2)
      }));
      return;
    }
    
    setCustomCategoryBudgets(prev => ({
      ...prev,
      [categoryId]: amount
    }));
  };
  
  const calculateCustomTotals = () => {
    const allCategories = categories;
    const totals = { necessities: 0, wants: 0, savings: 0, income: 0 };
    
    allCategories.forEach(cat => {
      const amount = parseFloat(customCategoryBudgets[cat.id] || '0');
      if (cat.type === 'necessities') totals.necessities += amount;
      else if (cat.type === 'wants') totals.wants += amount;
      else if (cat.type === 'savings') totals.savings += amount;
      else if (cat.transactionType === 'income') totals.income += amount;
    });
    
    return totals;
  };
  
  const getAvailableAmount = (type: string) => {
    if (type === 'income') {
      // Para receita, não há limite
      return Infinity;
    }
    
    const maxAllowed = parseFloat(customGroupBudgets[type as keyof typeof customGroupBudgets]) || 0;
    const currentTotal = calculateCustomTotals()[type as keyof ReturnType<typeof calculateCustomTotals>];
    return maxAllowed - currentTotal;
  };

  // Check if using default budget
  const isUsingDefaultBudget = budget?.isDefault;

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-muted rounded"></div>
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
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orçamento Pessoal</h1>
          <p className="mt-1 text-muted-foreground">Gerencie suas finanças com o método 50/30/20</p>
          {budget?.isDefault && (
            <Badge variant="secondary" className="mt-2">
              <Target className="w-3 h-3 mr-1" />
              Usando orçamento padrão
            </Badge>
          )}
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-24">
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
      ) : isEditing ? (
        // Budget creation form
        <Card className="financial-card">
          <CardHeader>
            <CardTitle>
              Configurar Orçamento {budgetType === 'default' ? 'Padrão' : `- ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Budget Type Selection */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Tipo de Orçamento
              </label>
              <div className="grid grid-cols-3 gap-4">
                <Card 
                  className={`cursor-pointer border-2 transition-all ${
                    budgetType === 'default' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/30'
                  }`}
                  onClick={() => handleBudgetTypeChange('default')}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="text-center">
                      <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <h4 className="font-medium text-sm">Orçamento Padrão</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Aplica para todos os meses
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer border-2 transition-all ${
                    budgetType === 'specific' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/30'
                  }`}
                  onClick={() => handleBudgetTypeChange('specific')}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="text-center">
                      <Calculator className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <h4 className="font-medium text-sm">Mês Específico</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Apenas para {months.find(m => m.value === selectedMonth)?.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer border-2 transition-all ${
                    budgetType === 'custom' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/30'
                  }`}
                  onClick={() => handleBudgetTypeChange('custom')}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="text-center">
                      <Edit3 className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <h4 className="font-medium text-sm">Personalizado</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Por categoria individual
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {budgetType !== 'custom' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Renda Total Mensal
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={budgetForm.totalIncome}
                  onChange={(e) => handleIncomeChange(e.target.value)}
                />
              </div>
            )}

            {budgetType === 'custom' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Renda Total Mensal (Calculada Automaticamente)
                </label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(calculateCustomTotals().income)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Soma das categorias de receita configuradas
                  </p>
                </div>
              </div>
            )}

            {budgetForm.totalIncome && budgetType !== 'custom' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <h4 className="text-sm font-medium">Distribuição 50/30/20</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleIncomeChange(budgetForm.totalIncome)}
                      className="text-xs"
                    >
                      Recalcular 50/30/20
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Valores calculados automaticamente, mas você pode ajustá-los conforme necessário
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-necessities mb-2 block">
                      Necessidades (50%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={budgetForm.necessitiesBudget}
                      onChange={(e) => setBudgetForm(prev => ({ ...prev, necessitiesBudget: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Alimentação, moradia, transporte, saúde
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-wants mb-2 block">
                      Desejos (30%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={budgetForm.wantsBudget}
                      onChange={(e) => setBudgetForm(prev => ({ ...prev, wantsBudget: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Entretenimento, compras, hobbies
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-savings mb-2 block">
                      Poupança (20%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={budgetForm.savingsBudget}
                      onChange={(e) => setBudgetForm(prev => ({ ...prev, savingsBudget: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Investimentos, reserva de emergência
                    </p>
                  </div>
                </div>

                {/* Budget validation and summary */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Renda Total</p>
                      <p className="font-medium">{formatCurrency(parseFloat(budgetForm.totalIncome))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-necessities">Necessidades</p>
                      <p className="font-medium text-necessities">{formatCurrency(parseFloat(budgetForm.necessitiesBudget) || 0)}</p>
                      <p className="text-xs text-muted-foreground">
                        {((parseFloat(budgetForm.necessitiesBudget) || 0) / (parseFloat(budgetForm.totalIncome) || 1) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-wants">Desejos</p>
                      <p className="font-medium text-wants">{formatCurrency(parseFloat(budgetForm.wantsBudget) || 0)}</p>
                      <p className="text-xs text-muted-foreground">
                        {((parseFloat(budgetForm.wantsBudget) || 0) / (parseFloat(budgetForm.totalIncome) || 1) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-savings">Poupança</p>
                      <p className="font-medium text-savings">{formatCurrency(parseFloat(budgetForm.savingsBudget) || 0)}</p>
                      <p className="text-xs text-muted-foreground">
                        {((parseFloat(budgetForm.savingsBudget) || 0) / (parseFloat(budgetForm.totalIncome) || 1) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  {/* Show difference from original 50/30/20 if modified */}
                  {(() => {
                    const incomeValue = parseFloat(budgetForm.totalIncome) || 0;
                    const allocation = calculate502020(incomeValue);
                    const currentTotal = (parseFloat(budgetForm.necessitiesBudget) || 0) + 
                                       (parseFloat(budgetForm.wantsBudget) || 0) + 
                                       (parseFloat(budgetForm.savingsBudget) || 0);
                    const originalTotal = allocation.necessities + allocation.wants + allocation.savings;
                    const difference = currentTotal - originalTotal;
                    
                    if (Math.abs(difference) > 0.01) {
                      return (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">
                              Diferença do 50/30/20 original:
                            </span>
                            <span className={`font-medium ${difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {difference > 0 ? '+' : ''}{formatCurrency(difference)}
                            </span>
                          </div>
                          {difference > 0 && (
                            <p className="text-xs text-red-600 mt-1">
                              Orçamento excede a renda em {formatCurrency(difference)}
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            )}

            {budgetType === 'custom' && (
              <div className="space-y-6">
                {/* 1. Switch padrão todos os meses */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <Switch
                      id="default-budget"
                      checked={budgetForm.isDefault}
                      onCheckedChange={(checked) => setBudgetForm(prev => ({ ...prev, isDefault: checked }))}
                    />
                    <Label htmlFor="default-budget" className="text-sm font-medium">
                      Usar como orçamento padrão para todos os meses
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Quando ativado, este orçamento personalizado será aplicado automaticamente para todos os meses que não possuem orçamento específico
                  </p>
                </div>

                {/* 2. Receita total automática */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Renda Total Mensal (Calculada Automaticamente)
                  </label>
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(calculateCustomTotals().income)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Soma automática das categorias de receita configuradas abaixo
                    </p>
                  </div>
                </div>

                {/* 3. Categorias de Receita */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-sm text-green-600">
                        Categorias de Receita
                      </h4>
                      <Badge variant="outline" className="text-green-600">
                        {categories.filter(cat => cat.transactionType === 'income').length} categorias
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Configure os valores esperados para cada fonte de receita
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categories
                      .filter(cat => cat.transactionType === 'income')
                      .map(category => (
                        <div key={category.id} className="space-y-1">
                          <label className="text-xs font-medium text-foreground block">
                            {category.name}
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={customCategoryBudgets[category.id] || ''}
                            onChange={(e) => handleCustomBudgetChange(category.id, e.target.value, 'income')}
                            className="text-sm"
                          />
                        </div>
                      ))}
                  </div>
                </div>

                {/* 4. Distribuição dos Grupos 50/30/20 */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="text-sm font-medium mb-2">Distribuição dos Grupos de Despesas 50/30/20</h4>
                    <p className="text-xs text-muted-foreground">
                      Ajuste os valores dos grupos conforme sua estratégia financeira
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-necessities mb-2 block">
                        Necessidades (50%)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={customGroupBudgets.necessities}
                        onChange={(e) => setCustomGroupBudgets(prev => ({ ...prev, necessities: e.target.value }))}
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {calculateCustomTotals().income > 0 && 
                          `${((parseFloat(customGroupBudgets.necessities) || 0) / calculateCustomTotals().income * 100).toFixed(1)}% da renda`
                        }
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-wants mb-2 block">
                        Desejos (30%)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={customGroupBudgets.wants}
                        onChange={(e) => setCustomGroupBudgets(prev => ({ ...prev, wants: e.target.value }))}
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {calculateCustomTotals().income > 0 && 
                          `${((parseFloat(customGroupBudgets.wants) || 0) / calculateCustomTotals().income * 100).toFixed(1)}% da renda`
                        }
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-savings mb-2 block">
                        Poupança (20%)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={customGroupBudgets.savings}
                        onChange={(e) => setCustomGroupBudgets(prev => ({ ...prev, savings: e.target.value }))}
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {calculateCustomTotals().income > 0 && 
                          `${((parseFloat(customGroupBudgets.savings) || 0) / calculateCustomTotals().income * 100).toFixed(1)}% da renda`
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const totalIncome = calculateCustomTotals().income;
                        if (totalIncome > 0) {
                          const allocation = calculate502020(totalIncome);
                          setCustomGroupBudgets({
                            necessities: allocation.necessities.toString(),
                            wants: allocation.wants.toString(),
                            savings: allocation.savings.toString(),
                          });
                        }
                      }}
                      className="text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Recalcular com base na receita total
                    </Button>
                  </div>
                </div>

                {/* 5. Distribuição por categorias de despesas */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="text-sm font-medium mb-1">Distribuição por Categorias de Despesas</h4>
                    <p className="text-xs text-muted-foreground">
                      Configure valores específicos para cada categoria dentro dos limites dos grupos
                    </p>
                  </div>

                  {/* Custom category budget inputs */}
                  {['necessities', 'wants', 'savings'].map(type => {
                    const typeCategories = categories.filter(cat => cat.type === type);
                    const customTotals = calculateCustomTotals();
                    const typeTotal = customTotals[type as keyof typeof customTotals];
                    const availableAmount = getAvailableAmount(type);
                    const maxAllowed = parseFloat(customGroupBudgets[type as keyof typeof customGroupBudgets]) || 0;
                    const typeColor = type === 'necessities' ? 'text-necessities' : 
                                    type === 'wants' ? 'text-wants' : 'text-savings';
                    const typeLabel = type === 'necessities' ? 'Necessidades (50%)' : 
                                     type === 'wants' ? 'Desejos (30%)' : 'Poupança (20%)';

                    return (
                      <div key={type} className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h5 className={`font-medium text-sm ${typeColor}`}>
                              {typeLabel}
                            </h5>
                            <div className="flex gap-2">
                              <Badge variant="outline" className={typeColor}>
                                Usado: {formatCurrency(typeTotal)}
                              </Badge>
                              <Badge variant="secondary">
                                Disponível: {formatCurrency(availableAmount)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="bg-muted/30 rounded-lg p-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Limite máximo: {formatCurrency(maxAllowed)}</span>
                              <span>{maxAllowed > 0 ? ((typeTotal / maxAllowed) * 100).toFixed(1) : 0}% usado</span>
                            </div>
                            <Progress 
                              value={maxAllowed > 0 ? (typeTotal / maxAllowed) * 100 : 0} 
                              className="h-2"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {typeCategories.map(category => (
                            <div key={category.id} className="space-y-1">
                              <label className="text-xs font-medium text-foreground block">
                                {category.name}
                              </label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                value={customCategoryBudgets[category.id] || ''}
                                onChange={(e) => handleCustomBudgetChange(category.id, e.target.value, type)}
                                className="text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Summary */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-center mb-4">
                      <h4 className="text-sm font-medium mb-1">Resumo da Distribuição</h4>
                      <p className="text-xs text-muted-foreground">
                        Receita total calculada automaticamente pela soma das categorias de receita
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                      <div>
                        <p className="text-xs text-green-600">Receitas</p>
                        <p className="font-medium text-green-600">{formatCurrency(calculateCustomTotals().income)}</p>
                        <p className="text-xs text-muted-foreground">
                          {calculateCustomTotals().income > 0 ? 'Total planejado' : 'Não configurado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-necessities">Necessidades</p>
                        <p className="font-medium text-necessities">{formatCurrency(calculateCustomTotals().necessities)}</p>
                        <p className="text-xs text-muted-foreground">
                          de {formatCurrency(parseFloat(customGroupBudgets.necessities) || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-wants">Desejos</p>
                        <p className="font-medium text-wants">{formatCurrency(calculateCustomTotals().wants)}</p>
                        <p className="text-xs text-muted-foreground">
                          de {formatCurrency(parseFloat(customGroupBudgets.wants) || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-savings">Poupança</p>
                        <p className="font-medium text-savings">{formatCurrency(calculateCustomTotals().savings)}</p>
                        <p className="text-xs text-muted-foreground">
                          de {formatCurrency(parseFloat(customGroupBudgets.savings) || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Orçado</p>
                        <p className="font-medium">{formatCurrency(
                          (parseFloat(customGroupBudgets.necessities) || 0) + 
                          (parseFloat(customGroupBudgets.wants) || 0) + 
                          (parseFloat(customGroupBudgets.savings) || 0)
                        )}</p>
                        <p className="text-xs text-muted-foreground">
                          Despesas planejadas
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateBudget}
                disabled={!budgetForm.totalIncome || createBudgetMutation.isPending}
              >
                {createBudgetMutation.isPending ? 'Salvando...' : 'Salvar Orçamento'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Budget overview
        <>
          {/* Budget Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="financial-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Renda Total</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(parseFloat(budget.totalIncome))}
                    </p>
                  </div>
                  <Calculator className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="financial-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gastos Totais</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(spendingByType.necessities + spendingByType.wants + spendingByType.savings)}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="financial-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Restante</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(parseFloat(budget.totalIncome) - (spendingByType.necessities + spendingByType.wants + spendingByType.savings))}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="financial-card">
              <CardContent className="pt-6 text-center">
                <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar Orçamento
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Budget Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Necessities */}
            <Card className="financial-card">
              <CardHeader>
                <CardTitle className="flex items-center text-necessities">
                  <Target className="w-5 h-5 mr-2" />
                  Necessidades (50%)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Gasto</span>
                    <span>{formatCurrency(spendingByType.necessities)} de {formatCurrency(parseFloat(budget.necessitiesBudget))}</span>
                  </div>
                  <Progress 
                    value={(spendingByType.necessities / parseFloat(budget.necessitiesBudget)) * 100} 
                    gradient="purple"
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-2">
                  {categories
                    .filter((cat: any) => cat.type === 'necessities')
                    .map((category: any) => {
                      const categorySpent = transactions
                        .filter((t: any) => t.categoryId === category.id && t.type === 'expense')
                        .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
                      
                      return (
                        <div key={category.id} className="flex justify-between text-sm">
                          <span>{category.name}</span>
                          <span className="font-medium">{formatCurrency(categorySpent)}</span>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Wants */}
            <Card className="financial-card">
              <CardHeader>
                <CardTitle className="flex items-center text-wants">
                  <Target className="w-5 h-5 mr-2" />
                  Desejos (30%)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Gasto</span>
                    <span>{formatCurrency(spendingByType.wants)} de {formatCurrency(parseFloat(budget.wantsBudget))}</span>
                  </div>
                  <Progress 
                    value={(spendingByType.wants / parseFloat(budget.wantsBudget)) * 100} 
                    gradient="orange"
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-2">
                  {categories
                    .filter((cat: any) => cat.type === 'wants')
                    .map((category: any) => {
                      const categorySpent = transactions
                        .filter((t: any) => t.categoryId === category.id && t.type === 'expense')
                        .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
                      
                      return (
                        <div key={category.id} className="flex justify-between text-sm">
                          <span>{category.name}</span>
                          <span className="font-medium">{formatCurrency(categorySpent)}</span>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Savings */}
            <Card className="financial-card">
              <CardHeader>
                <CardTitle className="flex items-center text-savings">
                  <Target className="w-5 h-5 mr-2" />
                  Poupança (20%)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Investido</span>
                    <span>{formatCurrency(spendingByType.savings)} de {formatCurrency(parseFloat(budget.savingsBudget))}</span>
                  </div>
                  <Progress 
                    value={(spendingByType.savings / parseFloat(budget.savingsBudget)) * 100} 
                    gradient="teal"
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-2">
                  {categories
                    .filter((cat: any) => cat.type === 'savings')
                    .map((category: any) => {
                      const categorySpent = transactions
                        .filter((t: any) => t.categoryId === category.id && t.type === 'expense')
                        .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
                      
                      return (
                        <div key={category.id} className="flex justify-between text-sm">
                          <span>{category.name}</span>
                          <span className="font-medium">{formatCurrency(categorySpent)}</span>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
