interface BinancePrice {
  symbol: string;
  price: string;
}

export async function fetchBinancePrices() {
  try {
    const [wldPrice, brlPrice, arsPrice] = await Promise.all([
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=WLDUSDT'),
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTBRL'),
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTARS')
    ]);

    const [wldData, brlData, arsData] = await Promise.all([
      wldPrice.json(),
      brlPrice.json(),
      arsPrice.json()
    ]);

    return {
      wld: parseFloat(wldData.price),
      brl: parseFloat(brlData.price),
      ars: parseFloat(arsData.price)
    };
  } catch (error) {
    console.error('Error fetching Binance prices:', error);
    return null;
  }
}
