import { useQuery } from '@tanstack/react-query';
import { FinancialCard } from '@/components/ui/financial-card';
import { ChartCard } from '@/components/ui/chart-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, getRelativeTime, calculateGoalProgress } from '@/lib/financial-utils';
import { Wallet, TrendingDown, TrendingUp, PieChart, Download, RefreshCw, Plus, ArrowDownCircle, ArrowUpCircle, AlertTriangle } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const COLORS = {
  necessities: 'hsl(207, 90%, 54%)',
  wants: 'hsl(38, 92%, 50%)',
  savings: 'hsl(122, 39%, 49%)',
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
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-muted rounded mb-2"></div>
          <div className="h-4 w-96 bg-muted rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse"></div>
          ))}
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

  // Mock wealth evolution data (in a real app, this would come from the API)
  const wealthData = [
    { month: 'Ago', value: 118500 },
    { month: 'Set', value: 120200 },
    { month: 'Out', value: 119800 },
    { month: 'Nov', value: 122300 },
    { month: 'Dez', value: 124100 },
    { month: 'Jan', value: totalBalance },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-muted-foreground">
        <span>Início</span>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">Dashboard</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visão Geral Financeira</h1>
          <p className="mt-1 text-muted-foreground">Acompanhe suas finanças em tempo real</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialCard
          title="Saldo Total"
          value={totalBalance}
          change={{ value: 2.1, label: "este mês", positive: true }}
          icon={Wallet}
          iconColor="text-primary"
        />
        <FinancialCard
          title="Receitas do Mês"
          value={monthlyIncome}
          change={{ value: 0, label: "no prazo", positive: true }}
          icon={TrendingUp}
          iconColor="text-green-600"
        />
        <FinancialCard
          title="Despesas do Mês"
          value={monthlyExpenses}
          change={{ value: 72, label: "do orçamento", positive: false }}
          icon={TrendingDown}
          iconColor="text-orange-600"
        />
        <FinancialCard
          title="Investimentos"
          value={47890}
          change={{ value: 5.8, label: "este mês", positive: true }}
          icon={PieChart}
          iconColor="text-primary"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 50/30/20 Rule Chart */}
        <ChartCard 
          title="Regra 50/30/20"
          showPeriodSelect
          periods={[
            { value: 'january', label: 'Janeiro 2024' },
            { value: 'december', label: 'Dezembro 2023' },
          ]}
        >
          <div className="space-y-6">
            {budgetData.length > 0 ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={budgetData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {budgetData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {budgetData.map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="w-4 h-4 rounded mx-auto mb-2" style={{ backgroundColor: item.color }}></div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(item.value)}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>Configure seu orçamento para ver o gráfico 50/30/20</p>
              </div>
            )}
          </div>
        </ChartCard>

        {/* Wealth Evolution */}
        <ChartCard 
          title="Evolução Patrimonial"
          showPeriodSelect
          periods={[
            { value: '6months', label: 'Últimos 6 meses' },
            { value: 'year', label: 'Este ano' },
          ]}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wealthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'Patrimônio']}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <Card className="financial-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transações Recentes</CardTitle>
                <Button variant="link" className="p-0 h-auto text-primary">
                  Ver todas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {transaction.type === 'income' ? (
                            <ArrowDownCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <ArrowUpCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {getRelativeTime(transaction.date)} • {transaction.accountId ? 'Conta' : 'Cartão'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-foreground'}`}>
                          {transaction.type === 'income' ? '+' : '-'} {formatCurrency(parseFloat(transaction.amount))}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category?.name || 'Sem categoria'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma transação recente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Goals */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="financial-card">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Nova Despesa
              </Button>
              <Button variant="outline" className="w-full">
                <ArrowDownCircle className="w-4 h-4 mr-2" />
                Registrar Receita
              </Button>
              <Button variant="outline" className="w-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                Transferir
              </Button>
            </CardContent>
          </Card>

          {/* Goals Progress */}
          <Card className="financial-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Metas em Andamento</CardTitle>
                <Button variant="link" className="p-0 h-auto text-primary">
                  Ver todas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {goals.length > 0 ? (
                <div className="space-y-4">
                  {goals.map((goal: any) => {
                    const progress = calculateGoalProgress(parseFloat(goal.currentAmount), parseFloat(goal.targetAmount));
                    return (
                      <div key={goal.id}>
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium text-foreground">{goal.name}</p>
                          <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatCurrency(parseFloat(goal.currentAmount))} de {formatCurrency(parseFloat(goal.targetAmount))}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Nenhuma meta criada</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Credit Cards Alert */}
          {totalCreditUsed > 0 && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      Atenção: Cartões
                    </h3>
                    <p className="mt-1 text-sm text-orange-700 dark:text-orange-200">
                      Você tem {formatCurrency(totalCreditUsed)} em faturas. 
                      <Button variant="link" className="p-0 h-auto ml-1 text-orange-800 dark:text-orange-100 underline">
                        Ver detalhes
                      </Button>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
