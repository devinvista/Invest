import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Transaction } from "@shared/schema";

export default function PendingTransactions() {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const { data: pendingTransactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/pending'],
  });

  const confirmTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      return apiRequest('PUT', `/api/transactions/${transactionId}/confirm`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/budget'] });
      setConfirmingId(null);
      toast({
        title: 'Sucesso',
        description: 'Transação confirmada com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao confirmar transação',
        variant: 'destructive',
      });
      setConfirmingId(null);
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

  const handleConfirmTransaction = (transactionId: string) => {
    setConfirmingId(transactionId);
    confirmTransactionMutation.mutate(transactionId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Transações Pendentes
          </CardTitle>
          <CardDescription>
            Carregando transações aguardando confirmação...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const transactions = pendingTransactions || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Transações Pendentes
          {transactions.length > 0 && (
            <Badge variant="secondary">{transactions.length}</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Lançamentos programados aguardando confirmação
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma transação pendente no momento</p>
            <p className="text-sm">Todas as suas transações estão confirmadas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction: Transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                data-testid={`pending-transaction-${transaction.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(transaction.date)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {transaction.type === 'income' ? 'Receita' : 
                         transaction.type === 'expense' ? 'Despesa' : 'Transferência'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      Pendente
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleConfirmTransaction(transaction.id)}
                    disabled={confirmingId === transaction.id}
                    size="sm"
                    data-testid={`confirm-transaction-${transaction.id}`}
                  >
                    {confirmingId === transaction.id ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirmar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}