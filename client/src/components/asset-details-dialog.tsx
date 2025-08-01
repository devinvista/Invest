import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCurrency, formatPercentage } from '@/lib/financial-utils';
import { TrendingUp, TrendingDown, Activity, DollarSign, Calendar, PieChart } from 'lucide-react';

interface AssetDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  name: string;
  type: string;
}

interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface FundamentalData {
  symbol: string;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
  eps: number;
  beta: number;
  week52High: number;
  week52Low: number;
  currency: string;
}

export function AssetDetailsDialog({ isOpen, onClose, symbol, name, type }: AssetDetailsDialogProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('3m');

  // Buscar dados históricos
  const { data: historicalData, isLoading: historicalLoading } = useQuery<HistoricalData[]>({
    queryKey: ['/api/assets', symbol, 'historical', selectedPeriod],
    enabled: isOpen && !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });

  // Buscar dados fundamentais (apenas para ações)
  const { data: fundamentalData, isLoading: fundamentalLoading } = useQuery<FundamentalData>({
    queryKey: ['/api/assets', symbol, 'fundamentals'],
    enabled: isOpen && !!symbol && (type === 'stock' || type === 'etf'),
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
  });

  // Buscar cotação atual
  const { data: currentQuote } = useQuery<{
    currentPrice: number;
    changePercent: number;
    currency?: string;
  }>({
    queryKey: ['/api/assets/quote', symbol],
    enabled: isOpen && !!symbol,
    staleTime: 60 * 1000, // 1 minuto
  });

  // Formatar dados para o gráfico
  const chartData = historicalData?.slice(0, 30).reverse().map((item: HistoricalData) => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
    price: item.close,
    volume: item.volume
  }));

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-blue-600" />
            <div>
              <div className="font-bold text-lg">{symbol}</div>
              <div className="font-normal text-sm text-muted-foreground">{name}</div>
            </div>
            {currentQuote && (
              <div className="ml-auto text-right">
                <div className="text-2xl font-bold">
                  {formatCurrency(currentQuote.currentPrice)}
                </div>
                <div className={`flex items-center gap-1 ${
                  currentQuote.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {currentQuote.changePercent >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {formatPercentage(currentQuote.changePercent)}
                  </span>
                </div>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chart">Gráfico</TabsTrigger>
            <TabsTrigger value="fundamentals" disabled={!fundamentalData && !fundamentalLoading}>
              Fundamentos
            </TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Evolução do Preço</span>
                  <div className="flex gap-2">
                    {['1m', '3m', '6m', '1y'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`px-3 py-1 text-sm rounded ${
                          selectedPeriod === period
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historicalLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse text-muted-foreground">Carregando dados...</div>
                  </div>
                ) : chartData && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        domain={['dataMin - 5', 'dataMax + 5']}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip 
                        formatter={(value: number) => [
                          formatCurrency(value), 
                          'Preço'
                        ]}
                        labelStyle={{ color: '#000' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#2563EB" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Dados históricos não disponíveis
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fundamentals" className="space-y-4">
            {fundamentalLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-muted-foreground">Carregando dados fundamentais...</div>
              </div>
            ) : fundamentalData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Valor de Mercado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {fundamentalData.marketCap > 0 ? formatLargeNumber(fundamentalData.marketCap) : 'N/A'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">P/L</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {fundamentalData.peRatio > 0 ? fundamentalData.peRatio.toFixed(2) : 'N/A'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Dividend Yield</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {fundamentalData.dividendYield > 0 
                        ? formatPercentage(fundamentalData.dividendYield * 100)
                        : 'N/A'
                      }
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">LPA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {fundamentalData.eps !== 0 
                        ? formatCurrency(fundamentalData.eps)
                        : 'N/A'
                      }
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Beta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {fundamentalData.beta > 0 ? fundamentalData.beta.toFixed(2) : 'N/A'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">52 Semanas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-green-600">Máx: </span>
                        {formatCurrency(fundamentalData.week52High)}
                      </div>
                      <div className="text-sm">
                        <span className="text-red-600">Mín: </span>
                        {formatCurrency(fundamentalData.week52Low)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                Dados fundamentais não disponíveis
              </div>
            )}
          </TabsContent>

          <TabsContent value="volume" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Volume de Negociação</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={formatLargeNumber} />
                      <Tooltip 
                        formatter={(value: number) => [formatLargeNumber(value), 'Volume']}
                        labelStyle={{ color: '#000' }}
                      />
                      <Bar dataKey="volume" fill="#2563EB" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Dados de volume não disponíveis
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}