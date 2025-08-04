import { useQuery } from '@tanstack/react-query';
import { ModernCard } from '@/components/ui/modern-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, getRelativeTime, calculateGoalProgress } from '@/lib/financial-utils';
import { 
  Wallet, 
  TrendingDown, 
  TrendingUp, 
  CreditCard, 
  Target, 
  BarChart3, 
  Download, 
  RefreshCw, 
  Plus, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Star,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { useState } from 'react';

const COLORS = {
  necessities: '#f97316', // Vibrant Orange
  wants: '#149A5A', // Green 
  savings: '#195AB4', // Blue
};

const VIBRANT_COLORS = {
  purple: '#9333ea',
  pink: '#ec4899', 
  teal: '#06b6d4',
  orange: '#f97316',
  lime: '#84cc16'
};

interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalCreditUsed: number;
  recentTransactions: any[];
  goals: any[];
  budget?: any;
}

export function Dashboard() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('12m');
  
  // Check if dark mode is active
  const isDarkMode = document.documentElement.classList.contains('dark');
  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
  });

  if (error) {
    console.error('Erro no dashboard:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Erro ao carregar dados</h2>
          <p className="text-muted-foreground">Tente recarregar a página</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6 space-y-8">
          <div className="animate-pulse">
            <div className="h-32 bg-muted rounded-2xl mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    totalBalance = 0,
    monthlyIncome = 0,
    monthlyExpenses = 0,
    totalCreditUsed = 0,
    recentTransactions = [],
    goals = [],
    budget
  } = dashboardData || {};

  // Calculate 50/30/20 data
  const budgetData = budget ? [
    { name: 'Necessidades (50%)', value: parseFloat(budget.necessitiesSpent), total: parseFloat(budget.necessitiesBudget), color: COLORS.necessities },
    { name: 'Desejos (30%)', value: parseFloat(budget.wantsSpent), total: parseFloat(budget.wantsBudget), color: COLORS.wants },
    { name: 'Poupança (20%)', value: parseFloat(budget.savingsSpent), total: parseFloat(budget.savingsBudget), color: COLORS.savings },
  ] : [];

  // Portfolio evolution data - showing investment growth over time
  const evolutionData = [
    { month: 'Jul/24', applied: 95000, profit: 8500, total: 103500 },
    { month: 'Ago/24', applied: 102000, profit: 9200, total: 111200 },
    { month: 'Set/24', applied: 108500, profit: 11700, total: 120200 },
    { month: 'Out/24', applied: 115000, profit: 10800, total: 125800 },
    { month: 'Nov/24', applied: 120000, profit: 14300, total: 134300 },
    { month: 'Dez/24', applied: 125000, profit: 16100, total: 141100 },
    { month: 'Jan/25', applied: 130000, profit: totalBalance > 130000 ? totalBalance - 130000 : 18500, total: totalBalance > 130000 ? totalBalance : 148500 }
  ].map(item => ({ ...item, total: item.applied + item.profit }));

  // Legacy wealth data for simple line chart
  const wealthData = [
    { month: 'Ago', value: 118500 },
    { month: 'Set', value: 120200 },
    { month: 'Out', value: 119800 },
    { month: 'Nov', value: 122300 },
    { month: 'Dez', value: 124100 },
    { month: 'Jan', value: totalBalance },
  ];

  const netWorth = totalBalance;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="padding-responsive space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-primary to-chart-2 padding-responsive-sm text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-chart-2/70" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-4 sm:mb-6">
              <div className="min-w-0 flex-1">
                <h1 className="text-responsive-lg font-bold mb-2">Olá, Tom! 👋</h1>
                <p className="text-white/80 text-responsive-sm">Aqui está um resumo das suas finanças hoje</p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/10 p-2"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  data-testid="button-toggle-balance"
                >
                  {balanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="secondary" size="sm" className="text-responsive-xs" data-testid="button-export">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Exportar</span>
                </Button>
              </div>
            </div>
            
            <div className="responsive-grid responsive-grid-3 gap-3 sm:gap-4 lg:gap-6">
              <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 backdrop-blur-sm" data-testid="card-total-balance">
                <p className="text-white/80 text-responsive-xs mb-1">Patrimônio Total</p>
                <p className="text-responsive-lg font-bold chart-number-vibrant">
                  {balanceVisible ? formatCurrency(totalBalance) : '••••••'}
                </p>
                <div className="flex items-center mt-2 text-responsive-xs">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 shrink-0" />
                  <span>+2.1% este mês</span>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 backdrop-blur-sm" data-testid="card-monthly-income">
                <p className="text-white/80 text-xs sm:text-sm mb-1">Receitas</p>
                <p className="text-xl sm:text-2xl font-bold text-vibrant-lime">
                  {balanceVisible ? formatCurrency(monthlyIncome) : '••••••'}
                </p>
                <p className="text-xs sm:text-sm text-white/70 mt-2">Este mês</p>
              </div>
              
              <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                <p className="text-white/80 text-xs sm:text-sm mb-1">Despesas</p>
                <p className="text-xl sm:text-2xl font-bold text-vibrant-pink">
                  {balanceVisible ? formatCurrency(monthlyExpenses) : '••••••'}
                </p>
                <p className="text-xs sm:text-sm text-white/70 mt-2">Este mês</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="responsive-grid responsive-grid-4" data-testid="stats-grid">
          <ModernCard
            title="Taxa de Poupança"
            value={`${savingsRate.toFixed(1)}%`}
            icon={Target}
            iconColor="text-vibrant-lime"
            description="Do salário"
          />
          <ModernCard
            title="Cartão de Crédito"
            value={balanceVisible ? formatCurrency(totalCreditUsed) : '••••••'}
            icon={CreditCard}
            iconColor="text-vibrant-orange"
            description="Utilizado"
          />
          <ModernCard
            title="Metas Ativas"
            value={goals.length.toString()}
            icon={Star}
            iconColor="text-vibrant-purple"
            description="Objetivos"
          />
          <ModernCard
            title="Investimentos"
            value={balanceVisible ? formatCurrency(47890) : '••••••'}
            icon={BarChart3}
            iconColor="text-vibrant-teal"
            trend={{ value: 5.8, label: "este mês", positive: true }}
          />
        </div>

        {/* Charts and Data */}
        <div className="responsive-grid responsive-grid-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Portfolio Evolution Chart */}
          <Card className="vibrant-card-purple" data-testid="chart-portfolio-evolution">
            <CardHeader className="pb-2 sm:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <CardTitle className="text-responsive-md">Evolução do Patrimônio</CardTitle>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-28 sm:w-32 text-sm" data-testid="select-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">3 Meses</SelectItem>
                    <SelectItem value="6m">6 Meses</SelectItem>
                    <SelectItem value="12m">12 Meses</SelectItem>
                    <SelectItem value="all">Tudo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolutionData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="appliedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isDarkMode ? "#60a5fa" : "hsl(var(--success))"} stopOpacity={isDarkMode ? 0.4 : 0.3}/>
                        <stop offset="95%" stopColor={isDarkMode ? "#60a5fa" : "hsl(var(--success))"} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isDarkMode ? "#93c5fd" : "hsl(var(--primary))"} stopOpacity={isDarkMode ? 0.4 : 0.3}/>
                        <stop offset="95%" stopColor={isDarkMode ? "#93c5fd" : "hsl(var(--primary))"} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => formatCurrency(value).replace('R$ ', 'R$')}
                      width={60}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatCurrency(Number(value)), 
                        name === 'applied' ? 'Valor Aplicado' : 
                        name === 'profit' ? 'Ganho de Capital' : 'Valor Total'
                      ]}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#1e3a8a" 
                      strokeWidth={2}
                      fill="url(#totalGradient)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="applied" 
                      stackId="1"
                      stroke={isDarkMode ? "#60a5fa" : "hsl(var(--success))"} 
                      fill="url(#appliedGradient)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stackId="2"
                      stroke={isDarkMode ? "#93c5fd" : "hsl(var(--primary))"} 
                      fill="url(#profitGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Budget Distribution */}
          <Card className="vibrant-card-teal" data-testid="chart-budget-distribution">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-responsive-md">Regra 50/30/20</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {budgetData.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="chart-container-small">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <Pie
                          data={budgetData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {budgetData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [formatCurrency(Number(value)), 'Valor']}
                          labelStyle={{ 
                            color: 'hsl(var(--vibrant-teal))', 
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '2px solid hsl(var(--vibrant-teal))',
                            borderRadius: '12px',
                            boxShadow: '0 8px 25px hsl(var(--vibrant-teal) / 0.2)',
                            fontSize: '12px'
                          }}
                          itemStyle={{
                            color: 'hsl(var(--vibrant-lime))',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {budgetData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div 
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-lg border-2 border-white dark:border-gray-800 shrink-0" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-responsive-xs font-semibold text-foreground truncate">{item.name}</span>
                        </div>
                        <span className="text-responsive-xs font-bold shrink-0 ml-2" style={{ color: item.color }}>
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="chart-container-small flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 opacity-50" />
                    <p className="text-responsive-xs">Nenhum orçamento configurado</p>
                    <Button className="mt-2 sm:mt-4" size="sm" data-testid="button-create-budget">
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm">Criar Orçamento</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions & Goals */}
        <div className="responsive-grid responsive-grid-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Recent Transactions */}
          <Card className="vibrant-card-pink" data-testid="card-recent-transactions">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <span className="text-responsive-md">Transações Recentes</span>
                <Button variant="ghost" size="sm" className="self-start sm:self-center" data-testid="button-view-all-transactions">
                  <span className="text-xs sm:text-sm">Ver todas</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 sm:space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.slice(0, 5).map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-accent transition-colors" data-testid={`transaction-${index}`}>
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${transaction.type === 'income' ? 'bg-vibrant-lime/20' : 'bg-vibrant-pink/20'}`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpCircle className="h-3 w-3 sm:h-4 sm:w-4 text-vibrant-lime" />
                          ) : (
                            <ArrowDownCircle className="h-3 w-3 sm:h-4 sm:w-4 text-vibrant-pink" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-xs sm:text-sm text-foreground truncate">{transaction.description}</p>
                          <p className="text-xs font-medium text-vibrant-teal">{formatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <div className={`font-bold text-sm sm:text-lg shrink-0 ml-2 ${transaction.type === 'income' ? 'text-vibrant-lime' : 'text-vibrant-pink'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <ArrowUpCircle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 opacity-50" />
                    <p className="text-responsive-xs">Nenhuma transação recente</p>
                    <Button className="mt-2 sm:mt-4" size="sm" data-testid="button-new-transaction">
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm">Nova Transação</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Goals */}
          <Card className="vibrant-card-orange" data-testid="card-financial-goals">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <span className="text-responsive-md">Metas Financeiras</span>
                <Button variant="ghost" size="sm" className="self-start sm:self-center" data-testid="button-add-goal">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 sm:space-y-4">
                {goals.length > 0 ? (
                  goals.slice(0, 3).map((goal, index) => {
                    const progress = calculateGoalProgress(goal.currentAmount, goal.targetAmount);
                    return (
                      <div key={index} className="space-y-2 sm:space-y-3" data-testid={`goal-${index}`}>
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-xs sm:text-sm text-foreground truncate">{goal.name}</p>
                            <p className="text-xs font-medium text-vibrant-orange">
                              {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                            </p>
                          </div>
                          <Badge 
                            variant={progress >= 100 ? 'default' : 'secondary'}
                            className={`font-bold text-xs shrink-0 ml-2 ${progress >= 100 ? 'bg-vibrant-lime text-black' : 'bg-vibrant-orange text-white'}`}
                          >
                            {Math.round(progress)}%
                          </Badge>
                        </div>
                        <Progress value={Math.min(progress, 100)} gradient="orange" className="h-1.5 sm:h-2" />
                        <p className="text-xs font-medium text-vibrant-teal">
                          Meta para {formatDate(goal.targetDate)}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <Target className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 opacity-50" />
                    <p className="text-responsive-xs">Defina suas metas financeiras</p>
                    <Button className="mt-2 sm:mt-4" size="sm" data-testid="button-create-goal">
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm">Criar Meta</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="pharos-card" data-testid="card-quick-actions">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-responsive-md">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="responsive-grid responsive-grid-4 gap-3 sm:gap-4">
              <Button className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 text-xs sm:text-sm" data-testid="button-quick-new-transaction">
                <Plus className="h-4 w-4 sm:h-6 sm:w-6" />
                <span>Nova Transação</span>
              </Button>
              <Button variant="outline" className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 text-xs sm:text-sm" data-testid="button-quick-create-goal">
                <Target className="h-4 w-4 sm:h-6 sm:w-6" />
                <span>Criar Meta</span>
              </Button>
              <Button variant="outline" className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 text-xs sm:text-sm" data-testid="button-quick-reports">
                <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6" />
                <span>Ver Relatórios</span>
              </Button>
              <Button variant="outline" className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 text-xs sm:text-sm" data-testid="button-quick-cards">
                <CreditCard className="h-4 w-4 sm:h-6 sm:w-6" />
                <span className="text-center leading-tight">Gerenciar Cartões</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}