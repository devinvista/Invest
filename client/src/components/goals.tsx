import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GoalForm } from '@/components/forms/goal-form';
import { formatCurrency, calculateGoalProgress, calculateMonthsToGoal, formatDate } from '@/lib/financial-utils';
import { Target, Plus, Calendar, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export function Goals() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: goals = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/goals'],
  });

  const activeGoals = goals.filter((goal: any) => goal.status === 'active');
  const completedGoals = goals.filter((goal: any) => goal.status === 'completed');

  const totalTargetAmount = activeGoals.reduce((sum: number, goal: any) => 
    sum + parseFloat(goal.targetAmount), 0
  );

  const totalCurrentAmount = activeGoals.reduce((sum: number, goal: any) => 
    sum + parseFloat(goal.currentAmount), 0
  );

  const totalMonthlyContribution = activeGoals.reduce((sum: number, goal: any) => 
    sum + parseFloat(goal.monthlyContribution || 0), 0
  );

  const getGoalStatusColor = (goal: any) => {
    const progress = calculateGoalProgress(
      parseFloat(goal.currentAmount), 
      parseFloat(goal.targetAmount)
    );
    
    if (progress >= 100) return 'text-green-600';
    
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const monthsRemaining = (targetDate.getFullYear() - today.getFullYear()) * 12 + 
                           (targetDate.getMonth() - today.getMonth());
    
    if (monthsRemaining < 0) return 'text-red-600';
    if (monthsRemaining < 3) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getGoalStatusIcon = (goal: any) => {
    const progress = calculateGoalProgress(
      parseFloat(goal.currentAmount), 
      parseFloat(goal.targetAmount)
    );
    
    if (progress >= 100) return <CheckCircle className="h-5 w-5 text-green-600" />;
    
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const monthsRemaining = (targetDate.getFullYear() - today.getFullYear()) * 12 + 
                           (targetDate.getMonth() - today.getMonth());
    
    if (monthsRemaining < 0) return <AlertCircle className="h-5 w-5 text-red-600" />;
    if (monthsRemaining < 3) return <Clock className="h-5 w-5 text-yellow-600" />;
    return <Target className="h-5 w-5 text-blue-600" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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
          <h1 className="text-2xl font-bold text-foreground">Metas Financeiras</h1>
          <p className="mt-1 text-muted-foreground">Defina e acompanhe seus objetivos financeiros</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Meta Financeira</DialogTitle>
            </DialogHeader>
            <GoalForm onSuccess={() => setShowCreateDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Metas Ativas</p>
                <p className="text-2xl font-bold text-foreground">{activeGoals.length}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Meta</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalTargetAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Já Poupado</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCurrentAmount)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aportes Mensais</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalMonthlyContribution)}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {goals.length === 0 ? (
        <Card className="financial-card">
          <CardContent className="pt-6 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma meta criada</h3>
            <p className="text-muted-foreground mb-6">
              Defina seus objetivos financeiros e acompanhe seu progresso
            </p>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Meta
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nova Meta Financeira</DialogTitle>
                </DialogHeader>
                <GoalForm onSuccess={() => setShowCreateDialog(false)} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Metas Ativas</h2>
              <div className="space-y-4">
                {activeGoals.map((goal: any) => {
                  const progress = calculateGoalProgress(
                    parseFloat(goal.currentAmount), 
                    parseFloat(goal.targetAmount)
                  );
                  const monthsToGoal = calculateMonthsToGoal(
                    parseFloat(goal.currentAmount),
                    parseFloat(goal.targetAmount),
                    parseFloat(goal.monthlyContribution || 0)
                  );
                  const remaining = parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount);

                  return (
                    <Card key={goal.id} className="financial-card">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {getGoalStatusIcon(goal)}
                            <div>
                              <h3 className="font-semibold text-foreground">{goal.name}</h3>
                              {goal.description && (
                                <p className="text-sm text-muted-foreground">{goal.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-foreground">
                              {progress.toFixed(0)}%
                            </p>
                            <p className="text-sm text-muted-foreground">completo</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Progresso</span>
                              <span>
                                {formatCurrency(parseFloat(goal.currentAmount))} de {formatCurrency(parseFloat(goal.targetAmount))}
                              </span>
                            </div>
                            <Progress value={progress} className="h-3" />
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Restante</p>
                              <p className="font-medium">{formatCurrency(remaining)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Data Meta</p>
                              <p className="font-medium">{formatDate(goal.targetDate)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Mensal</p>
                              <p className="font-medium">
                                {formatCurrency(parseFloat(goal.monthlyContribution || 0))}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Tempo Restante</p>
                              <p className={`font-medium ${getGoalStatusColor(goal)}`}>
                                {monthsToGoal === Infinity ? 'Indefinido' : `${monthsToGoal} meses`}
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              Fazer Aporte
                            </Button>
                            <Button variant="outline" size="sm">
                              Editar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Metas Concluídas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedGoals.map((goal: any) => (
                  <Card key={goal.id} className="financial-card border-green-200 bg-green-50 dark:bg-green-900/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-foreground">{goal.name}</h3>
                          <p className="text-sm text-green-700 dark:text-green-300">Meta alcançada!</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Valor</span>
                          <span className="font-medium">{formatCurrency(parseFloat(goal.targetAmount))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Concluída em</span>
                          <span className="font-medium">{formatDate(goal.targetDate)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
