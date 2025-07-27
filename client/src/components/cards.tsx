import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { CreditCard, Plus, AlertTriangle, Calendar, DollarSign, MoreHorizontal, Wallet } from 'lucide-react';

const cardFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  limit: z.string().min(1, 'Limite é obrigatório'),
  closingDay: z.number().min(1).max(31),
  dueDay: z.number().min(1).max(31),
  bankName: z.string().optional(),
});

type CardFormData = z.infer<typeof cardFormSchema>;

export function Cards() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: creditCards = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/credit-cards'],
  });

  const form = useForm<CardFormData>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      name: '',
      limit: '',
      closingDay: 15,
      dueDay: 10,
      bankName: '',
    },
  });

  const createCardMutation = useMutation({
    mutationFn: async (data: CardFormData) => {
      const payload = {
        ...data,
        limit: parseFloat(data.limit),
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
    );
  }

  return (
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Limite Total</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(getTotalLimit())}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usado</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(getTotalUsed())}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disponível</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(getTotalLimit() - getTotalUsed())}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-green-600" />
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
                      <Input placeholder="Ex: Itaú, Bradesco, Santander" {...field} />
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
    </div>
  );
}
