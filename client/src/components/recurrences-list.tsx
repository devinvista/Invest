import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Repeat, Calendar, Trash2, Edit, Target } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Recurrence } from "@shared/schema";

export default function RecurrencesList() {
  const { data: recurrences = [], isLoading } = useQuery<Recurrence[]>({
    queryKey: ['/api/recurrences'],
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta recorrência? Todas as transações pendentes relacionadas serão canceladas.')) {
      deleteRecurrenceMutation.mutate(id);
    }
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


                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log('Edit recurrence:', recurrence.id)}
                      data-testid={`edit-recurrence-${recurrence.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
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
    </Card>
  );
}