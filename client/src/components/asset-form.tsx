import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Loader2, TrendingUp, TrendingDown } from "lucide-react";

const assetSchema = z.object({
  symbol: z.string().min(1, "Símbolo é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["stock", "fii", "crypto", "fixed_income", "etf", "fund"], { required_error: "Selecione um tipo" }),
  quantity: z.string().min(1, "Quantidade é obrigatória").refine(val => !isNaN(Number(val)) && Number(val) > 0, "Quantidade deve ser positiva"),
  averagePrice: z.string().min(1, "Preço médio é obrigatório").refine(val => !isNaN(Number(val)) && Number(val) > 0, "Preço deve ser positivo"),
  currentPrice: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

interface AssetSearchResult {
  symbol: string;
  name: string;
  type: string;
  currentPrice: number;
  currency: string;
  exchange: string;
  lastUpdate: string;
}

export function AssetForm() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("stock");
  const [selectedAsset, setSelectedAsset] = useState<AssetSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      type: "stock",
    },
  });

  // Buscar ativos com base na query de pesquisa
  const { data: searchResults = [], isLoading: isLoadingSearch } = useQuery<AssetSearchResult[]>({
    queryKey: ['/api/assets/search', searchQuery, searchType],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const response = await fetch(`/api/assets/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`, {
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

  // Buscar cotação atual quando um ativo é selecionado
  const fetchQuote = async (symbol: string, type: string) => {
    try {
      const response = await fetch(`/api/assets/quote/${symbol}?type=${type}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (response.ok) {
        const quote = await response.json();
        return quote;
      }
    } catch (error) {
      console.error('Erro ao buscar cotação:', error);
    }
    return null;
  };

  // Preencher formulário automaticamente quando um ativo é selecionado
  const handleAssetSelect = async (asset: AssetSearchResult) => {
    setSelectedAsset(asset);
    setIsSearching(true);
    
    // Preencher dados básicos
    form.setValue('symbol', asset.symbol);
    form.setValue('name', asset.name);
    form.setValue('type', asset.type as any);
    
    // Buscar cotação atual
    const quote = await fetchQuote(asset.symbol, asset.type);
    if (quote) {
      form.setValue('currentPrice', quote.currentPrice.toString());
      form.setValue('averagePrice', quote.currentPrice.toString());
    }
    
    setIsSearching(false);
    setSearchQuery('');
  };

  // Reset do formulário quando o tipo muda
  useEffect(() => {
    setSearchType(form.watch('type'));
    setSelectedAsset(null);
  }, [form.watch('type')]);

  const createAsset = useMutation({
    mutationFn: async (data: AssetFormData) => {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...data,
          currentPrice: data.currentPrice || data.averagePrice,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao criar ativo");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Ativo adicionado",
        description: "O ativo foi adicionado à sua carteira com sucesso.",
      });
      form.reset();
      setOpen(false);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar ativo",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AssetFormData) => {
    createAsset.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Ativo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Ativo</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Tipo de Ativo */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Ativo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="stock">Ações</SelectItem>
                      <SelectItem value="fii">FIIs</SelectItem>
                      <SelectItem value="crypto">Criptomoedas</SelectItem>
                      <SelectItem value="fixed_income">Renda Fixa</SelectItem>
                      <SelectItem value="etf">ETFs</SelectItem>
                      <SelectItem value="fund">Fundos</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Busca de Ativos */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Ativo</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={searchType === 'crypto' ? 'Ex: Bitcoin, BTC' : 'Ex: BBAS3, Banco do Brasil'}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isLoadingSearch && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              
              {/* Resultados da busca */}
              {searchResults.length > 0 && (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {searchResults.map((asset, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 transition-colors"
                      onClick={() => handleAssetSelect(asset)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{asset.symbol}</span>
                            <Badge variant="outline" className="text-xs">
                              {asset.exchange}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{asset.name}</p>
                        </div>
                        {asset.currentPrice > 0 && (
                          <div className="text-right">
                            <p className="font-medium">{asset.currency} {asset.currentPrice.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ativo Selecionado */}
            {selectedAsset && (
              <div className="bg-accent/50 rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">Ativo Selecionado:</span>
                  {isSearching && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedAsset.symbol}</p>
                    <p className="text-sm text-muted-foreground">{selectedAsset.name}</p>
                  </div>
                  <Badge variant="outline">{selectedAsset.exchange}</Badge>
                </div>
              </div>
            )}

            {/* Campos do formulário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
            </div>



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
                        placeholder="100"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="averagePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Médio</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="25.50"
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
                          placeholder="27.20"
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

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createAsset.isPending}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              >
                {createAsset.isPending ? "Adicionando..." : "Adicionar Ativo"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}