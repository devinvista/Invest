import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, TrendingUp, TrendingDown, Search, Plus, Loader2 } from "lucide-react";

const investmentTransactionSchema = z.object({
  assetId: z.string().min(1, "Selecione um ativo"),
  accountId: z.string().min(1, "Selecione uma conta de investimento"),
  operation: z.enum(["buy", "sell"], { required_error: "Selecione uma operação" }),
  quantity: z.string().min(1, "Quantidade é obrigatória").refine(val => !isNaN(Number(val)) && Number(val) > 0, "Quantidade deve ser positiva"),
  price: z.string().min(1, "Preço é obrigatório").refine(val => !isNaN(Number(val)) && Number(val) > 0, "Preço deve ser positivo"),
  fees: z.string().optional(),
  description: z.string().optional(),
});

const newAssetSchema = z.object({
  symbol: z.string().min(1, "Símbolo é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["stock", "fii", "crypto", "fixed_income", "etf", "fund"], { required_error: "Selecione um tipo" }),
  currentPrice: z.string().optional(),
});

type InvestmentTransactionFormData = z.infer<typeof investmentTransactionSchema>;
type NewAssetFormData = z.infer<typeof newAssetSchema>;

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

interface AssetSearchResult {
  symbol: string;
  name: string;
  type: string;
  currentPrice: number;
  currency: string;
  exchange: string;
  lastUpdate: string;
}

export function InvestmentTransactionForm() {
  const [open, setOpen] = useState(false);
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewAssetForm, setShowNewAssetForm] = useState(false);
  const [selectedSearchResult, setSelectedSearchResult] = useState<AssetSearchResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InvestmentTransactionFormData>({
    resolver: zodResolver(investmentTransactionSchema),
    defaultValues: {
      operation: "buy",
      fees: "0",
    },
  });

  const newAssetForm = useForm<NewAssetFormData>({
    resolver: zodResolver(newAssetSchema),
    defaultValues: {
      type: "stock",
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

  // Asset search functionality
  const { data: searchResults = [], isLoading: isSearching } = useQuery<AssetSearchResult[]>({
    queryKey: ['/api/assets/search', searchQuery, assetTypeFilter],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const typeParam = assetTypeFilter === 'all' ? '' : `&type=${assetTypeFilter}`;
      const response = await fetch(`/api/assets/search?q=${encodeURIComponent(searchQuery)}${typeParam}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar ativos');
      }
      
      return response.json();
    },
    enabled: searchQuery.length >= 2,
  });

  // Filter assets by type
  const filteredAssets = assetTypeFilter === 'all' 
    ? assets 
    : assets.filter(asset => asset.type === assetTypeFilter);

  // Asset type options
  const assetTypeOptions = [
    { value: 'all', label: 'Todos os tipos' },
    { value: 'stock', label: 'Ações' },
    { value: 'fii', label: 'FIIs' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'fixed_income', label: 'Renda Fixa' },
    { value: 'etf', label: 'ETFs' },
    { value: 'fund', label: 'Fundos' },
  ];

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

  // Create new asset mutation
  const createAssetMutation = useMutation({
    mutationFn: async (data: NewAssetFormData) => {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...data,
          quantity: "0",
          averagePrice: data.currentPrice || "0",
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao criar ativo");
      }
      
      return response.json();
    },
    onSuccess: (newAsset) => {
      toast({
        title: "Ativo criado",
        description: "O ativo foi adicionado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      form.setValue('assetId', newAsset.id);
      setShowNewAssetForm(false);
      newAssetForm.reset();
      setSelectedSearchResult(null);
      setSearchQuery("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar ativo",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InvestmentTransactionFormData) => {
    createInvestmentTransaction.mutate(data);
  };

  const onNewAssetSubmit = (data: NewAssetFormData) => {
    createAssetMutation.mutate(data);
  };

  // Use selected search result to populate new asset form
  useEffect(() => {
    if (selectedSearchResult && showNewAssetForm) {
      newAssetForm.setValue('symbol', selectedSearchResult.symbol);
      newAssetForm.setValue('name', selectedSearchResult.name);
      newAssetForm.setValue('type', selectedSearchResult.type as any);
      newAssetForm.setValue('currentPrice', selectedSearchResult.currentPrice.toString());
    }
  }, [selectedSearchResult, showNewAssetForm, newAssetForm]);

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
                  
                  {/* Asset Type Filter */}
                  <div className="flex gap-2 mb-3">
                    <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filtrar por tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {assetTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Asset Search */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Pesquisar ativos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Search Results */}
                    {searchQuery.length >= 2 && (
                      <div className="border rounded-lg p-2 max-h-48 overflow-y-auto">
                        {isSearching ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Buscando...
                          </div>
                        ) : searchResults.length > 0 ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-muted-foreground mb-2">
                              Resultados da pesquisa:
                            </div>
                            {searchResults.map((result, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                                onClick={() => {
                                  setSelectedSearchResult(result);
                                  setShowNewAssetForm(true);
                                }}
                              >
                                <div>
                                  <div className="font-medium">{result.symbol}</div>
                                  <div className="text-sm text-muted-foreground">{result.name}</div>
                                  <Badge variant="outline" className="text-xs">
                                    {assetTypeOptions.find(opt => opt.value === result.type)?.label || result.type}
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">R$ {result.currentPrice.toFixed(2)}</div>
                                  <Button size="sm" variant="outline">
                                    <Plus className="w-3 h-3 mr-1" />
                                    Adicionar
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-4 text-muted-foreground">
                            Nenhum ativo encontrado
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Existing Assets Selection */}
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um ativo existente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredAssets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                              <span className="font-medium">{asset.symbol}</span>
                              <span className="text-sm text-muted-foreground">{asset.name}</span>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {assetTypeOptions.find(opt => opt.value === asset.type)?.label || asset.type}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                      {filteredAssets.length === 0 && (
                        <SelectItem value="none" disabled>
                          Nenhum ativo encontrado para este tipo
                        </SelectItem>
                      )}
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

      {/* New Asset Creation Dialog */}
      <Dialog open={showNewAssetForm} onOpenChange={setShowNewAssetForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Ativo</DialogTitle>
          </DialogHeader>
          <Form {...newAssetForm}>
            <form onSubmit={newAssetForm.handleSubmit(onNewAssetSubmit)} className="space-y-4">
              <FormField
                control={newAssetForm.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Símbolo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: BBAS3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={newAssetForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Banco do Brasil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={newAssetForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="stock">Ações</SelectItem>
                        <SelectItem value="fii">FIIs</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
                        <SelectItem value="fixed_income">Renda Fixa</SelectItem>
                        <SelectItem value="etf">ETFs</SelectItem>
                        <SelectItem value="fund">Fundos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={newAssetForm.control}
                name="currentPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Atual (opcional)</FormLabel>
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

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowNewAssetForm(false);
                    setSelectedSearchResult(null);
                    newAssetForm.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAssetMutation.isPending}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  {createAssetMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Ativo
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}