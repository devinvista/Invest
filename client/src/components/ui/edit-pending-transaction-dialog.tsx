import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Loader2, Save, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";
import type { Transaction, Account, Category, CreditCard } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const editTransactionSchema = z.object({
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.string().min(1, "Valor é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  accountId: z.string().optional(),
  creditCardId: z.string().optional(),
  date: z.date(),
});

type EditTransactionData = z.infer<typeof editTransactionSchema>;

interface EditPendingTransactionDialogProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPendingTransactionDialog({
  transaction,
  open,
  onOpenChange,
}: EditPendingTransactionDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EditTransactionData>({
    resolver: zodResolver(editTransactionSchema),
    defaultValues: {
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      categoryId: transaction.categoryId,
      accountId: transaction.accountId || undefined,
      creditCardId: transaction.creditCardId || undefined,
      date: new Date(transaction.date),
    },
  });

  // Reset form when transaction changes
  useEffect(() => {
    form.reset({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      categoryId: transaction.categoryId,
      accountId: transaction.accountId || undefined,
      creditCardId: transaction.creditCardId || undefined,
      date: new Date(transaction.date),
    });
  }, [transaction, form]);

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: creditCards = [] } = useQuery<CreditCard[]>({
    queryKey: ['/api/credit-cards'],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EditTransactionData) => {
      return apiRequest(`/api/transactions/${transaction.id}`, 'PUT', {
        ...data,
        amount: data.amount.toString(),
        date: data.date.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar transação",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditTransactionData) => {
    updateMutation.mutate(data);
  };

  const filteredCategories = categories.filter(cat => 
    cat.transactionType === form.watch("type")
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="edit-pending-transaction-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Editar Transação Pendente
          </DialogTitle>
          <DialogDescription>
            Modifique os dados da transação pendente. Apenas transações ainda não confirmadas podem ser editadas.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} data-testid="select-type">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="transfer">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        {...field}
                        data-testid="input-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="button-date"
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição da transação"
                      {...field}
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} data-testid="select-category">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("type") === "expense" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="accountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conta</FormLabel>
                      <Select value={field.value || ""} onValueChange={(value) => field.onChange(value || undefined)} data-testid="select-account">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a conta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="creditCardId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cartão de Crédito</FormLabel>
                      <Select value={field.value || ""} onValueChange={(value) => field.onChange(value || undefined)} data-testid="select-credit-card">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o cartão" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {creditCards.map((card) => (
                            <SelectItem key={card.id} value={card.id}>
                              {card.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {(form.watch("type") === "income" || form.watch("type") === "transfer") && (
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta</FormLabel>
                    <Select value={field.value || ""} onValueChange={(value) => field.onChange(value || undefined)} data-testid="select-account">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a conta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                data-testid="button-save"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}