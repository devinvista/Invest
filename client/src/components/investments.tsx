import { useQuery } from '@tanstack/react-query';
import { ModernCard } from '@/components/ui/modern-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatPercentage } from '@/lib/financial-utils';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3, 
  Plus, 
  Wallet,
  DollarSign,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { useState } from 'react';

const ASSET_COLORS = {
  stocks: '#3B82F6',
  fixedIncome: '#10B981',
  crypto: '#F59E0B',
  etfs: '#8B5CF6',
  funds: '#EF4444',
  others: '#6B7280'
};

interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: string;
  quantity: number;
  currentPrice: number;
  totalValue: number;
  variation: number;
  variationPercent: number;
  profitability: number;
  percentage: number;
}

interface InvestmentData {
  totalValue: number;
  appliedValue: number;
  totalProfit: number;
  profitabilityPercent: number;
  variation: number;
  variationPercent: number;
  assets: Asset[];
  portfolioEvolution: any[];
  assetDistribution: any[];
}

export function Investments() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('12m');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: investmentData, isLoading } = useQuery<InvestmentData>({
    queryKey: ['/api/investments'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6 space-y-8">
          <div className="animate-pulse">
            <div className="h-32 bg-muted rounded-2xl mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    totalValue = 210157.40,
    appliedValue = 219016.30,
    totalProfit = 12036.35,
    profitabilityPercent = 34.84,
    variation = -8858.90,
    variationPercent = -4.04,
    assets = [],
    portfolioEvolution = [],
    assetDistribution = [
      { name: 'Ações', value: 125859.50, percentage: 59.89, color: ASSET_COLORS.stocks },
      { name: 'Renda Fixa', value: 42890.25, percentage: 20.04, color: ASSET_COLORS.fixedIncome },
      { name: 'Criptos', value: 19951.28, percentage: 9.49, color: ASSET_COLORS.crypto },
      { name: 'ETFs', value: 9801.00, percentage: 4.66, color: ASSET_COLORS.etfs },
      { name: 'Fundos', value: 1212.73, percentage: 0.58, color: ASSET_COLORS.funds },
      { name: 'Outros', value: 10442.64, percentage: 5.34, color: ASSET_COLORS.others }
    ]
  } = investmentData || {};

  // Mock evolution data
  const evolutionData = [
    { month: 'Jul/24', applied: 100000, profit: 105000 },
    { month: 'Ago/24', applied: 110000, profit: 115000 },
    { month: 'Set/24', applied: 120000, profit: 125000 },
    { month: 'Out/24', applied: 130000, profit: 135000 },
    { month: 'Nov/24', applied: 140000, profit: 145000 },
    { month: 'Dez/24', applied: 150000, profit: 155000 },
    { month: 'Jan/25', applied: appliedValue, profit: totalValue }
  ];

  // Mock assets data
  const mockAssets = [
    {
      id: '1',
      symbol: 'BBAS3',
      name: 'Banco do Brasil',
      type: 'Ações',
      quantity: 900,
      currentPrice: 20.24,
      totalValue: 18216.00,
      variation: -1183.50,
      variationPercent: -6.24,
      profitability: 33.04,
      percentage: 8.65
    },
    {
      id: '2',
      symbol: 'AURE3',
      name: 'Auren Energia',
      type: 'Ações',
      quantity: 1700,
      currentPrice: 9.60,
      totalValue: 16320.00,
      variation: -2940.00,
      variationPercent: -18.20,
      profitability: 0.59,
      percentage: 7.75
    },
    {
      id: '3',
      symbol: 'CSNA3',
      name: 'CSN',
      type: 'Ações',
      quantity: 1500,
      currentPrice: 8.37,
      totalValue: 12555.00,
      variation: -2336.25,
      variationPercent: -18.63,
      profitability: 6.58,
      percentage: 5.96
    },
    {
      id: '4',
      symbol: 'TAEE11',
      name: 'Taesa',
      type: 'Ações',
      quantity: 350,
      currentPrice: 33.49,
      totalValue: 11721.50,
      variation: -146.65,
      variationPercent: -1.24,
      profitability: 8.18,
      percentage: 5.57
    },
    {
      id: '5',
      symbol: 'ITUB4',
      name: 'Itaú Unibanco',
      type: 'Ações',
      quantity: 300,
      currentPrice: 35.21,
      totalValue: 10563.00,
      variation: -448.20,
      variationPercent: -4.24,
      profitability: 7.71,
      percentage: 5.02
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-chart-2 p-8 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-chart-2/70" />
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Meus Investimentos 📈</h1>
                <p className="text-white/80">Acompanhe sua carteira de investimentos</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/10"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                >
                  {balanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="secondary" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Relatório
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-white/80 text-sm mb-1">Patrimônio Total</p>
                <p className="text-2xl font-bold">
                  {balanceVisible ? formatCurrency(totalValue) : '••••••'}
                </p>
                <div className="flex items-center mt-2 text-sm">
                  {variationPercent >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  <span className={variationPercent >= 0 ? 'text-green-200' : 'text-red-200'}>
                    {formatPercentage(variationPercent)}
                  </span>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-white/80 text-sm mb-1">Valor Investido</p>
                <p className="text-2xl font-bold">
                  {balanceVisible ? formatCurrency(appliedValue) : '••••••'}
                </p>
                <p className="text-sm text-white/70 mt-2">Capital aplicado</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-white/80 text-sm mb-1">Lucro Total</p>
                <p className="text-2xl font-bold">
                  {balanceVisible ? formatCurrency(totalProfit) : '••••••'}
                </p>
                <p className="text-sm text-white/70 mt-2">Ganho de capital</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-white/80 text-sm mb-1">Rentabilidade</p>
                <p className="text-2xl font-bold text-green-200">
                  {balanceVisible ? formatPercentage(profitabilityPercent) : '••••••'}
                </p>
                <p className="text-sm text-white/70 mt-2">Performance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Evolution */}
          <Card className="pharos-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Evolução do Patrimônio</CardTitle>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">3 Meses</SelectItem>
                    <SelectItem value="6m">6 Meses</SelectItem>
                    <SelectItem value="12m">12 Meses</SelectItem>
                    <SelectItem value="all">Tudo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolutionData}>
                    <defs>
                      <linearGradient id="appliedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatCurrency(Number(value)), 
                        name === 'applied' ? 'Valor Aplicado' : 'Ganho de Capital'
                      ]}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="applied" 
                      stackId="1"
                      stroke="hsl(var(--success))" 
                      fill="url(#appliedGradient)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stackId="2"
                      stroke="hsl(var(--primary))" 
                      fill="url(#profitGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Asset Distribution */}
          <Card className="pharos-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ativos na Carteira</CardTitle>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="stocks">Ações</SelectItem>
                    <SelectItem value="fixedIncome">Renda Fixa</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={assetDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {assetDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {assetDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {formatPercentage(item.percentage)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {balanceVisible ? formatCurrency(item.value) : '••••••'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Asset Categories */}
        <Tabs defaultValue="stocks" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="stocks">Ações</TabsTrigger>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
              <TabsTrigger value="etfs">ETFs</TabsTrigger>
              <TabsTrigger value="funds">Fundos</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Ativo
              </Button>
            </div>
          </div>

          <TabsContent value="stocks">
            <Card className="pharos-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Ações</CardTitle>
                      <p className="text-sm text-muted-foreground">13 ativos • {formatCurrency(125859.50)} • -9.28%</p>
                    </div>
                  </div>
                  <Badge className="bg-expense/10 text-expense border-expense/20">
                    33.04% rentabilidade
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground">
                        <th className="text-left p-3">Ativo</th>
                        <th className="text-right p-3">Quant.</th>
                        <th className="text-right p-3">Preço Médio</th>
                        <th className="text-right p-3">Preço Atual</th>
                        <th className="text-right p-3">Variação</th>
                        <th className="text-right p-3">Saldo</th>
                        <th className="text-right p-3">Rentabilidade</th>
                        <th className="text-right p-3">% Carteira</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockAssets.map((asset) => (
                        <tr key={asset.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-semibold text-primary">
                                  {asset.symbol.slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-sm">{asset.symbol}</p>
                                <p className="text-xs text-muted-foreground">{asset.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-right p-3 text-sm">{asset.quantity}</td>
                          <td className="text-right p-3 text-sm">{formatCurrency(21.59)}</td>
                          <td className="text-right p-3 text-sm">{formatCurrency(asset.currentPrice)}</td>
                          <td className="text-right p-3">
                            <div className={`flex items-center justify-end space-x-1 ${
                              asset.variationPercent >= 0 ? 'text-success' : 'text-expense'
                            }`}>
                              {asset.variationPercent >= 0 ? (
                                <ArrowUpRight className="h-3 w-3" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3" />
                              )}
                              <span className="text-sm font-medium">
                                {formatPercentage(asset.variationPercent)}
                              </span>
                            </div>
                          </td>
                          <td className="text-right p-3 text-sm font-medium">
                            {balanceVisible ? formatCurrency(asset.totalValue) : '••••••'}
                          </td>
                          <td className="text-right p-3">
                            <Badge variant="outline" className="text-xs">
                              {formatPercentage(asset.profitability)}
                            </Badge>
                          </td>
                          <td className="text-right p-3 text-sm">{formatPercentage(asset.percentage)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crypto">
            <Card className="pharos-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <DollarSign className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Criptomoedas</CardTitle>
                      <p className="text-sm text-muted-foreground">10 ativos • {formatCurrency(19951.28)} • +10.02%</p>
                    </div>
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20">
                    132.61% rentabilidade
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">Nenhuma criptomoeda na carteira</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Crypto
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="etfs">
            <Card className="pharos-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-chart-3/10 rounded-lg">
                      <PieChart className="h-5 w-5 text-chart-3" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">ETFs</CardTitle>
                      <p className="text-sm text-muted-foreground">1 ativo • {formatCurrency(9801.00)} • +1.07%</p>
                    </div>
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20">
                    0.41% rentabilidade
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">ETF LFTB11 em carteira</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar ETF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funds">
            <Card className="pharos-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-chart-4/10 rounded-lg">
                      <Target className="h-5 w-5 text-chart-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Fundos de Investimento</CardTitle>
                      <p className="text-sm text-muted-foreground">1 ativo • {formatCurrency(1212.73)} • 0%</p>
                    </div>
                  </div>
                  <Badge className="bg-expense/10 text-expense border-expense/20">
                    -0.17% rentabilidade
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">1 fundo em carteira</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Fundo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="pharos-card">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-20 flex-col space-y-2">
                <Plus className="h-6 w-6" />
                <span className="text-sm">Novo Aporte</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Activity className="h-6 w-6" />
                <span className="text-sm">Rebalancear</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">Análise</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Agenda</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}