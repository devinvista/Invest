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
  },
  {
    id: 'retirement-calculator',
    name: 'Aposentadoria',
    description: 'Planeje sua aposentadoria e descubra quanto precisa acumular',
    icon: Clock
  },
  {
    id: 'loan-calculator',
    name: 'Financiamento',
    description: 'Calcule parcelas e juros de empréstimos e financiamentos',
    icon: BookOpen
  },
  {
    id: 'investment-comparison',
    name: 'Comparar Investimentos',
    description: 'Compare diferentes opções de investimento lado a lado',
    icon: PlayCircle
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

  const [emergencyFundInputs, setEmergencyFundInputs] = useState({
    monthlyExpenses: '',
    employment: 'stable', // stable, unstable, freelancer
    dependents: '',
    currentSavings: ''
  });

  const [goalCalculatorInputs, setGoalCalculatorInputs] = useState({
    goalAmount: '',
    currentAmount: '',
    interestRate: '',
    timeframe: '',
    goalName: ''
  });

  const [retirementInputs, setRetirementInputs] = useState({
    currentAge: '',
    retirementAge: '',
    currentSavings: '',
    monthlyContribution: '',
    interestRate: '',
    monthlyNeeds: ''
  });

  const [loanInputs, setLoanInputs] = useState({
    loanAmount: '',
    interestRate: '',
    years: '',
    paymentType: 'price' // price or sac
  });

  const [comparisonInputs, setComparisonInputs] = useState({
    initialAmount: '',
    monthlyContribution: '',
    timeframe: '',
    option1Rate: '',
    option1Name: '',
    option2Rate: '',
    option2Name: ''
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

  // Emergency Fund Calculations
  const calculateEmergencyFund = () => {
    const monthlyExpenses = parseFloat(emergencyFundInputs.monthlyExpenses) || 0;
    const dependents = parseInt(emergencyFundInputs.dependents) || 0;
    const currentSavings = parseFloat(emergencyFundInputs.currentSavings) || 0;
    
    let baseMonths = 3;
    if (emergencyFundInputs.employment === 'unstable') baseMonths = 6;
    if (emergencyFundInputs.employment === 'freelancer') baseMonths = 8;
    
    // Add extra month for each dependent
    const totalMonths = baseMonths + dependents;
    const targetAmount = monthlyExpenses * totalMonths;
    const shortfall = Math.max(0, targetAmount - currentSavings);
    
    return {
      targetAmount,
      currentSavings,
      shortfall,
      monthsNeeded: totalMonths,
      percentageComplete: targetAmount > 0 ? (currentSavings / targetAmount) * 100 : 0
    };
  };

  // Goal Calculator
  const calculateGoalPlan = () => {
    const goalAmount = parseFloat(goalCalculatorInputs.goalAmount) || 0;
    const currentAmount = parseFloat(goalCalculatorInputs.currentAmount) || 0;
    const rate = (parseFloat(goalCalculatorInputs.interestRate) || 0) / 100 / 12;
    const months = (parseFloat(goalCalculatorInputs.timeframe) || 0) * 12;
    
    if (goalAmount <= currentAmount) {
      return { monthlyRequired: 0, totalToInvest: 0, interestEarned: 0 };
    }
    
    const remainingAmount = goalAmount - currentAmount;
    
    if (rate === 0) {
      return {
        monthlyRequired: remainingAmount / months,
        totalToInvest: remainingAmount,
        interestEarned: 0
      };
    }
    
    // Calculate required monthly payment with compound interest
    const futureValueCurrent = currentAmount * Math.pow(1 + rate, months);
    const remainingNeeded = goalAmount - futureValueCurrent;
    
    const monthlyRequired = remainingNeeded / (((Math.pow(1 + rate, months) - 1) / rate));
    const totalToInvest = monthlyRequired * months;
    
    return {
      monthlyRequired: Math.max(0, monthlyRequired),
      totalToInvest,
      interestEarned: goalAmount - currentAmount - totalToInvest
    };
  };

  // Retirement Calculator
  const calculateRetirement = () => {
    const currentAge = parseInt(retirementInputs.currentAge) || 0;
    const retirementAge = parseInt(retirementInputs.retirementAge) || 0;
    const currentSavings = parseFloat(retirementInputs.currentSavings) || 0;
    const monthlyContrib = parseFloat(retirementInputs.monthlyContribution) || 0;
    const rate = (parseFloat(retirementInputs.interestRate) || 0) / 100 / 12;
    const monthlyNeeds = parseFloat(retirementInputs.monthlyNeeds) || 0;
    
    const yearsToRetirement = retirementAge - currentAge;
    const monthsToRetirement = yearsToRetirement * 12;
    
    if (monthsToRetirement <= 0) return { totalAccumulated: 0, monthlyIncome: 0, adequate: false };
    
    // Future value of current savings
    const futureCurrentSavings = currentSavings * Math.pow(1 + rate, monthsToRetirement);
    
    // Future value of monthly contributions
    let futureContributions = 0;
    if (rate > 0) {
      futureContributions = monthlyContrib * (((Math.pow(1 + rate, monthsToRetirement) - 1) / rate));
    } else {
      futureContributions = monthlyContrib * monthsToRetirement;
    }
    
    const totalAccumulated = futureCurrentSavings + futureContributions;
    
    // Assuming 4% withdrawal rate in retirement
    const monthlyIncome = (totalAccumulated * 0.04) / 12;
    const adequate = monthlyIncome >= monthlyNeeds;
    
    return {
      totalAccumulated,
      monthlyIncome,
      adequate,
      yearsToRetirement
    };
  };

  // Loan Calculator
  const calculateLoan = () => {
    const principal = parseFloat(loanInputs.loanAmount) || 0;
    const rate = (parseFloat(loanInputs.interestRate) || 0) / 100 / 12;
    const months = (parseFloat(loanInputs.years) || 0) * 12;
    
    if (principal === 0 || months === 0) return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0 };
    
    if (rate === 0) {
      const monthlyPayment = principal / months;
      return {
        monthlyPayment,
        totalPayment: principal,
        totalInterest: 0
      };
    }
    
    // PRICE table calculation
    const monthlyPayment = principal * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;
    
    return {
      monthlyPayment,
      totalPayment,
      totalInterest
    };
  };

  // Investment Comparison
  const calculateComparison = () => {
    const initial = parseFloat(comparisonInputs.initialAmount) || 0;
    const monthly = parseFloat(comparisonInputs.monthlyContribution) || 0;
    const months = (parseFloat(comparisonInputs.timeframe) || 0) * 12;
    const rate1 = (parseFloat(comparisonInputs.option1Rate) || 0) / 100 / 12;
    const rate2 = (parseFloat(comparisonInputs.option2Rate) || 0) / 100 / 12;
    
    const calculateFinalValue = (rate: number) => {
      if (months === 0) return 0;
      
      let amount = initial;
      for (let i = 0; i < months; i++) {
        amount = amount * (1 + rate) + monthly;
      }
      return amount;
    };
    
    const option1Final = calculateFinalValue(rate1);
    const option2Final = calculateFinalValue(rate2);
    const difference = Math.abs(option1Final - option2Final);
    
    return {
      option1Final,
      option2Final,
      difference,
      betterOption: option1Final > option2Final ? 1 : 2
    };
  };

  const emergencyResult = calculateEmergencyFund();
  const goalResult = calculateGoalPlan();
  const retirementResult = calculateRetirement();
  const loanResult = calculateLoan();
  const comparisonResult = calculateComparison();

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

      <Tabs defaultValue="simulators" className="space-y-6">
        <TabsList>
          <TabsTrigger value="simulators">Simuladores</TabsTrigger>
          <TabsTrigger value="articles">Artigos</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
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
                                  tickFormatter={(value) => {
                                    if (value >= 1000000) {
                                      return `R$ ${(value / 1000000).toFixed(1)}M`;
                                    } else if (value >= 1000) {
                                      return `R$ ${(value / 1000).toFixed(0)}k`;
                                    }
                                    return formatCurrency(value);
                                  }}
                                  tick={{ fontSize: 12 }}
                                  label={{ 
                                    value: 'Valor (R$)', 
                                    angle: -90, 
                                    position: 'insideLeft',
                                    style: { textAnchor: 'middle', fontSize: '14px', fontWeight: '500' }
                                  }}
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

          {/* Emergency Fund Simulator */}
          {activeSimulator === 'emergency-fund' && (
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Calculadora de Reserva de Emergência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Gastos Mensais (R$)
                      </label>
                      <Input
                        type="number"
                        placeholder="3000"
                        value={emergencyFundInputs.monthlyExpenses}
                        onChange={(e) => setEmergencyFundInputs(prev => ({
                          ...prev,
                          monthlyExpenses: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Situação Profissional
                      </label>
                      <select 
                        className="w-full p-2 border border-border rounded-md bg-background"
                        value={emergencyFundInputs.employment}
                        onChange={(e) => setEmergencyFundInputs(prev => ({
                          ...prev,
                          employment: e.target.value
                        }))}
                      >
                        <option value="stable">Emprego Estável</option>
                        <option value="unstable">Emprego Instável</option>
                        <option value="freelancer">Freelancer/Autônomo</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Número de Dependentes
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={emergencyFundInputs.dependents}
                        onChange={(e) => setEmergencyFundInputs(prev => ({
                          ...prev,
                          dependents: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Valor Atual Guardado (R$)
                      </label>
                      <Input
                        type="number"
                        placeholder="5000"
                        value={emergencyFundInputs.currentSavings}
                        onChange={(e) => setEmergencyFundInputs(prev => ({
                          ...prev,
                          currentSavings: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">
                        Resultado da Análise
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-blue-700 dark:text-blue-200">Meta Recomendada:</span>
                          <span className="font-bold text-blue-900 dark:text-blue-100">
                            {formatCurrency(emergencyResult.targetAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700 dark:text-blue-200">Meses de Proteção:</span>
                          <span className="font-medium text-blue-800 dark:text-blue-200">
                            {emergencyResult.monthsNeeded} meses
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700 dark:text-blue-200">Ainda Falta:</span>
                          <span className="font-bold text-red-600">
                            {formatCurrency(emergencyResult.shortfall)}
                          </span>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso</span>
                            <span>{emergencyResult.percentageComplete.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(emergencyResult.percentageComplete, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {emergencyResult.targetAmount > 0 && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                          💡 Dica
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-200">
                          {emergencyResult.percentageComplete >= 100 
                            ? "Parabéns! Sua reserva de emergência está completa."
                            : `Considere guardar ${formatCurrency(emergencyResult.shortfall / 12)} por mês para completar em 1 ano.`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Goal Calculator Simulator */}
          {activeSimulator === 'goal-calculator' && (
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Calculadora de Metas Financeiras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Nome da Meta
                      </label>
                      <Input
                        type="text"
                        placeholder="Carro novo"
                        value={goalCalculatorInputs.goalName}
                        onChange={(e) => setGoalCalculatorInputs(prev => ({
                          ...prev,
                          goalName: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Valor da Meta (R$)
                      </label>
                      <Input
                        type="number"
                        placeholder="50000"
                        value={goalCalculatorInputs.goalAmount}
                        onChange={(e) => setGoalCalculatorInputs(prev => ({
                          ...prev,
                          goalAmount: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Valor Atual (R$)
                      </label>
                      <Input
                        type="number"
                        placeholder="10000"
                        value={goalCalculatorInputs.currentAmount}
                        onChange={(e) => setGoalCalculatorInputs(prev => ({
                          ...prev,
                          currentAmount: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Taxa de Juros Anual (%)
                      </label>
                      <Input
                        type="number"
                        placeholder="8"
                        value={goalCalculatorInputs.interestRate}
                        onChange={(e) => setGoalCalculatorInputs(prev => ({
                          ...prev,
                          interestRate: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Prazo (anos)
                      </label>
                      <Input
                        type="number"
                        placeholder="3"
                        value={goalCalculatorInputs.timeframe}
                        onChange={(e) => setGoalCalculatorInputs(prev => ({
                          ...prev,
                          timeframe: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-4">
                        Plano para {goalCalculatorInputs.goalName || 'sua Meta'}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-purple-700 dark:text-purple-200">Aporte Mensal:</span>
                          <span className="font-bold text-purple-900 dark:text-purple-100">
                            {formatCurrency(goalResult.monthlyRequired)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700 dark:text-purple-200">Total a Investir:</span>
                          <span className="font-medium text-purple-800 dark:text-purple-200">
                            {formatCurrency(goalResult.totalToInvest)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700 dark:text-purple-200">Juros Esperados:</span>
                          <span className="font-bold text-green-600">
                            {formatCurrency(goalResult.interestEarned)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {goalResult.monthlyRequired > 0 && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                          💡 Estratégia
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                          Invista {formatCurrency(goalResult.monthlyRequired)} mensalmente para alcançar sua meta. 
                          Os juros compostos farão {((goalResult.interestEarned / (parseFloat(goalCalculatorInputs.goalAmount) || 1)) * 100).toFixed(1)}% do trabalho!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Retirement Calculator */}
          {activeSimulator === 'retirement-calculator' && (
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Calculadora de Aposentadoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Idade Atual
                      </label>
                      <Input
                        type="number"
                        placeholder="30"
                        value={retirementInputs.currentAge}
                        onChange={(e) => setRetirementInputs(prev => ({
                          ...prev,
                          currentAge: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Idade para Aposentadoria
                      </label>
                      <Input
                        type="number"
                        placeholder="60"
                        value={retirementInputs.retirementAge}
                        onChange={(e) => setRetirementInputs(prev => ({
                          ...prev,
                          retirementAge: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Valor Atual Investido (R$)
                      </label>
                      <Input
                        type="number"
                        placeholder="20000"
                        value={retirementInputs.currentSavings}
                        onChange={(e) => setRetirementInputs(prev => ({
                          ...prev,
                          currentSavings: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Aporte Mensal (R$)
                      </label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={retirementInputs.monthlyContribution}
                        onChange={(e) => setRetirementInputs(prev => ({
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
                        value={retirementInputs.interestRate}
                        onChange={(e) => setRetirementInputs(prev => ({
                          ...prev,
                          interestRate: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Renda Mensal Desejada (R$)
                      </label>
                      <Input
                        type="number"
                        placeholder="5000"
                        value={retirementInputs.monthlyNeeds}
                        onChange={(e) => setRetirementInputs(prev => ({
                          ...prev,
                          monthlyNeeds: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className={`p-6 rounded-lg ${retirementResult.adequate ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                      <h3 className={`font-semibold mb-4 ${retirementResult.adequate ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                        Projeção da Aposentadoria
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className={retirementResult.adequate ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200'}>Total Acumulado:</span>
                          <span className={`font-bold ${retirementResult.adequate ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                            {formatCurrency(retirementResult.totalAccumulated)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={retirementResult.adequate ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200'}>Renda Mensal:</span>
                          <span className={`font-medium ${retirementResult.adequate ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                            {formatCurrency(retirementResult.monthlyIncome)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={retirementResult.adequate ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200'}>Anos até aposentadoria:</span>
                          <span className={`font-bold ${retirementResult.adequate ? 'text-green-600' : 'text-red-600'}`}>
                            {retirementResult.yearsToRetirement} anos
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg ${retirementResult.adequate ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
                      <h4 className={`font-medium mb-2 ${retirementResult.adequate ? 'text-blue-900 dark:text-blue-100' : 'text-yellow-900 dark:text-yellow-100'}`}>
                        {retirementResult.adequate ? '🎉 Parabéns!' : '⚠️ Atenção'}
                      </h4>
                      <p className={`text-sm ${retirementResult.adequate ? 'text-blue-700 dark:text-blue-200' : 'text-yellow-700 dark:text-yellow-200'}`}>
                        {retirementResult.adequate 
                          ? "Seu plano de aposentadoria está no caminho certo! Continue contribuindo regularmente."
                          : "Sua renda projetada pode não ser suficiente. Considere aumentar os aportes ou estender o prazo."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loan Calculator */}
          {activeSimulator === 'loan-calculator' && (
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Calculadora de Financiamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Valor do Empréstimo (R$)
                      </label>
                      <Input
                        type="number"
                        placeholder="100000"
                        value={loanInputs.loanAmount}
                        onChange={(e) => setLoanInputs(prev => ({
                          ...prev,
                          loanAmount: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Taxa de Juros Anual (%)
                      </label>
                      <Input
                        type="number"
                        placeholder="8.5"
                        value={loanInputs.interestRate}
                        onChange={(e) => setLoanInputs(prev => ({
                          ...prev,
                          interestRate: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Prazo (anos)
                      </label>
                      <Input
                        type="number"
                        placeholder="10"
                        value={loanInputs.years}
                        onChange={(e) => setLoanInputs(prev => ({
                          ...prev,
                          years: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-4">
                        Resultado do Financiamento
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-orange-700 dark:text-orange-200">Parcela Mensal:</span>
                          <span className="font-bold text-orange-900 dark:text-orange-100">
                            {formatCurrency(loanResult.monthlyPayment)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-orange-700 dark:text-orange-200">Total a Pagar:</span>
                          <span className="font-medium text-orange-800 dark:text-orange-200">
                            {formatCurrency(loanResult.totalPayment)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-orange-700 dark:text-orange-200">Total de Juros:</span>
                          <span className="font-bold text-red-600">
                            {formatCurrency(loanResult.totalInterest)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {loanResult.monthlyPayment > 0 && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                          💡 Dica
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-200">
                          Os juros representam {((loanResult.totalInterest / loanResult.totalPayment) * 100).toFixed(1)}% do total pago. 
                          Considere fazer amortizações quando possível!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Investment Comparison */}
          {activeSimulator === 'investment-comparison' && (
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Comparador de Investimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground">Dados Gerais</h3>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Valor Inicial (R$)
                      </label>
                      <Input
                        type="number"
                        placeholder="10000"
                        value={comparisonInputs.initialAmount}
                        onChange={(e) => setComparisonInputs(prev => ({
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
                        value={comparisonInputs.monthlyContribution}
                        onChange={(e) => setComparisonInputs(prev => ({
                          ...prev,
                          monthlyContribution: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Período (anos)
                      </label>
                      <Input
                        type="number"
                        placeholder="5"
                        value={comparisonInputs.timeframe}
                        onChange={(e) => setComparisonInputs(prev => ({
                          ...prev,
                          timeframe: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground">Opção 1</h3>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Nome do Investimento
                      </label>
                      <Input
                        type="text"
                        placeholder="Tesouro Selic"
                        value={comparisonInputs.option1Name}
                        onChange={(e) => setComparisonInputs(prev => ({
                          ...prev,
                          option1Name: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Taxa Anual (%)
                      </label>
                      <Input
                        type="number"
                        placeholder="10.5"
                        value={comparisonInputs.option1Rate}
                        onChange={(e) => setComparisonInputs(prev => ({
                          ...prev,
                          option1Rate: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        {comparisonInputs.option1Name || 'Opção 1'}
                      </h4>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(comparisonResult.option1Final)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground">Opção 2</h3>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Nome do Investimento
                      </label>
                      <Input
                        type="text"
                        placeholder="CDB"
                        value={comparisonInputs.option2Name}
                        onChange={(e) => setComparisonInputs(prev => ({
                          ...prev,
                          option2Name: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Taxa Anual (%)
                      </label>
                      <Input
                        type="number"
                        placeholder="12"
                        value={comparisonInputs.option2Rate}
                        onChange={(e) => setComparisonInputs(prev => ({
                          ...prev,
                          option2Rate: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                        {comparisonInputs.option2Name || 'Opção 2'}
                      </h4>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(comparisonResult.option2Final)}
                      </p>
                    </div>
                  </div>
                </div>

                {comparisonResult.difference > 0 && (
                  <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                      📊 Resultado da Comparação
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-200">
                      <strong>{comparisonResult.betterOption === 1 ? comparisonInputs.option1Name || 'Opção 1' : comparisonInputs.option2Name || 'Opção 2'}</strong> é melhor por <strong>{formatCurrency(comparisonResult.difference)}</strong>. 
                      Essa diferença representa {((comparisonResult.difference / Math.min(comparisonResult.option1Final, comparisonResult.option2Final)) * 100).toFixed(1)}% a mais de rendimento!
                    </p>
                  </div>
                )}
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
