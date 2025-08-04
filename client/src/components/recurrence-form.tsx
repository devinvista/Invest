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
  isRecurring: z.boolean(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
}).refine((data) => data.accountId || data.creditCardId, {
  message: "Conta ou cartão de crédito é obrigatório",
  path: ["accountId"],
}).refine((data) => !data.isRecurring || data.frequency, {
  message: "Frequência é obrigatória para transações recorrentes",
  path: ["frequency"],
});

type RecurrenceFormData = z.infer<typeof recurrenceFormSchema>;

interface RecurrenceFormProps {
  onSuccess?: () => void;
}

export default function RecurrenceForm({ onSuccess }: RecurrenceFormProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [showEndDate, setShowEndDate] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [endType, setEndType] = useState<'repetitions' | 'date' | 'forever'>('repetitions');
  const [repetitions, setRepetitions] = useState<number>(2);

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
      isRecurring: false,
      description: '',
      frequency: 'monthly',
      amount: '',
    },
  });

  const createRecurrenceMutation = useMutation({
    mutationFn: async (data: RecurrenceFormData) => {
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
        startDate: startDate,
        endDate: (data.isRecurring && endType === 'date') ? endDate : null,
        frequency: data.isRecurring ? data.frequency : 'monthly', // Default for one-time
        installments: data.isRecurring && endType === 'repetitions' && repetitions >= 2 ? repetitions : null,
      };
      return apiRequest('POST', '/api/recurrences', payload);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/recurrences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
      
      let description = 'Lançamento planejado criado com sucesso!';
      if (data.installments && data.totalValue) {
        description = `${data.message || description}\nCriadas ${data.installments} parcelas com valor total de R$ ${data.totalValue.toFixed(2)}`;
      }
      
      toast({
        title: 'Sucesso',
        description,
      });
      form.reset();
      setStartDate(new Date());
      setEndDate(undefined);
      setShowEndDate(false);
      setIsRecurring(false);
      setEndType('repetitions');
      setRepetitions(2);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar lançamento planejado',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: RecurrenceFormData) => {
    console.log('Tentativa de envio do formulário');
    console.log('Dados recebidos:', data);
    console.log('Data de início:', startDate);
    
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
      startDate: startDate!,
      endDate: showEndDate ? endDate : null,
      installments: data.isRecurring && endType === 'repetitions' ? repetitions : undefined,
    } as any);
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
          Novo Lançamento Planejado
        </CardTitle>
        <CardDescription>
          Configure um lançamento único ou recorrente para seu orçamento.<br/>
          <span className="text-xs text-muted-foreground">
            💡 Para parcelamentos, use "Recorrente" com 2+ repetições (1 parcela = pagamento único).
          </span>
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
              <Label htmlFor="frequency">Tipo de Lançamento</Label>
              <Select 
                value={isRecurring ? 'recurring' : 'once'} 
                onValueChange={(value) => {
                  const recurring = value === 'recurring';
                  setIsRecurring(recurring);
                  form.setValue('isRecurring', recurring);
                }}
              >
                <SelectTrigger data-testid="select-recurring-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Uma única vez</SelectItem>
                  <SelectItem value="recurring">Recorrente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isRecurring && (
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência</Label>
              <Select 
                value={form.watch('frequency') || ''} 
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
              {form.formState.errors.frequency && (
                <p className="text-sm text-destructive">{form.formState.errors.frequency.message}</p>
              )}
            </div>
          )}

          {isRecurring && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Terminar</Label>
                <Select 
                  value={endType} 
                  onValueChange={(value: 'repetitions' | 'date' | 'forever') => setEndType(value)}
                >
                  <SelectTrigger data-testid="select-end-type">
                    <SelectValue placeholder="Como terminar a recorrência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="repetitions">Após X repetições</SelectItem>
                    <SelectItem value="date">Em uma data específica</SelectItem>
                    <SelectItem value="forever">Para sempre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {endType === 'repetitions' ? (
                <div className="space-y-2">
                  <Label htmlFor="installments">Número de repetições</Label>
                  <Input
                    id="installments"
                    type="number"
                    min="2"
                    placeholder="12"
                    value={repetitions}
                    onChange={(e) => setRepetitions(parseInt(e.target.value) || 2)}
                    data-testid="input-installments"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo 2 repetições (1 parcela = pagamento único)
                  </p>
                  {repetitions < 2 && (
                    <p className="text-sm text-destructive">
                      Para parcelamento, use no mínimo 2 repetições
                    </p>
                  )}
                </div>
              ) : endType === 'date' ? (
                <div className="space-y-2">
                  <Label>Data final</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        data-testid="button-end-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "P", { locale: ptBR }) : "Selecione a data final"}
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
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                    ♾️ Esta recorrência continuará para sempre até que você a exclua manualmente.
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account">Conta/Cartão</Label>
              <Select
                value={
                  form.watch('accountId') ? `account-${form.watch('accountId')}` :
                  form.watch('creditCardId') ? `card-${form.watch('creditCardId')}` : 
                  ''
                }
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
              {form.formState.errors.accountId && (
                <p className="text-sm text-destructive">{form.formState.errors.accountId.message}</p>
              )}
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

          <div className="space-y-2">
            <Label htmlFor="amount">Valor por Parcela (R$)</Label>
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
            {isRecurring && endType === 'repetitions' && repetitions >= 2 && form.watch('amount') && (
              <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
                💰 <strong>Valor total:</strong> R$ {(parseFloat(form.watch('amount')) * repetitions).toFixed(2)} 
                <span className="text-xs"> ({repetitions} × R$ {parseFloat(form.watch('amount')).toFixed(2)})</span>
              </div>
            )}
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
                Criar Lançamento
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}