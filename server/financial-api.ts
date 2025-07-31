interface AssetSearchResult {
  symbol: string;
  name: string;
  type: string;
  currentPrice: number;
  currency: string;
  exchange: string;
  lastUpdate: string;
  matchScore?: number;
  region?: string;
  coinGeckoId?: string; // Para criptomoedas
}

interface AssetQuote {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  lastUpdate: string;
  currency: string;
}

// Banco de dados manual para ações brasileiras populares (B3)
const brazilianStocks = [
  { symbol: 'PETR4', name: 'Petróleo Brasileiro S.A. - Petrobras', type: 'stock', exchange: 'B3', currency: 'BRL' },
  { symbol: 'VALE3', name: 'Vale S.A.', type: 'stock', exchange: 'B3', currency: 'BRL' },
  { symbol: 'ITUB4', name: 'Itaú Unibanco Holding S.A.', type: 'stock', exchange: 'B3', currency: 'BRL' },
  { symbol: 'BBDC4', name: 'Banco Bradesco S.A.', type: 'stock', exchange: 'B3', currency: 'BRL' },
  { symbol: 'BBAS3', name: 'Banco do Brasil S.A.', type: 'stock', exchange: 'B3', currency: 'BRL' },
  { symbol: 'ABEV3', name: 'Ambev S.A.', type: 'stock', exchange: 'B3', currency: 'BRL' },
  { symbol: 'WEGE3', name: 'WEG S.A.', type: 'stock', exchange: 'B3', currency: 'BRL' },
  { symbol: 'MGLU3', name: 'Magazine Luiza S.A.', type: 'stock', exchange: 'B3', currency: 'BRL' },
  { symbol: 'RENT3', name: 'Localiza Rent a Car S.A.', type: 'stock', exchange: 'B3', currency: 'BRL' },
  { symbol: 'LREN3', name: 'Lojas Renner S.A.', type: 'stock', exchange: 'B3', currency: 'BRL' },
  { symbol: 'VIVT3', name: 'Telefônica Brasil S.A.', type: 'stock', exchange: 'B3', currency: 'BRL' },
  { symbol: 'SANB11', name: 'Banco Santander (Brasil) S.A.', type: 'stock', exchange: 'B3', currency: 'BRL' },
  { symbol: 'BPAC11', name: 'BTG Pactual S.A.', type: 'stock', exchange: 'B3', currency: 'BRL' },
  { symbol: 'KLBN11', name: 'Klabin S.A.', type: 'stock', exchange: 'B3', currency: 'BRL' },
  { symbol: 'SUZB3', name: 'Suzano S.A.', type: 'stock', exchange: 'B3', currency: 'BRL' },
  { symbol: 'JBSS3', name: 'JBS S.A.', type: 'stock', exchange: 'B3', currency: 'BRL' },
  { symbol: 'HAPV3', name: 'Hapvida Participações e Investimentos S.A.', type: 'stock', exchange: 'B3', currency: 'BRL' },
  { symbol: 'EMBR3', name: 'Embraer S.A.', type: 'stock', exchange: 'B3', currency: 'BRL' },
  { symbol: 'TOTS3', name: 'TOTVS S.A.', type: 'stock', exchange: 'B3', currency: 'BRL' },
  { symbol: 'CMIN3', name: 'CSN Mineração S.A.', type: 'stock', exchange: 'B3', currency: 'BRL' },
  // FIIs populares
  { symbol: 'HGLG11', name: 'CSHG Logística FII', type: 'fii', exchange: 'B3', currency: 'BRL' },
  { symbol: 'XPLG11', name: 'XP Log FII', type: 'fii', exchange: 'B3', currency: 'BRL' },
  { symbol: 'VISC11', name: 'Vinci Shopping Centers FII', type: 'fii', exchange: 'B3', currency: 'BRL' },
  { symbol: 'BTLG11', name: 'BTG Pactual Logística FII', type: 'fii', exchange: 'B3', currency: 'BRL' },
  { symbol: 'MXRF11', name: 'Maxi Renda FII', type: 'fii', exchange: 'B3', currency: 'BRL' },
  // ETFs brasileiros
  { symbol: 'BOVA11', name: 'iShares Ibovespa Fundo de Índice', type: 'etf', exchange: 'B3', currency: 'BRL' },
  { symbol: 'SMAL11', name: 'iShares BM&F Bovespa Small Cap', type: 'etf', exchange: 'B3', currency: 'BRL' },
  { symbol: 'IVVB11', name: 'iShares Core S&P 500', type: 'etf', exchange: 'B3', currency: 'BRL' }
];

