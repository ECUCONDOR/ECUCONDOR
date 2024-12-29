import axios from 'axios';

interface BinancePrice {
  symbol: string;
  price: string;
}

export const binanceService = {
  async getExchangeRate(symbol: string): Promise<number> {
    try {
      const response = await axios.get<BinancePrice>(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
      return parseFloat(response.data.price);
    } catch (error) {
      console.error('Error fetching from Binance:', error);
      throw new Error('Error al obtener la tasa de cambio de Binance');
    }
  },

  async getMultipleRates(): Promise<{ [key: string]: number }> {
    try {
      const [usdtArs, usdtBrl] = await Promise.all([
        this.getExchangeRate('USDTARS'),
        this.getExchangeRate('USDTBRL')
      ]);

      return {
        USDTARS: usdtArs,
        USDTBRL: usdtBrl,
        ARSBRL: usdtBrl / usdtArs,
        BRLARS: usdtArs / usdtBrl
      };
    } catch (error) {
      console.error('Error fetching multiple rates:', error);
      throw new Error('Error al obtener las tasas de cambio');
    }
  }
};
