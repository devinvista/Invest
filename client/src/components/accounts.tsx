import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/financial-utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Plus, Wallet, CreditCard, PiggyBank, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';

const accountFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['checking', 'savings', 'investment']),
  balance: z.string().min(1, 'Saldo inicial é obrigatório'),
  bankName: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountFormSchema>;

export function Accounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: accounts = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/accounts'],
  });

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: '',
      type: 'checking',
      balance: '',
      bankName: '',
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      const payload = {
        ...data,
        balance: parseFloat(data.balance),
      };
      const response = await apiRequest('POST', '/api/accounts', payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Conta criada com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      setShowCreateDialog(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: AccountFormData) => {
    createAccountMutation.mutate(data);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Wallet className="h-6 w-6" />;
      case 'savings':
        return <PiggyBank className="h-6 w-6" />;
      case 'investment':
        return <CreditCard className="h-6 w-6" />;
      default:
        return <Wallet className="h-6 w-6" />;
    }
  };

  const getAccountTypeName = (type: string) => {
    switch (type) {
      case 'checking':
        return 'Conta Corrente';
      case 'savings':
        return 'Poupança';
      case 'investment':
        return 'Investimento';
      default:
        return type;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'checking':
        return 'bg-blue-100 text-blue-800';
      case 'savings':
        return 'bg-green-100 text-green-800';
      case 'investment':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalBalance = accounts.reduce((sum: number, account: any) => 
    sum + parseFloat(account.balance), 0
  );

  if (isLoading) {
    return (
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
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contas Bancárias</h1>
          <p className="mt-1 text-muted-foreground">Gerencie suas contas e saldos</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="financial-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Saldo Total</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(totalBalance)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {accounts.length} conta{accounts.length !== 1 ? 's' : ''} ativa{accounts.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Building2 className="h-12 w-12 text-primary" />
          </div>
        </CardContent>
      </Card>

      {accounts.length === 0 ? (
        <Card className="financial-card">
          <CardContent className="pt-6 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma conta cadastrada</h3>
            <p className="text-muted-foreground mb-6">
              Adicione suas contas bancárias para começar a gerenciar suas finanças
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Conta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account: any) => (
              <Card key={account.id} className="financial-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {getAccountIcon(account.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        {account.bankName && (
                          <p className="text-sm text-muted-foreground">{account.bankName}</p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(parseFloat(account.balance))}
                      </p>
                      <Badge className={getAccountTypeColor(account.type)}>
                        {getAccountTypeName(account.type)}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                        Receber
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        Transferir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Create Account Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Conta Bancária</DialogTitle>
            <DialogDescription>
              Adicione uma nova conta para gerenciar seus recursos
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Conta</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Conta Corrente Itaú" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Conta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="checking">Conta Corrente</SelectItem>
                        <SelectItem value="savings">Poupança</SelectItem>
                        <SelectItem value="investment">Investimento</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banco (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Itaú, Bradesco, Santander" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo Inicial</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0,00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createAccountMutation.isPending}>
                  {createAccountMutation.isPending ? 'Criando...' : 'Criar Conta'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
