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

  // Mock wealth evolution data
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
          {/* Wealth Evolution */}
          <Card className="vibrant-card-purple">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Evolução Patrimonial</span>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={wealthData}>
                    <defs>
                      <linearGradient id="blueWealthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#195AB4" stopOpacity={0.8}/>
                        <stop offset="30%" stopColor="#3399FF" stopOpacity={0.6}/>
                        <stop offset="70%" stopColor="#6B9FFF" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#B1D2FF" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="#3399FF" strokeWidth={1} strokeOpacity={0.3} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#195AB4', fontWeight: 600 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#195AB4', fontWeight: 600 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Patrimônio']}
                      labelStyle={{ 
                        color: '#195AB4', 
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '2px solid #3399FF',
                        borderRadius: '8px',
                        boxShadow: '0 8px 24px rgba(51, 153, 255, 0.2)'
                      }}
                      itemStyle={{
                        color: '#3399FF',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#195AB4" 
                      strokeWidth={3}
                      fill="url(#blueWealthGradient)" 
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