import { binanceConfig } from '../config/binance';

interface PriceResponse {
  symbol: string;
  price: string;
}

export class BinanceService {
  private static instance: BinanceService;
  private priceCache: Map<string, { price: number; timestamp: number }>;
  private readonly CACHE_DURATION = 5000; // 5 segundos

  private constructor() {
    this.priceCache = new Map();
  }

  public static getInstance(): BinanceService {
    if (!BinanceService.instance) {
      BinanceService.instance = new BinanceService();
    }
    return BinanceService.instance;
  }

  private async fetchFromAPI(endpoint: string, params?: Record<string, string>): Promise<any> {
    try {
      const queryString = params ? new URLSearchParams(params).toString() : '';
      const url = `${binanceConfig.baseUrl}${endpoint}${queryString ? '?' + queryString : ''}`;
      
      const headers: Record<string, string> = {};
      if (binanceConfig.apiKey) {
        headers['X-MBX-APIKEY'] = binanceConfig.apiKey;
      }

      const response = await fetch(url, {
        headers,
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching from Binance API:', error.message);
      }
      // Provide fallback data for development
      if (endpoint === binanceConfig.endpoints.ticker) {
        return {
          symbol: params?.symbol || 'BTCUSDT',
          price: params?.symbol === 'BTCUSDT' ? '42000.00' : '3.15'
        };
      }
      throw error;
    }
  }

  public async getPrice(symbol: string): Promise<number> {
    // Verificar el caché
    const cached = this.priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.price;
    }

    try {
      const response = await this.fetchFromAPI(binanceConfig.endpoints.ticker, { symbol });
      const price = parseFloat(response.price);
      
      // Actualizar el caché
      this.priceCache.set(symbol, {
        price,
        timestamp: Date.now()
      });

      return price;
    } catch (error) {
      console.error(`Error getting price for ${symbol}:`, error);
      throw error;
    }
  }

  public async getPrices(symbols: string[]): Promise<Map<string, number>> {
    const prices = new Map<string, number>();
    
    await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const price = await this.getPrice(symbol);
          prices.set(symbol, price);
        } catch (error) {
          console.error(`Error getting price for ${symbol}:`, error);
          prices.set(symbol, 0); // Valor por defecto en caso de error
        }
      })
    );

    return prices;
  }

  public async getExchangeInfo(): Promise<any> {
    try {
      return await this.fetchFromAPI(binanceConfig.endpoints.exchangeInfo);
    } catch (error) {
      console.error('Error getting exchange info:', error);
      throw error;
    }
  }

  public async getOrderBook(symbol: string, limit: number = 10): Promise<any> {
    try {
      return await this.fetchFromAPI(binanceConfig.endpoints.orderBook, {
        symbol,
        limit: limit.toString()
      });
    } catch (error) {
      console.error(`Error getting order book for ${symbol}:`, error);
      throw error;
    }
  }
}
