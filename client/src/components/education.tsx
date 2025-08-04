import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/financial-utils';
import { 
  GraduationCap, 
  BookOpen, 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Clock,
  PlayCircle,
  ExternalLink,
  Search
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';

const educationalContent = {
  articles: [
    {
      id: 1,
      title: "Como aplicar o método 50/30/20 na prática",
      description: "Aprenda a dividir sua renda de forma equilibrada entre necessidades, desejos e poupança.",
      category: "Orçamento",
      readTime: "5 min",
      difficulty: "Iniciante",
      content: `
        O método 50/30/20 é uma das estratégias mais simples e eficazes para organizar suas finanças pessoais.
        
        **Como funciona:**
        - **50% para necessidades**: Moradia, alimentação, transporte, saúde
        - **30% para desejos**: Entretenimento, hobbies, compras não essenciais
        - **20% para poupança**: Investimentos, reserva de emergência, quitação de dívidas
        
        **Dicas práticas:**
        1. Calcule sua renda líquida mensal
        2. Multiplique por 0,5, 0,3 e 0,2 para definir os valores
        3. Use diferentes contas ou categorias para separar os gastos
        4. Revise mensalmente e ajuste quando necessário
      `
    },
    {
      id: 2,
      title: "Reserva de emergência: quanto ter e onde investir",
      description: "Descubra a importância da reserva de emergência e as melhores opções de investimento.",
      category: "Investimentos",
      readTime: "8 min",
      difficulty: "Intermediário",
      content: `
        A reserva de emergência é fundamental para sua segurança financeira.
        
        **Quanto ter:**
        - 3-6 meses de gastos se você tem estabilidade no emprego
        - 6-12 meses se você é autônomo ou tem renda variável
        
        **Onde investir:**
        - Poupança (liquidez imediata, mas baixo rendimento)
        - CDB com liquidez diária
        - Tesouro Selic
        - Fundos DI
        
        **Como construir:**
        1. Defina sua meta baseada nos gastos mensais
        2. Comece com pequenos valores mensais
        3. Use valores extras (13º, bônus) para acelerar
        4. Mantenha em investimentos líquidos e seguros
      `
    },
    {
      id: 3,
      title: "Cartão de crédito: aliado ou vilão?",
      description: "Entenda como usar o cartão de crédito a seu favor e evitar as armadilhas das dívidas.",
      category: "Crédito",
      readTime: "6 min",
      difficulty: "Iniciante",
      content: `
        O cartão de crédito pode ser uma ferramenta poderosa se usado corretamente.
        
        **Vantagens:**
        - Facilita o controle de gastos
        - Oferece proteção nas compras
        - Programas de pontos e cashback
        - Prazo adicional para pagamento
        
        **Como usar corretamente:**
        1. Pague sempre o valor integral da fatura
        2. Use no máximo 30% do limite disponível
        3. Monitore os gastos regularmente
        4. Evite parcelamentos desnecessários
        
        **Sinais de alerta:**
        - Pagamento apenas do mínimo
        - Limite sempre no máximo
        - Uso do cartão para gastos básicos por falta de dinheiro
      `
    }
  ],
  videos: [
    {
      id: 1,
      title: "Primeiros passos no mundo dos investimentos",
      channel: "Me Poupe!",
      duration: "12:34",
      thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&h=200&fit=crop",
      category: "Investimentos"
    },
    {
      id: 2,
      title: "Como sair das dívidas em 2024",
      channel: "Primo Rico",
      duration: "18:45",
      thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop",
      category: "Dívidas"
    },
    {
      id: 3,
      title: "Planejamento financeiro familiar",
      channel: "Canal do Holder",
      duration: "15:20",
      thumbnail: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&h=200&fit=crop",
      category: "Planejamento"
    }
  ],
  glossary: [
    {
      term: "CDI",
      definition: "Certificado de Depósito Interbancário. Taxa de juros que os bancos usam para emprestar dinheiro entre si, servindo como referência para muitos investimentos."
    },
    {
      term: "Dividend Yield",
      definition: "Indicador que mostra quanto uma empresa paga em dividendos em relação ao preço da ação, expresso em percentual."
    },
    {
      term: "IPCA",
      definition: "Índice Nacional de Preços ao Consumidor Amplo. Principal indicador de inflação do Brasil, usado como meta pelo Banco Central."
    },
    {
      term: "Liquidez",
      definition: "Facilidade de converter um investimento em dinheiro. Alta liquidez significa que você pode resgatar rapidamente."
    },
    {
      term: "P/L",
      definition: "Preço/Lucro. Múltiplo que indica quantos anos levaria para recuperar o investimento se a empresa mantivesse o lucro atual."
    },
    {
      term: "ROE",
      definition: "Return on Equity. Retorno sobre o Patrimônio Líquido. Indica a eficiência da empresa em gerar lucro com o capital dos acionistas."
    },
    {
      term: "Selic",
      definition: "Taxa básica de juros da economia brasileira, definida pelo Comitê de Política Monetária (Copom) do Banco Central."
    },
    {
      term: "Tesouro Direto",
      definition: "Programa do governo federal para venda de títulos públicos a pessoas físicas via internet, com baixo valor mínimo de investimento."
    }
  ]
};

const simulators = [
  {
    id: 'compound-interest',
    name: 'Juros Compostos',
    description: 'Calcule o crescimento do seu dinheiro ao longo do tempo',
    icon: TrendingUp
  },
  {
    id: 'emergency-fund',
    name: 'Reserva de Emergência',
    description: 'Descubra quanto você precisa guardar para emergências',
    icon: DollarSign
  },
  {
    id: 'goal-calculator',
    name: 'Calculadora de Metas',
    description: 'Calcule quanto investir mensalmente para alcançar seus objetivos',
    icon: Calculator
  }
];

export function Education() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [activeSimulator, setActiveSimulator] = useState<string | null>(null);
  
  // Simulator states
  const [compoundInterestInputs, setCompoundInterestInputs] = useState({
    initialAmount: '',
    monthlyContribution: '',
    interestRate: '',
    years: ''
  });

  const filteredArticles = educationalContent.articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateCompoundInterest = () => {
    const initial = parseFloat(compoundInterestInputs.initialAmount) || 0;
    const monthly = parseFloat(compoundInterestInputs.monthlyContribution) || 0;
    const rate = (parseFloat(compoundInterestInputs.interestRate) || 0) / 100 / 12;
    const months = (parseFloat(compoundInterestInputs.years) || 0) * 12;

    if (months === 0) return { finalAmount: 0, totalContributed: 0, totalInterest: 0 };

    let amount = initial;
    for (let i = 0; i < months; i++) {
      amount = amount * (1 + rate) + monthly;
    }

    const totalContributed = initial + (monthly * months);
    const totalInterest = amount - totalContributed;

    return {
      finalAmount: amount,
      totalContributed,
      totalInterest
    };
  };

  const generateChartData = () => {
    const initial = parseFloat(compoundInterestInputs.initialAmount) || 0;
    const monthly = parseFloat(compoundInterestInputs.monthlyContribution) || 0;
    const rate = (parseFloat(compoundInterestInputs.interestRate) || 0) / 100 / 12;
    const years = parseFloat(compoundInterestInputs.years) || 0;
    const months = years * 12;

    if (months === 0) return [];

    const data = [];
    let amount = initial;
    let totalContributed = initial;

    // Add initial point
    data.push({
      year: 0,
      totalAmount: Math.round(amount),
      totalContributed: Math.round(totalContributed),
      interestEarned: 0,
    });

    for (let i = 1; i <= months; i++) {
      amount = amount * (1 + rate) + monthly;
      totalContributed += monthly;
      
      // Add data point for each year
      if (i % 12 === 0 || i === months) {
        const yearMark = i / 12;
        data.push({
          year: yearMark,
          totalAmount: Math.round(amount),
          totalContributed: Math.round(totalContributed),
          interestEarned: Math.round(amount - totalContributed),
        });
      }
    }

    return data;
  };

  const generatePieChartData = () => {
    const result = calculateCompoundInterest();
    if (result.finalAmount === 0) return [];

    return [
      {
        name: 'Total Investido',
        value: result.totalContributed,
        color: '#3b82f6', // Blue
      },
      {
        name: 'Juros Compostos',
        value: result.totalInterest,
        color: '#10b981', // Green
      },
    ];
  };

  const compoundResult = calculateCompoundInterest();
  const chartData = generateChartData();
  const pieChartData = generatePieChartData();

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Educação Financeira</h1>
          <p className="mt-1 text-muted-foreground">Aprenda a gerenciar melhor suas finanças</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar conteúdo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="articles">Artigos</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="simulators">Simuladores</TabsTrigger>
          <TabsTrigger value="glossary">Glossário</TabsTrigger>
        </TabsList>

        {/* Articles Tab */}
        <TabsContent value="articles" className="space-y-6">
          {selectedArticle ? (
            <Card className="financial-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedArticle.title}</CardTitle>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="outline">{selectedArticle.category}</Badge>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{selectedArticle.readTime}</span>
                      </div>
                      <Badge 
                        variant={selectedArticle.difficulty === 'Iniciante' ? 'secondary' : 'outline'}
                      >
                        {selectedArticle.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedArticle(null)}>
                    Voltar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  {selectedArticle.content.split('\n').map((paragraph: string, index: number) => {
                    if (paragraph.trim() === '') return null;
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return (
                        <h3 key={index} className="font-semibold text-lg mt-6 mb-3">
                          {paragraph.slice(2, -2)}
                        </h3>
                      );
                    }
                    if (paragraph.startsWith('- ')) {
                      return (
                        <ul key={index} className="list-disc ml-6 mb-4">
                          <li>{paragraph.slice(2)}</li>
                        </ul>
                      );
                    }
                    return (
                      <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="financial-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedArticle(article)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <BookOpen className="h-8 w-8 text-primary mb-2" />
                      <Badge variant="outline">{article.category}</Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">{article.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{article.readTime}</span>
                        </div>
                        <Badge 
                          variant={article.difficulty === 'Iniciante' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {article.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {educationalContent.videos.map((video) => (
              <Card key={video.id} className="financial-card hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-t-lg">
                    <PlayCircle className="h-12 w-12 text-white" />
                  </div>
                  <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                    {video.duration}
                  </Badge>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-foreground mb-2">{video.title}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{video.channel}</p>
                    <Badge variant="outline">{video.category}</Badge>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Assistir no YouTube
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Simulators Tab */}
        <TabsContent value="simulators" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {simulators.map((simulator) => (
              <Card 
                key={simulator.id} 
                className={`financial-card cursor-pointer transition-all ${
                  activeSimulator === simulator.id ? 'ring-2 ring-primary' : 'hover:shadow-lg'
                }`}
                onClick={() => setActiveSimulator(activeSimulator === simulator.id ? null : simulator.id)}
              >
                <CardContent className="pt-6 text-center">
                  <simulator.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{simulator.name}</h3>
                  <p className="text-sm text-muted-foreground">{simulator.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Compound Interest Simulator */}
          {activeSimulator === 'compound-interest' && (
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Simulador de Juros Compostos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Input Section */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Valor Inicial (R$)
                      </label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={compoundInterestInputs.initialAmount}
                        onChange={(e) => setCompoundInterestInputs(prev => ({
                          ...prev,
                          initialAmount: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Aporte Mensal (R$)
                      </label>
                      <Input
                        type="number"
                        placeholder="500"
                        value={compoundInterestInputs.monthlyContribution}
                        onChange={(e) => setCompoundInterestInputs(prev => ({
                          ...prev,
                          monthlyContribution: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Taxa de Juros Anual (%)
                      </label>
                      <Input
                        type="number"
                        placeholder="10"
                        value={compoundInterestInputs.interestRate}
                        onChange={(e) => setCompoundInterestInputs(prev => ({
                          ...prev,
                          interestRate: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Período (anos)
                      </label>
                      <Input
                        type="number"
                        placeholder="10"
                        value={compoundInterestInputs.years}
                        onChange={(e) => setCompoundInterestInputs(prev => ({
                          ...prev,
                          years: e.target.value
                        }))}
                      />
                    </div>

                    {/* Results Summary */}
                    <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-4">
                        Resultado da Simulação
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-green-700 dark:text-green-200">Valor Final:</span>
                          <span className="font-bold text-green-900 dark:text-green-100">
                            {formatCurrency(compoundResult.finalAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700 dark:text-green-200">Total Investido:</span>
                          <span className="font-medium text-green-800 dark:text-green-200">
                            {formatCurrency(compoundResult.totalContributed)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700 dark:text-green-200">Juros Gerados:</span>
                          <span className="font-bold text-green-600">
                            {formatCurrency(compoundResult.totalInterest)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {compoundResult.finalAmount > 0 && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                          💡 Dica
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                          Os juros representam {((compoundResult.totalInterest / compoundResult.finalAmount) * 100).toFixed(1)}% 
                          do valor final. Quanto maior o prazo, maior o poder dos juros compostos!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Charts Section */}
                  <div className="lg:col-span-2 space-y-6">
                    {chartData.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Evolução do Investimento</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="year" 
                                  label={{ value: 'Anos', position: 'insideBottom', offset: -5 }}
                                />
                                <YAxis 
                                  tickFormatter={(value) => formatCurrency(value)}
                                  label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip 
                                  content={(props) => {
                                    if (props.active && props.payload && props.payload.length > 0) {
                                      const data = props.payload[0].payload;
                                      return (
                                        <div className="bg-background border border-border rounded-lg p-4 shadow-lg">
                                          <p className="font-medium mb-2">{`Ano ${data.year}`}</p>
                                          <div className="space-y-1">
                                            <p className="text-sm">
                                              <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                                              Total Investido: <span className="font-medium">{formatCurrency(data.totalContributed)}</span>
                                            </p>
                                            <p className="text-sm">
                                              <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                                              Juros Compostos: <span className="font-medium">{formatCurrency(data.interestEarned)}</span>
                                            </p>
                                            <div className="border-t pt-2 mt-2">
                                              <p className="text-sm font-bold">
                                                Valor Total: <span className="text-primary">{formatCurrency(data.totalAmount)}</span>
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="totalContributed" 
                                  stackId="1"
                                  stroke="#3b82f6" 
                                  fill="#3b82f6" 
                                  fillOpacity={0.6}
                                  name="Total Investido"
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="interestEarned" 
                                  stackId="1"
                                  stroke="#10b981" 
                                  fill="#10b981" 
                                  fillOpacity={0.8}
                                  name="Juros Compostos"
                                />
                                <Legend 
                                  content={(props) => {
                                    const finalValue = compoundResult.finalAmount;
                                    return (
                                      <div className="flex flex-col items-center space-y-2 mt-4">
                                        <div className="flex justify-center space-x-6">
                                          <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                            <span className="text-sm text-muted-foreground">Total Investido</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                            <span className="text-sm text-muted-foreground">Juros Compostos</span>
                                          </div>
                                        </div>
                                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-muted rounded-lg">
                                          <span className="text-sm font-medium text-foreground">Valor Final:</span>
                                          <span className="text-sm font-bold text-primary">
                                            {formatCurrency(finalValue)}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  }}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>

                        </CardContent>
                      </Card>
                    )}

                    {chartData.length === 0 && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center py-12">
                            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">
                              Preencha os dados
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Insira os valores nos campos ao lado para visualizar o gráfico de evolução do seu investimento
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Glossary Tab */}
        <TabsContent value="glossary" className="space-y-6">
          <Card className="financial-card">
            <CardHeader>
              <CardTitle>Glossário Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {educationalContent.glossary.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-start space-x-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground">{item.term}</h3>
                        <p className="text-muted-foreground text-sm mt-1">{item.definition}</p>
                      </div>
                    </div>
                    {index < educationalContent.glossary.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
