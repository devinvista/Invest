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
import { Building2, Plus, Wallet, CreditCard, PiggyBank, ArrowUpRight, ArrowDownRight, MoreHorizontal, Edit, Send } from 'lucide-react';

const accountFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['checking', 'savings', 'investment']),
  balance: z.string().min(1, 'Saldo inicial é obrigatório'),
  bankName: z.string().optional(),
});

const transferFormSchema = z.object({
  fromAccountId: z.string().min(1, 'Conta de origem é obrigatória'),
  toAccountId: z.string().min(1, 'Conta de destino é obrigatória'),
  amount: z.string().min(1, 'Valor é obrigatório'),
  description: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountFormSchema>;
type TransferFormData = z.infer<typeof transferFormSchema>;

export function Accounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);

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

  const editForm = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
  });

  const transferForm = useForm<TransferFormData>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      fromAccountId: '',
      toAccountId: '',
      amount: '',
      description: '',
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

  const updateAccountMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      const payload = {
        name: data.name,
        type: data.type,
        bankName: data.bankName,
      };
      const response = await apiRequest('PUT', `/api/accounts/${editingAccount.id}`, payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Conta atualizada com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      setShowEditDialog(false);
      setEditingAccount(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const transferMutation = useMutation({
    mutationFn: async (data: TransferFormData) => {
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
      };
      const response = await apiRequest('POST', '/api/accounts/transfer', payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Transferência realizada com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      setShowTransferDialog(false);
      transferForm.reset();
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

  const onEditSubmit = (data: AccountFormData) => {
    updateAccountMutation.mutate(data);
  };

  const onTransferSubmit = (data: TransferFormData) => {
    if (data.fromAccountId === data.toAccountId) {
      toast({
        title: 'Erro',
        description: 'As contas de origem e destino devem ser diferentes',
        variant: 'destructive',
      });
      return;
    }
    transferMutation.mutate(data);
  };

  const handleEditAccount = (account: any) => {
    setEditingAccount(account);
    editForm.reset({
      name: account.name,
      type: account.type,
      balance: account.balance,
      bankName: account.bankName || '',
    });
    setShowEditDialog(true);
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
      <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50/30">
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
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50/30">
      <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contas Bancárias</h1>
          <p className="mt-1 text-muted-foreground">Gerencie suas contas e saldos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTransferDialog(true)} disabled={accounts.length < 2}>
            <Send className="w-4 h-4 mr-2" />
            Transferir
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Conta
          </Button>
        </div>
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
                    <Button variant="ghost" size="sm" onClick={() => handleEditAccount(account)}>
                      <Edit className="h-4 w-4" />
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
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditAccount(account)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowTransferDialog(true)} disabled={accounts.length < 2}>
                        <Send className="w-4 h-4 mr-1" />
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

      {/* Edit Account Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Conta</DialogTitle>
            <DialogDescription>
              Atualize as informações da conta
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Conta</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Conta Corrente Principal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo da Conta</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checking">Conta Corrente</SelectItem>
                          <SelectItem value="savings">Poupança</SelectItem>
                          <SelectItem value="investment">Investimento</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
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

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateAccountMutation.isPending}>
                  {updateAccountMutation.isPending ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transferir entre Contas</DialogTitle>
            <DialogDescription>
              Transfira dinheiro entre suas contas
            </DialogDescription>
          </DialogHeader>
          
          <Form {...transferForm}>
            <form onSubmit={transferForm.handleSubmit(onTransferSubmit)} className="space-y-4">
              <FormField
                control={transferForm.control}
                name="fromAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta de Origem</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a conta de origem" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account: any) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name} - {formatCurrency(parseFloat(account.balance))}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={transferForm.control}
                name="toAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta de Destino</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a conta de destino" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account: any) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name} - {formatCurrency(parseFloat(account.balance))}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={transferForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
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

              <FormField
                control={transferForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Transferência para emergência" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowTransferDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={transferMutation.isPending}>
                  {transferMutation.isPending ? 'Transferindo...' : 'Transferir'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
