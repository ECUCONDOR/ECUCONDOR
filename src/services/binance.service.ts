const BINANCE_API_URL = 'https://api.binance.com/api/v3';
const CACHE_DURATION = 10000; // 10 segundos de caché

interface BinancePrice {
  symbol: string;
  price: string;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export class BinanceService {
  private static instance: BinanceService;
  private priceCache: Map<string, CacheItem<number>>;
  private lastBulkUpdate: number;
  private bulkPriceCache: Map<string, number>;

  private constructor() {
    this.priceCache = new Map();
    this.bulkPriceCache = new Map();
    this.lastBulkUpdate = 0;
  }

  static getInstance(): BinanceService {
    if (!BinanceService.instance) {
      BinanceService.instance = new BinanceService();
    }
    return BinanceService.instance;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_DURATION;
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  async getPrice(symbol: string): Promise<number> {
    // Verificar caché
    const cachedPrice = this.priceCache.get(symbol);
    if (cachedPrice && this.isCacheValid(cachedPrice.timestamp)) {
      return cachedPrice.data;
    }

    try {
      const response = await this.fetchWithTimeout(
        `${BINANCE_API_URL}/ticker/price?symbol=${symbol}`
      );

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(`El símbolo ${symbol} no es válido en Binance.`);
        }
        throw new Error('Error al obtener el precio de Binance.');
      }

      const data: BinancePrice = await response.json();
      const price = parseFloat(data.price);

      // Actualizar caché
      this.priceCache.set(symbol, {
        data: price,
        timestamp: Date.now()
      });

      return price;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('La conexión con Binance ha expirado. Por favor, intente nuevamente.');
        }
      }
      throw new Error('Error al obtener el precio de Binance. Por favor, intente nuevamente.');
    }
  }

  async getPrices(symbols: string[]): Promise<Map<string, number>> {
    // Verificar caché bulk
    if (this.isCacheValid(this.lastBulkUpdate)) {
      const cachedPrices = new Map<string, number>();
      let allCached = true;

      for (const symbol of symbols) {
        const price = this.bulkPriceCache.get(symbol);
        if (price !== undefined) {
          cachedPrices.set(symbol, price);
        } else {
          allCached = false;
          break;
        }
      }

      if (allCached) {
        return cachedPrices;
      }
    }

    try {
      const response = await this.fetchWithTimeout(`${BINANCE_API_URL}/ticker/price`);

      if (!response.ok) {
        throw new Error('Error al obtener los precios de Binance.');
      }

      const data: BinancePrice[] = await response.json();
      const priceMap = new Map<string, number>();

      data.forEach(({ symbol, price }) => {
        if (symbols.includes(symbol)) {
          const numericPrice = parseFloat(price);
          priceMap.set(symbol, numericPrice);
          this.bulkPriceCache.set(symbol, numericPrice);
        }
      });

      this.lastBulkUpdate = Date.now();
      return priceMap;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('La conexión con Binance ha expirado. Por favor, intente nuevamente.');
        }
      }
      throw new Error('Error al obtener los precios de Binance. Por favor, intente nuevamente.');
    }
  }

  clearCache(): void {
    this.priceCache.clear();
    this.bulkPriceCache.clear();
    this.lastBulkUpdate = 0;
  }
}
