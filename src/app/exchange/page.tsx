'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import { formatNumber } from '@/utils/numberUtils';
import { exchangeOptions } from '@/constants/exchangeOptions';

const ExchangePage = () => {
  const [selectedTab, setSelectedTab] = useState('buy');
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState(0);
  const { prices } = useBinanceWebSocket(exchangeOptions.map(opt => opt.symbol));

  const getRate = (pair: string) => {
    const price = prices?.find(p => p.symbol === pair);
    return price ? parseFloat(price.price) : 0;
  };

  const calculateTotal = () => {
    const pair = selectedTab === 'buy' ? 'USDTARS' : 'USDTBRL';
    const rate = getRate(pair);
    const calculatedTotal = parseFloat(amount) * rate;
    setTotal(calculatedTotal);
  };

  const handleExchange = () => {
    // Implement exchange logic
    toast({
      title: 'Exchange submitted',
      description: `Exchanging ${amount} ${selectedTab === 'buy' ? 'USDT' : selectedTab.toUpperCase()} at rate ${getRate(selectedTab === 'buy' ? 'USDTARS' : 'USDTBRL')}`,
    });
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-semibold mb-4">Exchange</h1>

      <Tabs defaultValue="buy" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="buy">Buy</TabsTrigger>
          <TabsTrigger value="ars">ARS</TabsTrigger>
          <TabsTrigger value="brl">BRL</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>Exchange {selectedTab.toUpperCase()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label htmlFor="amount">Amount:</label>
              <Input 
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  calculateTotal();
                }}
                placeholder="Enter amount"
                className="mt-1"
              />
            </div>
            <div className="mb-4">
              <label>Exchange Rate:</label>
              <p className="text-xl font-semibold mt-1">
                {formatNumber(getRate(selectedTab === 'buy' ? 'USDTARS' : 'USDTBRL'))}
              </p>
            </div>
            <div className="mb-6">
              <label>Total:</label>
              <p className="text-xl font-semibold mt-1">
                {formatNumber(total)} {selectedTab === 'buy' ? 'ARS' : selectedTab.toUpperCase()}
              </p>
            </div>
            <Button onClick={handleExchange}>Exchange Now</Button>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default ExchangePage;
