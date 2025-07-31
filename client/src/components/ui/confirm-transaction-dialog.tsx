import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Wallet } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Transaction, Account } from "@shared/schema";

interface ConfirmTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfirmTransactionDialog({ 
  transaction, 
  open, 
  onOpenChange 
}: ConfirmTransactionDialogProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const confirmTransactionMutation = useMutation({
    mutationFn: async ({ transactionId, accountId }: { transactionId: string; accountId: string }) => {
      return apiRequest('PUT', `/api/transactions/${transactionId}/confirm`, { accountId });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/budget'] });
      
      const accountName = data.accountName || 'conta selecionada';
      toast({
        title: 'Sucesso',
        description: `Transação confirmada na ${accountName}!`,
      });
      
      onOpenChange(false);
      setSelectedAccountId("");
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao confirmar transação',
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

  const handleConfirm = () => {
    if (!transaction || !selectedAccountId) {
      toast({
        title: 'Atenção',
        description: 'Por favor, selecione uma conta para confirmar a transação.',
        variant: 'destructive',
      });
      return;
    }

    confirmTransactionMutation.mutate({
      transactionId: transaction.id,
      accountId: selectedAccountId,
    });
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Confirmar Transação
          </DialogTitle>
          <DialogDescription>
            Selecione a conta que receberá esta transação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction Details */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="font-medium">{transaction.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{formatDate(transaction.date)}</span>
                  <Badge variant="outline" className="text-xs">
                    {transaction.type === 'income' ? 'Receita' : 
                     transaction.type === 'expense' ? 'Despesa' : 'Transferência'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`text-lg font-bold ${
                transaction.type === 'income' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>

          {/* Account Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Selecionar Conta
            </label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha a conta para receber a transação" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{account.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedAccountId || confirmTransactionMutation.isPending}
              className="flex-1"
            >
              {confirmTransactionMutation.isPending ? (
                <>Confirmando...</>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}