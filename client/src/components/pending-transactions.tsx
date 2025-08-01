import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, AlertCircle, Edit, Trash2 } from "lucide-react";
import { ConfirmTransactionDialog } from "@/components/ui/confirm-transaction-dialog";
import { EditPendingTransactionDialog } from "@/components/ui/edit-pending-transaction-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Transaction } from "@shared/schema";

export default function PendingTransactions() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingTransactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/pending'],
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

  const handleConfirmTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      return apiRequest(`/api/transactions/${transactionId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir transação",
        variant: "destructive",
      });
    },
  });

  const handleDeleteTransaction = (transaction: Transaction) => {
    if (confirm("Tem certeza que deseja excluir esta transação pendente?")) {
      deleteMutation.mutate(transaction.id);
    }
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
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleEditTransaction(transaction)}
                      size="sm"
                      variant="outline"
                      data-testid={`edit-transaction-${transaction.id}`}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDeleteTransaction(transaction)}
                      size="sm"
                      variant="outline"
                      disabled={deleteMutation.isPending}
                      data-testid={`delete-transaction-${transaction.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                    <Button
                      onClick={() => handleConfirmTransaction(transaction)}
                      size="sm"
                      data-testid={`confirm-transaction-${transaction.id}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar
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
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
      
      {editTransaction && (
        <EditPendingTransactionDialog
          transaction={editTransaction}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </Card>
  );
}