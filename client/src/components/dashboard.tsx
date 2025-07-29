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
    console.error('Dashboard error:', error);
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
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-primary to-chart-2 p-4 sm:p-6 lg:p-8 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-chart-2/70" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Olá, Tom! 👋</h1>
                <p className="text-white/80 text-sm sm:text-base">Aqui está um resumo das suas finanças hoje</p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/10 p-2"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                >
                  {balanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="secondary" size="sm" className="text-xs sm:text-sm">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                <p className="text-white/80 text-xs sm:text-sm mb-1">Patrimônio Total</p>
                <p className="text-xl sm:text-2xl font-bold chart-number-vibrant">
                  {balanceVisible ? formatCurrency(totalBalance) : '••••••'}
                </p>
                <div className="flex items-center mt-2 text-xs sm:text-sm">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span>+2.1% este mês</span>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 backdrop-blur-sm">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Portfolio Evolution Chart */}
          <Card className="vibrant-card-purple">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Evolução do Patrimônio</CardTitle>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
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
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolutionData}>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatCurrency(Number(value)), 
                        name === 'applied' ? 'Valor Aplicado' : 
                        name === 'profit' ? 'Ganho de Capital' : 'Valor Total'
                      ]}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
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
          <Card className="vibrant-card-teal">
            <CardHeader>
              <CardTitle>Regra 50/30/20</CardTitle>
            </CardHeader>
            <CardContent>
              {budgetData.length > 0 ? (
                <div className="space-y-6">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={budgetData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
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
                            fontSize: '14px'
                          }}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '2px solid hsl(var(--vibrant-teal))',
                            borderRadius: '12px',
                            boxShadow: '0 8px 25px hsl(var(--vibrant-teal) / 0.2)'
                          }}
                          itemStyle={{
                            color: 'hsl(var(--vibrant-lime))',
                            fontWeight: 'bold',
                            fontSize: '15px'
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {budgetData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full shadow-lg border-2 border-white dark:border-gray-800" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-semibold text-foreground">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: item.color }}>
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum orçamento configurado</p>
                    <Button className="mt-4" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Orçamento
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card className="vibrant-card-pink">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Transações Recentes</span>
                <Button variant="ghost" size="sm">
                  Ver todas
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.slice(0, 5).map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-vibrant-lime/20' : 'bg-vibrant-pink/20'}`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpCircle className="h-4 w-4 text-vibrant-lime" />
                          ) : (
                            <ArrowDownCircle className="h-4 w-4 text-vibrant-pink" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{transaction.description}</p>
                          <p className="text-xs font-medium text-vibrant-teal">{formatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <div className={`font-bold text-lg ${transaction.type === 'income' ? 'text-vibrant-lime' : 'text-vibrant-pink'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ArrowUpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma transação recente</p>
                    <Button className="mt-4" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Transação
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Goals */}
          <Card className="vibrant-card-orange">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Metas Financeiras</span>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.length > 0 ? (
                  goals.slice(0, 3).map((goal, index) => {
                    const progress = calculateGoalProgress(goal.currentAmount, goal.targetAmount);
                    return (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm text-foreground">{goal.name}</p>
                            <p className="text-xs font-medium text-vibrant-orange">
                              {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                            </p>
                          </div>
                          <Badge 
                            variant={progress >= 100 ? 'default' : 'secondary'}
                            className={`font-bold ${progress >= 100 ? 'bg-vibrant-lime text-black' : 'bg-vibrant-orange text-white'}`}
                          >
                            {Math.round(progress)}%
                          </Badge>
                        </div>
                        <Progress value={Math.min(progress, 100)} gradient="orange" className="h-2" />
                        <p className="text-xs font-medium text-vibrant-teal">
                          Meta para {formatDate(goal.targetDate)}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Defina suas metas financeiras</p>
                    <Button className="mt-4" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Meta
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="pharos-card">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-20 flex-col space-y-2">
                <Plus className="h-6 w-6" />
                <span className="text-sm">Nova Transação</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Target className="h-6 w-6" />
                <span className="text-sm">Criar Meta</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">Ver Relatórios</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <CreditCard className="h-6 w-6" />
                <span className="text-sm">Gerenciar Cartões</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}