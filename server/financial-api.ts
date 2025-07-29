interface AssetSearchResult {
  symbol: string;
  name: string;
  type: string;
  currentPrice: number;
  currency: string;
  exchange: string;
  lastUpdate: string;
}

interface AssetQuote {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  lastUpdate: string;
  currency: string;
}

// Função para buscar ações brasileiras usando Alpha Vantage
async function searchBrazilianStocks(query: string): Promise<AssetSearchResult[]> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    throw new Error('ALPHA_VANTAGE_API_KEY não configurada');
  }

  try {
    // Buscar por símbolo ou nome de ações brasileiras
    const searchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${apiKey}`;
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    const matches = data.bestMatches || [];
    const brazilianStocks = matches
      .filter((match: any) => 
        match['4. region'] === 'Brazil' || 
        match['1. symbol'].includes('.SA') ||
        match['1. symbol'].includes('.SAO')
      )
      .map((match: any) => ({
        symbol: match['1. symbol'].replace('.SA', '').replace('.SAO', ''),
        name: match['2. name'],
        type: 'stock',
        currentPrice: 0, // Será buscado separadamente
        currency: 'BRL',
        exchange: 'B3',
        lastUpdate: new Date().toISOString()
      }));

    return brazilianStocks.slice(0, 10); // Limitar a 10 resultados
  } catch (error) {
    console.error('Erro ao buscar ações brasileiras:', error);
    return [];
  }
}

// Função para buscar cotação atual de uma ação brasileira
async function getBrazilianStockQuote(symbol: string): Promise<AssetQuote | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    throw new Error('ALPHA_VANTAGE_API_KEY não configurada');
  }

  try {
    // Adicionar .SA para ações brasileiras se não tiver
    const fullSymbol = symbol.includes('.') ? symbol : `${symbol}.SA`;
    
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${fullSymbol}&apikey=${apiKey}`;
    const response = await fetch(quoteUrl);
    const data = await response.json();

    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    const quote = data['Global Quote'];
    if (!quote || !quote['05. price']) {
      return null;
    }

    return {
      symbol: symbol,
      currentPrice: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      lastUpdate: quote['07. latest trading day'],
      currency: 'BRL'
    };
  } catch (error) {
    console.error('Erro ao buscar cotação:', error);
    return null;
  }
}

// Função para buscar criptomoedas usando CoinGecko (gratuita)
async function searchCrypto(query: string): Promise<AssetSearchResult[]> {
  try {
    const searchUrl = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl);
    const data = await response.json();

    const coins = data.coins || [];
    return coins.slice(0, 10).map((coin: any) => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      type: 'crypto',
      currentPrice: 0, // Será buscado separadamente
      currency: 'USD',
      exchange: 'CoinGecko',
      lastUpdate: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Erro ao buscar criptomoedas:', error);
    return [];
  }
}

// Função para buscar cotação de criptomoeda
async function getCryptoQuote(symbol: string): Promise<AssetQuote | null> {
  try {
    const quoteUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd,brl&include_24hr_change=true`;
    const response = await fetch(quoteUrl);
    const data = await response.json();

    const coinData = data[symbol.toLowerCase()];
    if (!coinData) {
      return null;
    }

    return {
      symbol: symbol.toUpperCase(),
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
    if (!type || type === 'stock') {
      const stocks = await searchBrazilianStocks(query);
      results.push(...stocks);
    }

    if (!type || type === 'crypto') {
      const cryptos = await searchCrypto(query);
      results.push(...cryptos);
    }

    // Para outros tipos (ETF, FII, etc.), usar busca de ações
    if (type === 'etf' || type === 'fii') {
      const etfs = await searchBrazilianStocks(query);
      results.push(...etfs.map(asset => ({ ...asset, type })));
    }

    return results;
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
      return await getBrazilianStockQuote(symbol);
    }
  } catch (error) {
    console.error('Erro ao buscar cotação:', error);
    return null;
  }
}

// Função para atualizar cotações de múltiplos ativos
export async function updateMultipleQuotes(assets: Array<{symbol: string, type: string}>): Promise<Record<string, AssetQuote | null>> {
  const quotes: Record<string, AssetQuote | null> = {};
  
  // Processar em lotes para evitar rate limiting
  const batchSize = 5;
  for (let i = 0; i < assets.length; i += batchSize) {
    const batch = assets.slice(i, i + batchSize);
    const batchPromises = batch.map(async asset => {
      const quote = await getAssetQuote(asset.symbol, asset.type);
      return { symbol: asset.symbol, quote };
    });
    
    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(result => {
      quotes[result.symbol] = result.quote;
    });
    
    // Delay entre lotes para respeitar rate limits
    if (i + batchSize < assets.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return quotes;
}