// Função para buscar ações usando Alpha Vantage (melhorada para ações brasileiras e internacionais)
async function searchStocks(query: string, assetType: string = 'stock'): Promise<AssetSearchResult[]> {
  const results: AssetSearchResult[] = [];
  
  // 1. Primeiro, buscar no banco de dados manual de ações brasileiras
  const brazilianMatches = brazilianStocks.filter(stock => {
    const matchesSymbol = stock.symbol.toLowerCase().includes(query.toLowerCase());
    const matchesName = stock.name.toLowerCase().includes(query.toLowerCase());
    const matchesType = assetType === 'all' || assetType === stock.type;
    return (matchesSymbol || matchesName) && matchesType;
  });

  for (const match of brazilianMatches) {
    const matchesSymbol = match.symbol.toLowerCase().includes(query.toLowerCase());
    
    // Tentar buscar cotação atual para ações brasileiras
    let currentPrice = 0;
    try {
      // Para ações brasileiras, usar o símbolo com sufixo .SA para APIs internacionais
      const quote = await getStockQuote(match.symbol + '.SA');
      if (quote) {
        currentPrice = quote.currentPrice;
      }
    } catch (error) {
      console.warn(`Erro ao buscar cotação para ${match.symbol}:`, error);
      // Define um preço padrão para demonstração se a API falhar
      currentPrice = 25.50; // Preço exemplo para demonstração
    }

    results.push({
      symbol: match.symbol,
      name: match.name,
      type: match.type,
      currentPrice: currentPrice,
      currency: match.currency,
      exchange: match.exchange,
      lastUpdate: new Date().toISOString(),
      matchScore: matchesSymbol ? 1.0 : 0.8,
      region: 'Brazil'
    });
  }

  // 2. Se não encontrou suficientes resultados brasileiros, tentar Alpha Vantage
  if (results.length < 5) {
    try {
      const alphaVantageResults = await searchWithAlphaVantage(query, assetType);
      results.push(...alphaVantageResults);
    } catch (error) {
      console.warn('Alpha Vantage search failed, using Brazilian database only:', error);
    }
  }

  return results.slice(0, 10);
}

// Função auxiliar para buscar com Alpha Vantage
async function searchWithAlphaVantage(query: string, assetType: string): Promise<AssetSearchResult[]> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    console.warn('ALPHA_VANTAGE_API_KEY não configurada, usando apenas base brasileira');
    return [];
  }

  try {
    // Buscar por símbolo ou nome usando Alpha Vantage Symbol Search
    const searchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${apiKey}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    if (data['Error Message']) {
      console.error('Alpha Vantage Error:', data['Error Message']);
      return [];
    }

    if (data['Note']) {
      console.warn('Alpha Vantage Note:', data['Note']);
      return [];
    }

    const matches = data.bestMatches || [];
    const results: AssetSearchResult[] = [];

    for (const match of matches.slice(0, 15)) {
      const symbol = match['1. symbol'];
      const name = match['2. name'];
      const type = match['3. type'];
      const region = match['4. region'];
      const marketOpen = match['5. marketOpen'];
      const marketClose = match['6. marketClose'];
      const timezone = match['7. timezone'];
      const currency = match['8. currency'];
      const matchScore = parseFloat(match['9. matchScore']);

      // Identificar tipo de ativo e região
      let assetCategory = 'stock';
      let exchange = 'Unknown';
      let assetCurrency = currency || 'USD';

      // Classificar por região e exchange
      if (region === 'Brazil' || symbol.includes('.SA')) {
        exchange = 'B3';
        assetCurrency = 'BRL';
      } else if (symbol.includes('.LON')) {
        exchange = 'LSE';
        assetCurrency = 'GBP';
      } else if (symbol.includes('.TRT') || symbol.includes('.TO')) {
        exchange = 'TSX';
        assetCurrency = 'CAD';
      } else if (symbol.includes('.DEX') || symbol.includes('.FRK')) {
        exchange = 'XETRA';
        assetCurrency = 'EUR';
      } else if (symbol.includes('.BSE') || symbol.includes('.NSE')) {
        exchange = region === 'India' ? 'BSE' : 'NSE';
        assetCurrency = 'INR';
      } else if (symbol.includes('.SHH') || symbol.includes('.SHZ')) {
        exchange = symbol.includes('.SHH') ? 'SSE' : 'SZSE';
        assetCurrency = 'CNY';
      } else if (region === 'United States') {
        exchange = 'NASDAQ/NYSE';
        assetCurrency = 'USD';
      }

      // Identificar tipo de ativo
      if (type?.toLowerCase().includes('etf')) {
        assetCategory = 'etf';
      } else if (type?.toLowerCase().includes('fund') || type?.toLowerCase().includes('mutual')) {
        assetCategory = 'fund';
      } else if (symbol.includes('11') && region === 'Brazil') {
        assetCategory = 'fii'; // FIIs brasileiros geralmente terminam em 11
      }

      // Filtrar por tipo se especificado
      if (assetType !== 'all' && assetType !== assetCategory) {
        continue;
      }

      // Buscar cotação atual (limitado para evitar rate limiting)
      let currentPrice = 0;
      try {
        // Apenas buscar cotação para os primeiros 5 resultados para evitar rate limiting
        if (results.length < 5) {
          const quote = await getStockQuote(symbol);
          if (quote) {
            currentPrice = quote.currentPrice;
          }
          // Pequeno delay para respeitar rate limits
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        console.warn(`Erro ao buscar cotação para ${symbol}:`, error);
      }

      results.push({
        symbol: symbol.replace('.SA', '').replace('.SAO', ''), // Remover sufixo para ações brasileiras
        name: name,
        type: assetCategory,
        currentPrice: currentPrice,
        currency: assetCurrency,
        exchange: exchange,
        lastUpdate: new Date().toISOString(),
        matchScore: matchScore,
        region: region
      });
    }

    // Ordenar por match score (relevância)
    return results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)).slice(0, 10);
  } catch (error) {
    console.error('Erro ao buscar ações:', error);
    return [];
  }
}

