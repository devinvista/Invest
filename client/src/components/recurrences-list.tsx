import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Repeat, Calendar, Trash2, Edit, Play, Pause, Eye, CreditCard, BanknoteIcon, Target, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ConfirmTransactionDialog } from "@/components/ui/confirm-transaction-dialog";
import type { Recurrence, Transaction } from "@shared/schema";

interface RecurrenceDetails {
  recurrence: Recurrence;
  pendingTransactions: Transaction[];
  confirmedTransactions: Transaction[];
  totalPendingAmount: number;
  totalConfirmedAmount: number;
}

export default function RecurrencesList() {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedRecurrenceId, setSelectedRecurrenceId] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const { data: recurrences = [], isLoading } = useQuery<Recurrence[]>({
    queryKey: ['/api/recurrences'],
  });

  const { data: recurrenceDetails, isLoading: isLoadingDetails } = useQuery<RecurrenceDetails | undefined>({
    queryKey: ['/api/recurrences', selectedRecurrenceId, 'details'],
    queryFn: () => selectedRecurrenceId ? apiRequest('GET', `/api/recurrences/${selectedRecurrenceId}/details`) : undefined,
    enabled: !!selectedRecurrenceId,
  });

  const updateRecurrenceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Recurrence> }) => {
      return apiRequest('PUT', `/api/recurrences/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recurrences'] });
      setUpdatingId(null);
      toast({
        title: 'Sucesso',
        description: 'Recorrência atualizada com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar recorrência',
        variant: 'destructive',
      });
      setUpdatingId(null);
    },
  });

  const deleteRecurrenceMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/recurrences/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recurrences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: 'Sucesso',
        description: 'Recorrência removida com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao remover recorrência',
        variant: 'destructive',
      });
    },
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      daily: 'Diário',
      weekly: 'Semanal', 
      monthly: 'Mensal',
      yearly: 'Anual'
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  const handleToggleActive = async (recurrence: Recurrence) => {
    setUpdatingId(recurrence.id);
    updateRecurrenceMutation.mutate({
      id: recurrence.id,
      updates: { isActive: !recurrence.isActive }
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta recorrência? Todas as transações pendentes relacionadas serão canceladas.')) {
      deleteRecurrenceMutation.mutate(id);
    }
  };

  const handleConfirmTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsConfirmDialogOpen(true);
  };

  const handleViewDetails = (recurrenceId: string) => {
    setSelectedRecurrenceId(recurrenceId);
  };

  const getInstallmentProgress = (recurrence: Recurrence, details?: RecurrenceDetails) => {
    if (!details || !recurrence.installments || recurrence.installments <= 1) return null;
    
    const confirmed = details.confirmedTransactions.length;
    const pending = details.pendingTransactions.length;
    const total = recurrence.installments;
    const progress = (confirmed / total) * 100;
    
    return {
      confirmed,
      pending,
      total,
      progress,
      pendingAmount: details.totalPendingAmount,
      confirmedAmount: details.totalConfirmedAmount
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Recorrências
          </CardTitle>
          <CardDescription>
            Carregando suas recorrências...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          Recorrências
          {recurrences.length > 0 && (
            <Badge variant="secondary">{recurrences.length}</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Gerencie suas transações recorrentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recurrences.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Repeat className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma recorrência configurada</p>
            <p className="text-sm">Crie recorrências para automatizar suas transações</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recurrences.map((recurrence) => (
              <div
                key={recurrence.id}
                className={`p-4 border rounded-lg transition-colors ${
                  recurrence.isActive 
                    ? 'hover:bg-muted/50' 
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}
                data-testid={`recurrence-${recurrence.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{recurrence.description}</h4>
                      <Badge variant="outline" className="text-xs">
                        {getFrequencyLabel(recurrence.frequency)}
                      </Badge>
                      <Badge 
                        variant={recurrence.type === 'income' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {recurrence.type === 'income' ? 'Receita' : 'Despesa'}
                      </Badge>
                      {!recurrence.isActive && (
                        <Badge variant="destructive" className="text-xs">
                          Pausada
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className={`font-bold ${
                        recurrence.type === 'income' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {recurrence.type === 'income' ? '+' : '-'}{formatCurrency(recurrence.amount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Próxima: {formatDate(recurrence.nextExecutionDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Início: {formatDate(recurrence.startDate)}
                      </span>
                      {recurrence.endDate && (
                        <span>
                          Fim: {formatDate(recurrence.endDate)}
                        </span>
                      )}
                      {recurrence.lastExecutedDate && (
                        <span>
                          Última execução: {formatDate(recurrence.lastExecutedDate)}
                        </span>
                      )}
                      {recurrence.installments && recurrence.installments > 1 && (
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {recurrence.installments} parcelas
                        </span>
                      )}
                    </div>

                    {/* Installment Progress Preview */}
                    {recurrence.installments && recurrence.installments > 1 && (
                      <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progresso das Parcelas</span>
                          <span className="text-xs text-muted-foreground">
                            Clique no ícone de visualização para detalhes
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Confirmadas: ?</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span>Pendentes: ?</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                            <span>Total: {recurrence.installments}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(recurrence.id)}
                            data-testid={`view-details-${recurrence.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Repeat className="h-5 w-5" />
                              Detalhes da Recorrência
                            </DialogTitle>
                            <DialogDescription>
                              {recurrence.description} - {getFrequencyLabel(recurrence.frequency)}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {isLoadingDetails ? (
                            <div className="space-y-4">
                              <div className="h-20 bg-muted animate-pulse rounded-lg" />
                              <div className="h-40 bg-muted animate-pulse rounded-lg" />
                            </div>
                          ) : recurrenceDetails ? (
                            <div className="space-y-6">
                              {/* General Information */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-muted-foreground">Valor</p>
                                  <p className={`text-lg font-bold ${
                                    recurrence.type === 'income' 
                                      ? 'text-green-600 dark:text-green-400' 
                                      : 'text-red-600 dark:text-red-400'
                                  }`}>
                                    {recurrence.type === 'income' ? '+' : '-'}{formatCurrency(recurrence.amount)}
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-muted-foreground">Frequência</p>
                                  <p className="text-lg font-semibold">{getFrequencyLabel(recurrence.frequency)}</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                                  <Badge variant={recurrence.isActive ? "default" : "destructive"}>
                                    {recurrence.isActive ? "Ativa" : "Pausada"}
                                  </Badge>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-muted-foreground">Próxima Execução</p>
                                  <p className="text-sm">{formatDate(recurrence.nextExecutionDate)}</p>
                                </div>
                              </div>

                              {/* Installment Progress */}
                              {(() => {
                                const progress = getInstallmentProgress(recurrence, recurrenceDetails);
                                return progress && (
                                  <div className="space-y-4">
                                    <Separator />
                                    <div>
                                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                        <Target className="h-5 w-5" />
                                        Progresso das Parcelas
                                      </h4>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div className="text-center">
                                          <p className="text-2xl font-bold text-green-600">{progress.confirmed}</p>
                                          <p className="text-sm text-muted-foreground">Confirmadas</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-2xl font-bold text-orange-600">{progress.pending}</p>
                                          <p className="text-sm text-muted-foreground">Pendentes</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-2xl font-bold">{progress.total}</p>
                                          <p className="text-sm text-muted-foreground">Total</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-2xl font-bold text-orange-600">
                                            {formatCurrency(progress.pendingAmount.toString())}
                                          </p>
                                          <p className="text-sm text-muted-foreground">Saldo Pendente</p>
                                        </div>
                                      </div>
                                      <Progress value={progress.progress} className="w-full" />
                                      <p className="text-sm text-muted-foreground mt-2 text-center">
                                        {progress.progress.toFixed(1)}% das parcelas confirmadas
                                      </p>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Pending Transactions */}
                              {recurrenceDetails.pendingTransactions.length > 0 && (
                                <div className="space-y-4">
                                  <Separator />
                                  <div>
                                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                      <Clock className="h-5 w-5" />
                                      Transações Pendentes
                                      <Badge variant="secondary">{recurrenceDetails.pendingTransactions.length}</Badge>
                                    </h4>
                                    <div className="space-y-3">
                                      {recurrenceDetails.pendingTransactions.map((transaction) => (
                                        <div
                                          key={transaction.id}
                                          className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                          <div className="flex items-center gap-3">
                                            <AlertCircle className="h-5 w-5 text-orange-500" />
                                            <div>
                                              <p className="font-medium">{transaction.description}</p>
                                              <p className="text-sm text-muted-foreground">
                                                {formatDate(transaction.date)}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <span className="font-bold text-orange-600">
                                              {formatCurrency(transaction.amount)}
                                            </span>
                                            <Button
                                              size="sm"
                                              onClick={() => handleConfirmTransaction(transaction)}
                                            >
                                              <CheckCircle className="h-4 w-4 mr-2" />
                                              Confirmar
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Confirmed Transactions */}
                              {recurrenceDetails.confirmedTransactions.length > 0 && (
                                <div className="space-y-4">
                                  <Separator />
                                  <div>
                                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                      <CheckCircle className="h-5 w-5" />
                                      Transações Confirmadas
                                      <Badge variant="default">{recurrenceDetails.confirmedTransactions.length}</Badge>
                                    </h4>
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                      {recurrenceDetails.confirmedTransactions.map((transaction) => (
                                        <div
                                          key={transaction.id}
                                          className="flex items-center justify-between p-2 border rounded"
                                        >
                                          <div className="flex items-center gap-3">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <div>
                                              <p className="text-sm font-medium">{transaction.description}</p>
                                              <p className="text-xs text-muted-foreground">
                                                {formatDate(transaction.date)}
                                              </p>
                                            </div>
                                          </div>
                                          <span className="text-sm font-semibold text-green-600">
                                            {formatCurrency(transaction.amount)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-center py-8 text-muted-foreground">
                              Erro ao carregar detalhes da recorrência
                            </p>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Switch
                        checked={recurrence.isActive}
                        onCheckedChange={() => handleToggleActive(recurrence)}
                        disabled={updatingId === recurrence.id}
                        data-testid={`toggle-recurrence-${recurrence.id}`}
                      />
                      <span className="text-sm text-muted-foreground">
                        {recurrence.isActive ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                      </span>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(recurrence.id)}
                      disabled={deleteRecurrenceMutation.isPending}
                      data-testid={`delete-recurrence-${recurrence.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <ConfirmTransactionDialog
        transaction={selectedTransaction}
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      />
    </Card>
  );
}