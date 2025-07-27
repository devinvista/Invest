import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, getAssetVariation } from '@/lib/financial-utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TrendingUp, Plus, TrendingDown, DollarSign, PieChart, Building, Coins, Wallet } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const assetFormSchema = z.object({
  symbol: z.string().min(1, 'Símbolo é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['stock', 'fii', 'crypto', 'fixed_income', 'etf']),
  quantity: z.string().min(1, 'Quantidade é obrigatória'),
  averagePrice: z.string().min(1, 'Preço médio é obrigatório'),
  currentPrice: z.string().optional(),
  sector: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetFormSchema>;

const ASSET_COLORS = [
  'hsl(207, 90%, 54%)',
  'hsl(38, 92%, 50%)',
  'hsl(122, 39%, 49%)',
  'hsl(271, 91%, 65%)',
  'hsl(0, 84%, 60%)',
];

export function Investments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: assets = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/assets'],
  });

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      symbol: '',
      name: '',
      type: 'stock',
      quantity: '',
      averagePrice: '',
      currentPrice: '',
      sector: '',
    },
  });

  const createAssetMutation = useMutation({
    mutationFn: async (data: AssetFormData) => {
      const payload = {
        ...data,
        quantity: parseFloat(data.quantity),
        averagePrice: parseFloat(data.averagePrice),
        currentPrice: data.currentPrice ? parseFloat(data.currentPrice) : parseFloat(data.averagePrice),
      };
      const response = await apiRequest('POST', '/api/assets', payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Ativo adicionado com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
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

  const onSubmit = (data: AssetFormData) => {
    createAssetMutation.mutate(data);
  };

  const getAssetTypeName = (type: string) => {
    const types = {
      stock: 'Ação',
      fii: 'FII',
      crypto: 'Crypto',
      fixed_income: 'Renda Fixa',
      etf: 'ETF',
    };
    return types[type as keyof typeof types] || type;
  };

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case 'stock':
        return <TrendingUp className="h-5 w-5" />;
      case 'fii':
        return <Building className="h-5 w-5" />;
      case 'crypto':
        return <Coins className="h-5 w-5" />;
      case 'fixed_income':
        return <Wallet className="h-5 w-5" />;
      case 'etf':
        return <PieChart className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  // Calculate portfolio metrics
  const totalInvested = assets.reduce((sum: number, asset: any) => 
    sum + (parseFloat(asset.quantity) * parseFloat(asset.averagePrice)), 0
  );

  const currentValue = assets.reduce((sum: number, asset: any) => 
    sum + (parseFloat(asset.quantity) * parseFloat(asset.currentPrice || asset.averagePrice)), 0
  );

  const totalGainLoss = currentValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  // Portfolio allocation by type
  const allocationData = assets.reduce((acc: any, asset: any) => {
    const value = parseFloat(asset.quantity) * parseFloat(asset.currentPrice || asset.averagePrice);
    const existing = acc.find((item: any) => item.name === getAssetTypeName(asset.type));
    
    if (existing) {
      existing.value += value;
    } else {
      acc.push({
        name: getAssetTypeName(asset.type),
        value: value,
        type: asset.type,
      });
    }
    
    return acc;
  }, []);

  // Top performing assets
  const topAssets = assets
    .map((asset: any) => {
      const variation = getAssetVariation(
        parseFloat(asset.currentPrice || asset.averagePrice),
        parseFloat(asset.averagePrice)
      );
      return { ...asset, variation };
    })
    .sort((a: any, b: any) => b.variation - a.variation)
    .slice(0, 5);

  if (isLoading) {
    return (
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
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Investimentos</h1>
          <p className="mt-1 text-muted-foreground">Acompanhe sua carteira de investimentos</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Ativo
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Atual</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(currentValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Investido</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalInvested)}</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ganho/Perda</p>
                <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)}
                </p>
              </div>
              {totalGainLoss >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rentabilidade</p>
                <p className={`text-2xl font-bold ${totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(1)}%
                </p>
              </div>
              <PieChart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {assets.length === 0 ? (
        <Card className="financial-card">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum investimento cadastrado</h3>
            <p className="text-muted-foreground mb-6">
              Adicione seus investimentos para acompanhar a performance da sua carteira
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Ativo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Portfolio Allocation */}
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Alocação por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {allocationData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={ASSET_COLORS[index % ASSET_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {allocationData.map((item: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: ASSET_COLORS[index % ASSET_COLORS.length] }}
                      ></div>
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Maiores Variações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topAssets} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => `${value.toFixed(1)}%`} />
                      <YAxis type="category" dataKey="symbol" width={60} />
                      <Tooltip 
                        formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Variação']}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="variation" 
                        fill="hsl(var(--primary))"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assets List */}
          <Card className="financial-card">
            <CardHeader>
              <CardTitle>Minha Carteira</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assets.map((asset: any) => {
                  const currentPrice = parseFloat(asset.currentPrice || asset.averagePrice);
                  const averagePrice = parseFloat(asset.averagePrice);
                  const quantity = parseFloat(asset.quantity);
                  const totalValue = quantity * currentPrice;
                  const variation = getAssetVariation(currentPrice, averagePrice);

                  return (
                    <div key={asset.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {getAssetTypeIcon(asset.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{asset.symbol}</h4>
                          <p className="text-sm text-muted-foreground">{asset.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">{getAssetTypeName(asset.type)}</Badge>
                            {asset.sector && (
                              <Badge variant="outline">{asset.sector}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatCurrency(totalValue)}</p>
                        <p className="text-sm text-muted-foreground">
                          {quantity} × {formatCurrency(currentPrice)}
                        </p>
                        <p className={`text-sm font-medium ${variation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {variation >= 0 ? '+' : ''}{variation.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Create Asset Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Ativo</DialogTitle>
            <DialogDescription>
              Adicione um novo ativo à sua carteira
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Símbolo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: ITSA4" {...field} />
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
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="stock">Ação</SelectItem>
                          <SelectItem value="fii">FII</SelectItem>
                          <SelectItem value="crypto">Crypto</SelectItem>
                          <SelectItem value="fixed_income">Renda Fixa</SelectItem>
                          <SelectItem value="etf">ETF</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Itaúsa S.A." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.00000001" placeholder="100" {...field} />
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
                        <Input type="number" step="0.01" placeholder="10,50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="currentPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Atual (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="11,20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setor (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Bancos, Tecnologia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createAssetMutation.isPending}>
                  {createAssetMutation.isPending ? 'Adicionando...' : 'Adicionar Ativo'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
