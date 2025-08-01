// Script simples para testar a API Alpha Vantage
const fetch = require('node-fetch');

async function testAlphaVantageAPI() {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  
  if (!apiKey) {
    console.log('❌ ALPHA_VANTAGE_API_KEY não encontrada');
    return;
  }
  
  console.log('✅ API Key encontrada:', apiKey.substring(0, 8) + '...');
  
  // Testar GLOBAL_QUOTE para PETR4
  try {
    console.log('\n📊 Testando GLOBAL_QUOTE para PETR4.SA...');
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=PETR4.SA&apikey=${apiKey}`;
    const quoteResponse = await fetch(quoteUrl);
    const quoteData = await quoteResponse.json();
    console.log('Resposta GLOBAL_QUOTE:', JSON.stringify(quoteData, null, 2));
  } catch (error) {
    console.error('Erro no GLOBAL_QUOTE:', error.message);
  }
  
  // Testar TIME_SERIES_DAILY para PETR4
  try {
    console.log('\n📈 Testando TIME_SERIES_DAILY para PETR4.SA...');
    const histUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=PETR4.SA&outputsize=compact&apikey=${apiKey}`;
    const histResponse = await fetch(histUrl);
    const histData = await histResponse.json();
    console.log('Resposta TIME_SERIES_DAILY:', JSON.stringify(histData, null, 2).substring(0, 500) + '...');
  } catch (error) {
    console.error('Erro no TIME_SERIES_DAILY:', error.message);
  }
  
  // Testar SYMBOL_SEARCH
  try {
    console.log('\n🔍 Testando SYMBOL_SEARCH para "PETR"...');
    const searchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=PETR&apikey=${apiKey}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    console.log('Resposta SYMBOL_SEARCH:', JSON.stringify(searchData, null, 2));
  } catch (error) {
    console.error('Erro no SYMBOL_SEARCH:', error.message);
  }
}

testAlphaVantageAPI();