// Função para buscar cotação de ações usando Alpha Vantage Global Quote
async function getStockQuote(symbol: string): Promise<AssetQuote | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    throw new Error('ALPHA_VANTAGE_API_KEY não configurada');
  }

  try {
    // Determinar formato do símbolo baseado no tipo
    let fullSymbol = symbol;
    let currency = 'USD';

    // Adicionar sufixos apropriados para diferentes exchanges
    if (symbol.match(/^[A-Z]{4}[0-9]?$/)) {
      // Ações brasileiras (ex: BBAS3, VALE3)
      fullSymbol = symbol.includes('.') ? symbol : `${symbol}.SA`;
      currency = 'BRL';
    } else if (symbol.includes('.')) {
      // Já tem sufixo de exchange
      if (symbol.includes('.SA')) currency = 'BRL';
      else if (symbol.includes('.LON')) currency = 'GBP';
      else if (symbol.includes('.TRT') || symbol.includes('.TO')) currency = 'CAD';
      else if (symbol.includes('.DEX') || symbol.includes('.FRK')) currency = 'EUR';
      else if (symbol.includes('.BSE') || symbol.includes('.NSE')) currency = 'INR';
      else if (symbol.includes('.SHH') || symbol.includes('.SHZ')) currency = 'CNY';
    }
    
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${fullSymbol}&apikey=${apiKey}`;
    const response = await fetch(quoteUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    if (data['Error Message']) {
      console.error('Alpha Vantage Error:', data['Error Message']);
      return null;
    }

    if (data['Note']) {
      console.warn('Alpha Vantage Note:', data['Note']);
      return null;
    }

    const quote = data['Global Quote'];
    if (!quote || !quote['05. price']) {
      return null;
    }

    const price = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePercentStr = quote['10. change percent'];
    const changePercent = parseFloat(changePercentStr?.replace('%', '') || '0');

    return {
      symbol: symbol,
      currentPrice: price,
      change: change,
      changePercent: changePercent,
      lastUpdate: quote['07. latest trading day'],
      currency: currency
    };
  } catch (error) {
    console.error(`Erro ao buscar cotação para ${symbol}:`, error);
    return null;
  }
}

// Função para buscar criptomoedas usando CoinGecko API (com tratamento de throttling)
async function searchCrypto(query: string): Promise<AssetSearchResult[]> {
  try {
    const searchUrl = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OrçaFácil/1.0'
      }
    });

    // Check if response is ok
    if (!response.ok) {
      console.warn(`CoinGecko API returned ${response.status}: ${response.statusText}`);
      return [];
    }

    const text = await response.text();
    
    // Check if response starts with "Throttled" (rate limiting)
    if (text.startsWith('Throttled')) {
      console.warn('CoinGecko API throttled - rate limit exceeded');
      return [];
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing CoinGecko response:', text.substring(0, 100));
      return [];
    }

    const coins = data.coins || [];
    return coins.slice(0, 8).map((coin: any) => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      type: 'crypto',
      currentPrice: 0, // Será buscado separadamente para evitar mais calls
      currency: 'USD',
      exchange: 'CoinGecko',
      lastUpdate: new Date().toISOString(),
      coinGeckoId: coin.id // Salvar ID para buscar cotação depois
    }));
  } catch (error) {
    console.error('Erro ao buscar criptomoedas:', error);
    return [];
  }
}

// Função para buscar cotação de criptomoeda usando CoinGecko ID
async function getCryptoQuote(coinId: string): Promise<AssetQuote | null> {
  try {
    const quoteUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId.toLowerCase()}&vs_currencies=usd,brl&include_24hr_change=true`;
    const response = await fetch(quoteUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OrçaFácil/1.0'
      }
    });

    if (!response.ok) {
      console.warn(`CoinGecko quote API returned ${response.status}: ${response.statusText}`);
      return null;
    }

    const text = await response.text();
    
    // Check if response starts with "Throttled"
    if (text.startsWith('Throttled')) {
      console.warn('CoinGecko quote API throttled');
      return null;
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing CoinGecko quote response:', text.substring(0, 100));
      return null;
    }

    const coinData = data[coinId.toLowerCase()];
    if (!coinData) {
      return null;
    }

    return {
      symbol: coinId.toUpperCase(),
      currentPrice: coinData.brl || coinData.usd,
      change: 0,
      changePercent: coinData.usd_24h_change || 0,
      lastUpdate: new Date().toISOString(),
      currency: coinData.brl ? 'BRL' : 'USD'
    };
  } catch (error) {
    console.error('Erro ao buscar cotação de crypto:', error);
    return null;
  }
}

