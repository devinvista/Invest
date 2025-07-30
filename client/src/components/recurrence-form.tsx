import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Repeat, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Account, Category, CreditCard } from "@shared/schema";

const recurrenceFormSchema = z.object({
  accountId: z.string().optional(),
  creditCardId: z.string().optional(),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  type: z.enum(['income', 'expense']),
  amount: z.string().min(1, "Valor é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  startDate: z.date(),
  endDate: z.date().optional(),
  installments: z.number().optional(),
}).refine((data) => data.accountId || data.creditCardId, {
  message: "Conta ou cartão de crédito é obrigatório",
  path: ["accountId"],
});

type RecurrenceFormData = z.infer<typeof recurrenceFormSchema>;

interface RecurrenceFormProps {
  onSuccess?: () => void;
}

export default function RecurrenceForm({ onSuccess }: RecurrenceFormProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [showEndDate, setShowEndDate] = useState(false);

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const { data: creditCards = [] } = useQuery<CreditCard[]>({
    queryKey: ['/api/credit-cards'],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<RecurrenceFormData>({
    resolver: zodResolver(recurrenceFormSchema),
    defaultValues: {
      type: 'expense',
      frequency: 'monthly',
      amount: '',
      description: '',
      installments: 1,
    },
  });

  const createRecurrenceMutation = useMutation({
    mutationFn: async (data: RecurrenceFormData) => {
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
        startDate: startDate,
        endDate: showEndDate ? endDate : null,
      };
      return apiRequest('POST', '/api/recurrences', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recurrences'] });
      toast({
        title: 'Sucesso',
        description: 'Recorrência criada com sucesso!',
      });
      form.reset();
      setStartDate(new Date());
      setEndDate(undefined);
      setShowEndDate(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar recorrência',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: RecurrenceFormData) => {
    console.log('Form submission data:', data);
    console.log('Start date:', startDate);
    console.log('Form errors:', form.formState.errors);
    
    if (!startDate) {
      toast({
        title: 'Erro',
        description: 'Data de início é obrigatória',
        variant: 'destructive',
      });
      return;
    }

    createRecurrenceMutation.mutate({
      ...data,
      startDate,
      endDate: showEndDate ? endDate : undefined,
    });
  };

  const frequencyOptions = [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'yearly', label: 'Anual' },
  ];

  const expenseCategories = categories.filter(cat => cat.transactionType === 'expense');
  const incomeCategories = categories.filter(cat => cat.transactionType === 'income');
  
  const selectedType = form.watch('type');
  const availableCategories = selectedType === 'income' ? incomeCategories : expenseCategories;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          Nova Recorrência
        </CardTitle>
        <CardDescription>
          Configure uma transação recorrente que será criada automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo da Transação</Label>
              <Select 
                value={form.watch('type')} 
                onValueChange={(value: 'income' | 'expense') => form.setValue('type', value)}
              >
                <SelectTrigger data-testid="select-transaction-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência</Label>
              <Select 
                value={form.watch('frequency')} 
                onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => 
                  form.setValue('frequency', value)
                }
              >
                <SelectTrigger data-testid="select-frequency">
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account">Conta/Cartão</Label>
              <Select
                value={form.watch('accountId') || form.watch('creditCardId') || ''}
                onValueChange={(value) => {
                  if (value.startsWith('account-')) {
                    form.setValue('accountId', value.replace('account-', ''));
                    form.setValue('creditCardId', undefined);
                  } else if (value.startsWith('card-')) {
                    form.setValue('creditCardId', value.replace('card-', ''));
                    form.setValue('accountId', undefined);
                  }
                }}
              >
                <SelectTrigger data-testid="select-account">
                  <SelectValue placeholder="Selecione conta ou cartão" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={`account-${account.id}`}>
                      {account.name} - {account.type}
                    </SelectItem>
                  ))}
                  {creditCards.map((card) => (
                    <SelectItem key={card.id} value={`card-${card.id}`}>
                      {card.name} (Cartão)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select 
                value={form.watch('categoryId')} 
                onValueChange={(value) => form.setValue('categoryId', value)}
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                {...form.register('amount')}
                data-testid="input-amount"
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="installments">Parcelas (opcional)</Label>
              <Input
                id="installments"
                type="number"
                min="1"
                placeholder="1"
                {...form.register('installments', { valueAsNumber: true })}
                data-testid="input-installments"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição da recorrência..."
              {...form.register('description')}
              data-testid="textarea-description"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-testid="button-start-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "P", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasEndDate"
                  checked={showEndDate}
                  onChange={(e) => setShowEndDate(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="hasEndDate">Definir data final</Label>
              </div>
              {showEndDate && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-testid="button-end-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "P", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={createRecurrenceMutation.isPending}
            data-testid="button-create-recurrence"
          >
            {createRecurrenceMutation.isPending ? (
              <>
                <Plus className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Criar Recorrência
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}