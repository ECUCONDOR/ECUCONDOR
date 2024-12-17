// Configuración de la API de Binance
export const binanceConfig = {
  apiKey: process.env.BINANCE_API_KEY || '',
  apiSecret: process.env.BINANCE_API_SECRET || '',
  baseUrl: 'https://api.binance.com',
  
  // Endpoints
  endpoints: {
    ticker: '/api/v3/ticker/price',
    exchangeInfo: '/api/v3/exchangeInfo',
    orderBook: '/api/v3/depth',
  },
  
  // Pares de trading soportados
  supportedPairs: ['BTCUSDT', 'WLDUSDT'],
  
  // Límites de la API
  rateLimits: {
    weight: 1200,  // Límite de peso por minuto
    orders: 10,    // Límite de órdenes por segundo
  },
  
  // Intervalos de actualización (en milisegundos)
  updateIntervals: {
    prices: 15000,      // 15 segundos
    orderBook: 30000,   // 30 segundos
  }
};
