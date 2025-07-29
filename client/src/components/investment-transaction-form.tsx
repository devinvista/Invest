import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, TrendingUp, TrendingDown } from "lucide-react";

const investmentTransactionSchema = z.object({
  assetId: z.string().min(1, "Selecione um ativo"),
  accountId: z.string().min(1, "Selecione uma conta de investimento"),
  operation: z.enum(["buy", "sell"], { required_error: "Selecione uma operação" }),
  quantity: z.string().min(1, "Quantidade é obrigatória").refine(val => !isNaN(Number(val)) && Number(val) > 0, "Quantidade deve ser positiva"),
  price: z.string().min(1, "Preço é obrigatório").refine(val => !isNaN(Number(val)) && Number(val) > 0, "Preço deve ser positivo"),
  fees: z.string().optional(),
  description: z.string().optional(),
});

type InvestmentTransactionFormData = z.infer<typeof investmentTransactionSchema>;

interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: string;
  quantity: string;
  averagePrice: string;
  currentPrice: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: string;
  bankName: string;
}

export function InvestmentTransactionForm() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InvestmentTransactionFormData>({
    resolver: zodResolver(investmentTransactionSchema),
    defaultValues: {
      operation: "buy",
      fees: "0",
    },
  });

  // Get user assets
  const { data: assets = [] } = useQuery<Asset[]>({
    queryKey: ['/api/assets'],
  });

  // Get user accounts (only investment accounts)
  const { data: allAccounts = [] } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const investmentAccounts = allAccounts.filter(account => account.type === 'investment');

  const createInvestmentTransaction = useMutation({
    mutationFn: async (data: InvestmentTransactionFormData) => {
      const response = await fetch("/api/investment-transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...data,
          totalAmount: (Number(data.quantity) * Number(data.price) + Number(data.fees || 0)).toString(),
          date: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao criar transação");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transação de investimento criada",
        description: "A transação foi registrada com sucesso.",
      });
      form.reset();
      setOpen(false);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/investment-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar transação",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InvestmentTransactionFormData) => {
    createInvestmentTransaction.mutate(data);
  };

  const watchedQuantity = form.watch("quantity");
  const watchedPrice = form.watch("price");
  const watchedFees = form.watch("fees");
  
  const totalAmount = watchedQuantity && watchedPrice 
    ? (Number(watchedQuantity) * Number(watchedPrice) + Number(watchedFees || 0)).toFixed(2)
    : "0.00";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Transação de Investimento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="operation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a operação" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="buy">
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                            Compra
                          </div>
                        </SelectItem>
                        <SelectItem value="sell">
                          <div className="flex items-center">
                            <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
                            Venda
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta de Investimento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a conta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {investmentAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} - R$ {Number(account.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="assetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ativo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ativo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{asset.symbol}</span>
                            <span className="text-sm text-muted-foreground">{asset.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="Ex: 100"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Unitário</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-8"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxas</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-8"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Valor Total:</span>
                <span className="text-lg font-bold text-primary">
                  R$ {totalAmount}
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione observações sobre esta transação..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createInvestmentTransaction.isPending}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              >
                {createInvestmentTransaction.isPending ? "Criando..." : "Criar Transação"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}