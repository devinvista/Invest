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
import { InvestmentTransactionForm } from './investment-transaction-form';
import { AssetForm } from './asset-form';
import { QuoteUpdater } from './quote-updater';

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
  quantity: string;
  averagePrice: string;
  currentPrice: string;
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
  const [selectedEvolutionType, setSelectedEvolutionType] = useState('all');
  
  // Check if dark mode is active
  const isDarkMode = document.documentElement.classList.contains('dark');

  const { data: investmentData, isLoading } = useQuery<InvestmentData>({
    queryKey: ['/api/investments'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          <div className="animate-pulse">
            <div className="h-24 sm:h-32 bg-muted rounded-xl sm:rounded-2xl mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 sm:h-32 bg-muted rounded-xl animate-pulse"></div>
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

  // Filter asset distribution based on selected category
  const getFilteredAssetDistribution = () => {
    if (selectedCategory === 'all') {
      return assetDistribution;
    }
    
    // Map category values to asset types
    const categoryMap = {
      'stocks': ['Ações'],
      'fixedIncome': ['Renda Fixa'],
      'crypto': ['Criptos'],
      'etfs': ['ETFs'],
      'funds': ['Fundos']
    };
    
    if (selectedCategory === 'stocks') {
      // Return individual stock assets with more detailed breakdown
      return [
        { name: 'BBAS3', value: 18216.00, percentage: 14.53, color: '#8B5CF6' },
        { name: 'AURE3', value: 16320.00, percentage: 12.89, color: '#A855F7' },
        { name: 'CSNA3', value: 12555.00, percentage: 9.66, color: '#C084FC' },
        { name: 'TAEE11', value: 11721.50, percentage: 9.40, color: '#DDD6FE' },
        { name: 'ITUB4', value: 10502.25, percentage: 8.35, color: '#06B6D4' },
        { name: 'GRND3', value: 10080.00, percentage: 8.02, color: '#FCD34D' },
        { name: 'PETR4', value: 9756.00, percentage: 7.76, color: '#10B981' },
        { name: 'ISAE4', value: 9012.00, percentage: 7.18, color: '#F97316' },
        { name: 'GOAU4', value: 7620.00, percentage: 6.06, color: '#EF4444' },
        { name: 'CXSE3', value: 5556.00, percentage: 4.42, color: '#EC4899' },
        { name: 'FESA4', value: 5394.00, percentage: 4.28, color: '#8B5CF6' },
        { name: 'BMGB4', value: 5154.00, percentage: 4.10, color: '#6366F1' },
        { name: 'CMIG4', value: 4212.75, percentage: 3.35, color: '#84CC16' }
      ];
    }
    
    const targetCategories = categoryMap[selectedCategory as keyof typeof categoryMap] || [];
    return assetDistribution.filter(asset => targetCategories.includes(asset.name));
  };

  const filteredAssetDistribution = getFilteredAssetDistribution();

  // Portfolio evolution data with breakdown by investment type
  const getEvolutionData = () => {
    const baseData = [
      { 
        month: 'Jul/24', 
        all: { applied: 95000, profit: 8500 },
        stocks: { applied: 55000, profit: 5200 },
        fixedIncome: { applied: 25000, profit: 2100 },
        crypto: { applied: 8000, profit: 800 },
        etfs: { applied: 5000, profit: 300 },
        funds: { applied: 2000, profit: 100 }
      },
      { 
        month: 'Ago/24', 
        all: { applied: 102000, profit: 9200 },
        stocks: { applied: 59000, profit: 5800 },
        fixedIncome: { applied: 27000, profit: 2200 },
        crypto: { applied: 9000, profit: 900 },
        etfs: { applied: 5500, profit: 200 },
        funds: { applied: 1500, profit: 100 }
      },
      { 
        month: 'Set/24', 
        all: { applied: 108500, profit: 11700 },
        stocks: { applied: 63000, profit: 7100 },
        fixedIncome: { applied: 29000, profit: 2900 },
        crypto: { applied: 9500, profit: 1200 },
        etfs: { applied: 5000, profit: 400 },
        funds: { applied: 2000, profit: 100 }
      },
      { 
        month: 'Out/24', 
        all: { applied: 115000, profit: 10800 },
        stocks: { applied: 67000, profit: 6500 },
        fixedIncome: { applied: 31000, profit: 2800 },
        crypto: { applied: 10000, profit: 1100 },
        etfs: { applied: 5500, profit: 300 },
        funds: { applied: 1500, profit: 100 }
      },
      { 
        month: 'Nov/24', 
        all: { applied: 120000, profit: 14300 },
        stocks: { applied: 70000, profit: 8900 },
        fixedIncome: { applied: 32000, profit: 3200 },
        crypto: { applied: 11000, profit: 1700 },
        etfs: { applied: 6000, profit: 400 },
        funds: { applied: 1000, profit: 100 }
      },
      { 
        month: 'Dez/24', 
        all: { applied: 125000, profit: 16100 },
        stocks: { applied: 73000, profit: 10200 },
        fixedIncome: { applied: 33000, profit: 3600 },
        crypto: { applied: 12000, profit: 1800 },
        etfs: { applied: 6000, profit: 400 },
        funds: { applied: 1000, profit: 100 }
      },
      { 
        month: 'Jan/25', 
        all: { applied: 130000, profit: 18500 },
        stocks: { applied: 76000, profit: 11800 },
        fixedIncome: { applied: 34000, profit: 4000 },
        crypto: { applied: 13000, profit: 2200 },
        etfs: { applied: 6000, profit: 400 },
        funds: { applied: 1000, profit: 100 }
      }
    ];

    return baseData.map(item => {
      const typeData = item[selectedEvolutionType as keyof typeof item] as { applied: number; profit: number };
      return {
        month: item.month,
        applied: typeData.applied,
        profit: typeData.profit,
        total: typeData.applied + typeData.profit
      };
    });
  };

  const evolutionData = getEvolutionData();

  // Get unique asset types from user's assets
  const getAvailableAssetTypes = () => {
    const typeMap = {
      'stock': { key: 'stocks', label: 'Ações', icon: BarChart3, color: 'primary' },
      'fii': { key: 'fiis', label: 'FIIs', icon: Target, color: 'chart-1' },
      'crypto': { key: 'crypto', label: 'Crypto', icon: DollarSign, color: 'warning' },
      'fixed_income': { key: 'fixedIncome', label: 'Renda Fixa', icon: PieChart, color: 'chart-2' },
      'etf': { key: 'etfs', label: 'ETFs', icon: PieChart, color: 'chart-3' },
      'fund': { key: 'funds', label: 'Fundos', icon: Target, color: 'chart-4' }
    };

    if (!assets || assets.length === 0) {
      return []; // No assets, no tabs
    }

    const uniqueTypes = Array.from(new Set(assets.map(asset => asset.type)));
    return uniqueTypes
      .filter((type): type is keyof typeof typeMap => type in typeMap)
      .map(type => typeMap[type]);
  };

  const availableAssetTypes = getAvailableAssetTypes();

  // Group assets by type
  const getAssetsByType = (targetType: string) => {
    const typeMapping: Record<string, string> = {
      'stocks': 'stock',
      'fiis': 'fii', 
      'crypto': 'crypto',
      'fixedIncome': 'fixed_income',
      'etfs': 'etf',
      'funds': 'fund'
    };
    
    const dbType = typeMapping[targetType];
    return assets.filter(asset => asset.type === dbType);
  };

  // Mock assets data (keeping for reference)
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
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-primary to-chart-2 p-4 sm:p-6 lg:p-8 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-chart-2/70" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Meus Investimentos 📈</h1>
                <p className="text-white/80 text-sm sm:text-base">Acompanhe sua carteira de investimentos</p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <InvestmentTransactionForm />
                <QuoteUpdater assets={assets || []} />
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/10 p-2"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                >
                  {balanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="secondary" size="sm" className="text-xs sm:text-sm">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Relatório</span>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                <div className="flex items-center space-x-2">
                  <Select value={selectedEvolutionType} onValueChange={setSelectedEvolutionType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="stocks">Ações</SelectItem>
                      <SelectItem value="fixedIncome">Renda Fixa</SelectItem>
                      <SelectItem value="crypto">Criptos</SelectItem>
                      <SelectItem value="etfs">ETFs</SelectItem>
                      <SelectItem value="funds">Fundos</SelectItem>
                    </SelectContent>
                  </Select>
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
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={evolutionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="appliedGradientBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                      </linearGradient>
                      <linearGradient id="profitGradientBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
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
                        name === 'applied' ? 'Valor aplicado' : 'Ganho capital'
                      ]}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="applied" 
                      stackId="a"
                      fill="url(#appliedGradientBar)"
                      radius={[0, 0, 4, 4]}
                      name="applied"
                    />
                    <Bar 
                      dataKey="profit" 
                      stackId="a"
                      fill="url(#profitGradientBar)"
                      radius={[4, 4, 0, 0]}
                      name="profit"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-emerald-500 to-emerald-600"></div>
                  <span className="text-sm font-medium">Valor aplicado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-emerald-400 to-emerald-500"></div>
                  <span className="text-sm font-medium">Ganho capital</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asset Distribution */}
          <Card className="pharos-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ativos na Carteira</CardTitle>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="stocks">Ações</SelectItem>
                    <SelectItem value="fixedIncome">Renda Fixa</SelectItem>
                    <SelectItem value="crypto">Criptos</SelectItem>
                    <SelectItem value="etfs">ETFs</SelectItem>
                    <SelectItem value="funds">Fundos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 h-80 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={filteredAssetDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={120}
                        paddingAngle={1}
                        dataKey="value"
                        stroke="none"
                      >
                        {filteredAssetDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [
                          balanceVisible ? formatCurrency(Number(value)) : '••••••',
                          name
                        ]}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3 max-h-80 overflow-y-auto pr-2">
                  {filteredAssetDistribution
                    .sort((a, b) => b.percentage - a.percentage)
                    .map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/30 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-sm shadow-sm" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {formatPercentage(item.percentage)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {balanceVisible ? formatCurrency(item.value) : '••••••'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {filteredAssetDistribution.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <PieChart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Nenhum ativo na carteira</p>
                      <p className="text-xs mt-1">Adicione investimentos para ver a distribuição</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Asset Categories - Only show types that user has */}
        {availableAssetTypes.length > 0 ? (
          <Tabs defaultValue={availableAssetTypes[0]?.key} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="grid w-full max-w-md" style={{ gridTemplateColumns: `repeat(${Math.min(availableAssetTypes.length, 6)}, 1fr)` }}>
                {availableAssetTypes.map(type => (
                  <TabsTrigger key={type.key} value={type.key}>
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <AssetForm />
            </div>
          </div>

            {availableAssetTypes.map(assetType => {
              const assetsOfType = getAssetsByType(assetType.key);
              const totalValue = assetsOfType.reduce((sum, asset) => sum + (Number(asset.quantity) * Number(asset.currentPrice || asset.averagePrice)), 0);
              const totalVariation = assetsOfType.reduce((sum, asset) => {
                const currentValue = Number(asset.quantity) * Number(asset.currentPrice || asset.averagePrice);
                const avgValue = Number(asset.quantity) * Number(asset.averagePrice);
                return sum + (currentValue - avgValue);
              }, 0);
              const variationPercent = totalValue > 0 ? (totalVariation / (totalValue - totalVariation)) * 100 : 0;
              const Icon = assetType.icon;

              return (
                <TabsContent key={assetType.key} value={assetType.key}>
                  <Card className="pharos-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{assetType.label}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {assetsOfType.length} ativo{assetsOfType.length !== 1 ? 's' : ''} • {formatCurrency(totalValue)} • {formatPercentage(variationPercent)}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${variationPercent >= 0 ? 'bg-success/10 text-success border-success/20' : 'bg-expense/10 text-expense border-expense/20'}`}>
                          {formatPercentage(variationPercent)} rentabilidade
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {assetsOfType.length > 0 ? (
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
                                <th className="text-right p-3">% Carteira</th>
                              </tr>
                            </thead>
                            <tbody>
                              {assetsOfType.map((asset) => {
                                const currentValue = Number(asset.quantity) * Number(asset.currentPrice || asset.averagePrice);
                                const avgValue = Number(asset.quantity) * Number(asset.averagePrice);
                                const assetVariation = currentValue - avgValue;
                                const assetVariationPercent = avgValue > 0 ? (assetVariation / avgValue) * 100 : 0;
                                const portfolioPercent = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;

                                return (
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
                                    <td className="text-right p-3 text-sm">{Number(asset.quantity).toLocaleString('pt-BR')}</td>
                                    <td className="text-right p-3 text-sm">{formatCurrency(Number(asset.averagePrice))}</td>
                                    <td className="text-right p-3 text-sm">{formatCurrency(Number(asset.currentPrice || asset.averagePrice))}</td>
                                    <td className="text-right p-3">
                                      <div className={`flex items-center justify-end space-x-1 ${
                                        assetVariationPercent >= 0 ? 'text-success' : 'text-expense'
                                      }`}>
                                        {assetVariationPercent >= 0 ? (
                                          <ArrowUpRight className="h-3 w-3" />
                                        ) : (
                                          <ArrowDownRight className="h-3 w-3" />
                                        )}
                                        <span className="text-sm font-medium">
                                          {formatPercentage(assetVariationPercent)}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="text-right p-3 text-sm font-medium">
                                      {balanceVisible ? formatCurrency(currentValue) : '••••••'}
                                    </td>
                                    <td className="text-right p-3 text-sm">{formatPercentage(portfolioPercent)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="mb-4">Nenhum ativo {assetType.label.toLowerCase()} na carteira</p>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar {assetType.label}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        ) : (
          // Show message when no assets
          <Card className="pharos-card">
            <CardContent className="text-center py-12">
              <PieChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum ativo na carteira</h3>
              <p className="text-muted-foreground mb-6">Comece adicionando seus primeiros investimentos</p>
              <div className="flex gap-2 justify-center">
                <AssetForm />
                <InvestmentTransactionForm />
              </div>
            </CardContent>
          </Card>
        )}

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