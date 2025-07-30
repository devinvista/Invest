import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/financial-utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Plus, AlertTriangle, Calendar, DollarSign, MoreHorizontal, Wallet, ShoppingCart, Banknote } from 'lucide-react';

const cardFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  limit: z.string().min(1, 'Limite é obrigatório'),
  closingDay: z.number().min(1).max(31),
  dueDay: z.number().min(1).max(31),
  bankName: z.string().optional(),
});

const expenseFormSchema = z.object({
  amount: z.string().min(1, 'Valor é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
});

const paymentFormSchema = z.object({
  amount: z.string().min(1, 'Valor é obrigatório'),
  accountId: z.string().min(1, 'Conta é obrigatória'),
});

type CardFormData = z.infer<typeof cardFormSchema>;
type ExpenseFormData = z.infer<typeof expenseFormSchema>;
type PaymentFormData = z.infer<typeof paymentFormSchema>;

export function Cards() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  const { data: creditCards = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/credit-cards'],
  });

  const { data: accounts = [] } = useQuery<any[]>({
    queryKey: ['/api/accounts'],
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<CardFormData>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      name: '',
      limit: '',
      closingDay: 15,
      dueDay: 10,
      bankName: 'none',
    },
  });

  const expenseForm = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: '',
      description: '',
      categoryId: '',
    },
  });

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: '',
      accountId: '',
    },
  });

  const createCardMutation = useMutation({
    mutationFn: async (data: CardFormData) => {
      const payload = {
        ...data,
        limit: parseFloat(data.limit),
        bankName: data.bankName === 'none' ? undefined : data.bankName,
      };
      const response = await apiRequest('POST', '/api/credit-cards', payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Cartão criado com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/credit-cards'] });
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

  const onSubmit = (data: CardFormData) => {
    createCardMutation.mutate(data);
  };

  const addExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {      
      const response = await apiRequest('POST', '/api/transactions', {
        type: 'expense',
        amount: parseFloat(data.amount),
        description: data.description,
        creditCardId: selectedCard.id,
        categoryId: data.categoryId,
        date: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Despesa adicionada com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setShowExpenseDialog(false);
      expenseForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      // Find an expense category for credit card payments
      const paymentCategory = categories.find((cat: any) => 
        cat.transactionType === 'expense' && cat.name.toLowerCase().includes('pagamento')
      ) || categories.find((cat: any) => cat.transactionType === 'expense');
      
      const response = await apiRequest('POST', '/api/transactions', {
        type: 'expense',
        amount: parseFloat(data.amount),
        description: `Pagamento fatura ${selectedCard.name}`,
        accountId: data.accountId,
        categoryId: paymentCategory?.id || categories[0]?.id,
        date: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Pagamento registrado com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setShowPaymentDialog(false);
      paymentForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onExpenseSubmit = (data: ExpenseFormData) => {
    addExpenseMutation.mutate(data);
  };

  const onPaymentSubmit = (data: PaymentFormData) => {
    paymentMutation.mutate(data);
  };

  const getTotalLimit = () => {
    return creditCards.reduce((sum: number, card: any) => 
      sum + parseFloat(card.limit), 0
    );
  };

  const getTotalUsed = () => {
    return creditCards.reduce((sum: number, card: any) => 
      sum + parseFloat(card.usedAmount), 0
    );
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return (used / limit) * 100;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getDaysUntilDue = (dueDay: number) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const dueDate = new Date(currentYear, currentMonth, dueDay);
    
    if (dueDate < today) {
      dueDate.setMonth(currentMonth + 1);
    }
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-xl"></div>
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
          <h1 className="text-2xl font-bold text-foreground">Cartões de Crédito</h1>
          <p className="mt-1 text-muted-foreground">Controle seus cartões e faturas</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cartão
        </Button>
      </div>

      {/* Summary Cards - Compact Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="vibrant-card-purple">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Limite Total</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(getTotalLimit())}</p>
              </div>
              <CreditCard className="h-6 w-6 text-vibrant-purple" />
            </div>
          </CardContent>
        </Card>

        <Card className="vibrant-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Usado</p>
                <p className="text-lg font-bold text-vibrant-orange">{formatCurrency(getTotalUsed())}</p>
                <p className="text-xs text-muted-foreground">
                  {getTotalLimit() > 0 ? `${((getTotalUsed() / getTotalLimit()) * 100).toFixed(1)}% do limite` : '0%'}
                </p>
              </div>
              <DollarSign className="h-6 w-6 text-vibrant-orange" />
            </div>
          </CardContent>
        </Card>

        <Card className="vibrant-card-teal">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Disponível</p>
                <p className="text-lg font-bold text-vibrant-teal">
                  {formatCurrency(getTotalLimit() - getTotalUsed())}
                </p>
                <p className="text-xs text-muted-foreground">
                  {creditCards.length} {creditCards.length === 1 ? 'cartão' : 'cartões'}
                </p>
              </div>
              <Wallet className="h-6 w-6 text-vibrant-teal" />
            </div>
          </CardContent>
        </Card>
      </div>

      {creditCards.length === 0 ? (
        <Card className="financial-card">
          <CardContent className="pt-6 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum cartão cadastrado</h3>
            <p className="text-muted-foreground mb-6">
              Adicione seus cartões de crédito para acompanhar gastos e faturas
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Cartão
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Credit Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creditCards.map((card: any) => {
              const usagePercentage = getUsagePercentage(parseFloat(card.usedAmount), parseFloat(card.limit));
              const daysUntilDue = getDaysUntilDue(card.dueDay);
              
              return (
                <Card key={card.id} className="financial-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{card.name}</CardTitle>
                        {card.bankName && (
                          <p className="text-sm text-muted-foreground">{card.bankName}</p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Usage */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Usado</span>
                        <span className={getUsageColor(usagePercentage)}>
                          {usagePercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={usagePercentage} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>{formatCurrency(parseFloat(card.usedAmount))}</span>
                        <span>{formatCurrency(parseFloat(card.limit))}</span>
                      </div>
                    </div>

                    {/* Due date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Vencimento</span>
                      </div>
                      <Badge variant={daysUntilDue <= 5 ? "destructive" : "secondary"}>
                        {daysUntilDue} dias
                      </Badge>
                    </div>

                    {/* Closing date */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Fechamento</span>
                      <span>Dia {card.closingDay}</span>
                    </div>

                    {/* Alert for high usage */}
                    {usagePercentage >= 75 && (
                      <div className="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-700 dark:text-yellow-200">
                          {usagePercentage >= 90 ? 'Limite quase esgotado!' : 'Atenção ao limite'}
                        </span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setSelectedCard(card);
                          setShowExpenseDialog(true);
                        }}
                        className="flex-1"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Despesa
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedCard(card);
                          setShowPaymentDialog(true);
                        }}
                        className="flex-1"
                      >
                        <Banknote className="w-4 h-4 mr-1" />
                        Pagar Fatura
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Create Card Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Cartão de Crédito</DialogTitle>
            <DialogDescription>
              Adicione um novo cartão para controlar seus gastos
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cartão</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Itaú Mastercard" {...field} />
                    </FormControl>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um banco ou deixe vazio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum banco selecionado</SelectItem>
                          {accounts
                            .filter((account: any) => account.bankName)
                            .map((account: any) => (
                              <SelectItem key={account.id} value={account.bankName || 'unknown'}>
                                {account.bankName} - {account.name}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite</FormLabel>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="closingDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia do Fechamento</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="31" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia do Vencimento</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="31" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createCardMutation.isPending}>
                  {createCardMutation.isPending ? 'Criando...' : 'Criar Cartão'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Despesa</DialogTitle>
            <DialogDescription>
              Registre uma nova despesa no cartão {selectedCard?.name}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...expenseForm}>
            <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="space-y-4">
              <FormField
                control={expenseForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Supermercado, Restaurante..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={expenseForm.control}
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
                control={expenseForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories
                          .filter((category: any) => category.transactionType === 'expense')
                          .map((category: any) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center space-x-2">
                                <span>{category.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {category.type === 'necessities' && '(Necessidades)'}
                                  {category.type === 'wants' && '(Desejos)'}
                                  {category.type === 'savings' && '(Poupança)'}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowExpenseDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={addExpenseMutation.isPending}
                >
                  {addExpenseMutation.isPending ? 'Adicionando...' : 'Adicionar Despesa'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pagar Fatura</DialogTitle>
            <DialogDescription>
              Registre o pagamento da fatura do cartão {selectedCard?.name}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-4">
              <FormField
                control={paymentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do Pagamento</FormLabel>
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
                control={paymentForm.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta de Débito</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a conta" />
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

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowPaymentDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={paymentMutation.isPending}
                >
                  {paymentMutation.isPending ? 'Processando...' : 'Registrar Pagamento'}
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