// Função principal para buscar ativos
export async function searchAssets(query: string, type?: string): Promise<AssetSearchResult[]> {
  const results: AssetSearchResult[] = [];

  try {
    // Buscar ações, ETFs, FIIs e fundos usando Alpha Vantage
    if (!type || ['stock', 'etf', 'fii', 'fund', 'fixed_income'].includes(type)) {
      const assetType = type || 'all';
      const stocks = await searchStocks(query, assetType);
      results.push(...stocks);
    }

    // Buscar criptomoedas usando CoinGecko (sem buscar cotação individual para evitar rate limiting)
    if (!type || type === 'crypto') {
      const cryptos = await searchCrypto(query);
      results.push(...cryptos);
    }

    return results.slice(0, 15); // Limitar resultados totais
  } catch (error) {
    console.error('Erro na busca de ativos:', error);
    return [];
  }
}

// Função para buscar cotação atual
export async function getAssetQuote(symbol: string, type: string): Promise<AssetQuote | null> {
  try {
    if (type === 'crypto') {
      return await getCryptoQuote(symbol);
    } else {
      return await getStockQuote(symbol);
    }
  } catch (error) {
    console.error('Erro ao buscar cotação:', error);
    return null;
  }
}

// Função para atualizar cotações de múltiplos ativos
export async function updateMultipleQuotes(assets: Array<{symbol: string, type: string}>): Promise<Record<string, AssetQuote | null>> {
  const quotes: Record<string, AssetQuote | null> = {};
  
  // Processar em lotes para evitar rate limiting da Alpha Vantage (5 requests/min no plano free)
  const batchSize = 3;
  for (let i = 0; i < assets.length; i += batchSize) {
    const batch = assets.slice(i, i + batchSize);
    const batchPromises = batch.map(async (asset: {symbol: string, type: string}) => {
      const quote = await getAssetQuote(asset.symbol, asset.type);
      return { symbol: asset.symbol, quote };
    });
    
    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(result => {
      quotes[result.symbol] = result.quote;
    });
    
    // Delay entre lotes para respeitar rate limits (Alpha Vantage: 5 calls/minute)
    if (i + batchSize < assets.length) {
      await new Promise(resolve => setTimeout(resolve, 15000)); // 15 segundos entre lotes
    }
  }
  
  return quotes;
}