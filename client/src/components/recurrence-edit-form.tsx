import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Account, Category, CreditCard, Recurrence } from "@shared/schema";

const recurrenceEditSchema = z.object({
  accountId: z.string().optional(),
  creditCardId: z.string().optional(),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  type: z.enum(['income', 'expense']),
  amount: z.string().min(1, "Valor é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  isActive: z.boolean(),
}).refine((data) => data.accountId || data.creditCardId, {
  message: "Conta ou cartão de crédito é obrigatório",
  path: ["accountId"],
});

type RecurrenceEditData = z.infer<typeof recurrenceEditSchema>;

interface RecurrenceEditFormProps {
  recurrence: Recurrence;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RecurrenceEditForm({ recurrence, onSuccess, onCancel }: RecurrenceEditFormProps) {
  const [startDate, setStartDate] = useState<Date>(new Date(recurrence.startDate));
  const [endDate, setEndDate] = useState<Date | undefined>(
    recurrence.endDate ? new Date(recurrence.endDate) : undefined
  );

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const { data: creditCards = [] } = useQuery<CreditCard[]>({
    queryKey: ['/api/credit-cards'],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<RecurrenceEditData>({
    resolver: zodResolver(recurrenceEditSchema),
    defaultValues: {
      type: recurrence.type as 'income' | 'expense',
      amount: recurrence.amount.toString(),
      description: recurrence.description,
      categoryId: recurrence.categoryId,
      accountId: recurrence.accountId || undefined,
      creditCardId: recurrence.creditCardId || undefined,
      frequency: recurrence.frequency,
      isActive: recurrence.isActive,
    },
  });

  const updateRecurrenceMutation = useMutation({
    mutationFn: async (data: RecurrenceEditData) => {
      // Clean amount string and convert to number
      const cleanAmount = data.amount.replace(/[^\d,]/g, '').replace(',', '.');
      const numericAmount = parseFloat(cleanAmount);
      
      if (isNaN(numericAmount)) {
        throw new Error('Valor inválido');
      }
      
      const payload = {
        type: data.type,
        amount: numericAmount.toString(),
        description: data.description,
        categoryId: data.categoryId,
        frequency: data.frequency,
        isActive: data.isActive,
        startDate: startDate.toISOString(),
        endDate: endDate?.toISOString() || null,
        // Only include one of accountId or creditCardId, set the other to null
        accountId: data.accountId || null,
        creditCardId: data.creditCardId || null,
      };
      
      console.log('🔄 Sending update payload:', payload);
      return apiRequest('PUT', `/api/recurrences/${recurrence.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recurrences'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar recorrência',
        variant: 'destructive',
      });
    },
  });

  const selectedType = form.watch('type');
  const selectedAccountType = form.watch('accountId') ? 'account' : 'creditCard';

  // Filter categories based on type
  const filteredCategories = categories.filter(cat => {
    if (selectedType === 'income') {
      return cat.name.includes('Salário') || cat.name.includes('Renda') || cat.name.includes('Rendimentos') || cat.name.includes('Outras Receitas');
    } else {
      return !cat.name.includes('Salário') && !cat.name.includes('Renda') && !cat.name.includes('Rendimentos') && !cat.name.includes('Outras Receitas');
    }
  });

  const onSubmit = (data: RecurrenceEditData) => {
    updateRecurrenceMutation.mutate(data);
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const formattedValue = (parseInt(numericValue) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formattedValue;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    form.setValue('amount', formatted);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Transaction Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Tipo de Transação</Label>
        <Select value={form.watch('type')} onValueChange={(value) => form.setValue('type', value as 'income' | 'expense')}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Receita</SelectItem>
            <SelectItem value="expense">Despesa</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.type && (
          <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          {...form.register('description')}
          placeholder="Ex: Salário mensal"
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Valor (R$)</Label>
        <Input
          id="amount"
          value={form.watch('amount')}
          onChange={handleAmountChange}
          placeholder="0,00"
        />
        {form.formState.errors.amount && (
          <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select value={form.watch('categoryId')} onValueChange={(value) => form.setValue('categoryId', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.icon} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.categoryId && (
          <p className="text-sm text-destructive">{form.formState.errors.categoryId.message}</p>
        )}
      </div>

      {/* Account/Credit Card Selection */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Selecionar Conta ou Cartão</Label>
          <Select
            value={selectedAccountType}
            onValueChange={(value) => {
              if (value === 'account') {
                form.setValue('creditCardId', undefined);
                form.setValue('accountId', accounts[0]?.id || '');
              } else {
                form.setValue('accountId', undefined);
                form.setValue('creditCardId', creditCards[0]?.id || '');
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="account">Conta Bancária</SelectItem>
              <SelectItem value="creditCard">Cartão de Crédito</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedAccountType === 'account' && (
          <div className="space-y-2">
            <Label htmlFor="account">Conta</Label>
            <Select value={form.watch('accountId') || ''} onValueChange={(value) => form.setValue('accountId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} - {account.bankName || 'Banco'} (R$ {parseFloat(account.balance.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedAccountType === 'creditCard' && (
          <div className="space-y-2">
            <Label htmlFor="creditCard">Cartão de Crédito</Label>
            <Select value={form.watch('creditCardId') || ''} onValueChange={(value) => form.setValue('creditCardId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cartão" />
              </SelectTrigger>
              <SelectContent>
                {creditCards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.name} - {card.bankName || 'Banco'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {form.formState.errors.accountId && (
          <p className="text-sm text-destructive">{form.formState.errors.accountId.message}</p>
        )}
      </div>

      {/* Frequency */}
      <div className="space-y-2">
        <Label htmlFor="frequency">Frequência</Label>
        <Select value={form.watch('frequency')} onValueChange={(value) => form.setValue('frequency', value as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a frequência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Diário</SelectItem>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="yearly">Anual</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.frequency && (
          <p className="text-sm text-destructive">{form.formState.errors.frequency.message}</p>
        )}
      </div>

      {/* Start Date */}
      <div className="space-y-2">
        <Label>Data de Início</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => date && setStartDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* End Date */}
      <div className="space-y-2">
        <Label>Data de Fim (Opcional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Sem data de fim"}
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

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="isActive">Status</Label>
        <Select value={form.watch('isActive') ? 'active' : 'inactive'} onValueChange={(value) => form.setValue('isActive', value === 'active')}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativa</SelectItem>
            <SelectItem value="inactive">Pausada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={updateRecurrenceMutation.isPending}
          className="flex-1"
        >
          {updateRecurrenceMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Atualizar Recorrência
        </Button>
      </div>
    </form>
  );
}