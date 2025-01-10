'use client';

import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Decimal } from 'decimal.js';

interface TransferCalculatorProps {
  clientId: number;
  onTransferAction: (transferDetails: { 
    amount: number; 
    fromWalletId: string; 
    toWalletId: string; 
    description: string; 
  }) => Promise<void>;
}

interface CalculatorData {
  exchangeRate: string;
  amount: string;
  result: string;
  conversionType: '1' | '2'; // 1: USD->ARS, 2: ARS->USD
  includeCommission: boolean;
  defaultExchangeRate: number;
}

interface TransferCalculatorState {
  originalAmount: number;
  exchangeRate: number;
  commission: number;
  totalAmount: number;
  result: string;
}

const initialCalculatorState: TransferCalculatorState = {
  originalAmount: 0,
  exchangeRate: 0,
  commission: 0,
  totalAmount: 0,
  result: ''
};

const TransferCalculator: React.FC<TransferCalculatorProps> = ({ clientId, onTransferAction }) => {
  // Constants
  const DEFAULT_EXCHANGE_RATE = 1315;
  const COMMISSION_RATE = 0.03;
  const SMALL_AMOUNT_LIMIT = 15;
  const SMALL_AMOUNT_DISCOUNT = 0.50;
  const BINANCE_API_URL = 'https://api.binance.com/api/v3/klines?symbol=USDTARS&interval=1d&limit=1';

  const [calculatorData, setCalculatorData] = useState<CalculatorData>({
    exchangeRate: 'Consultando...',
    amount: '',
    result: '',
    conversionType: '1',
    includeCommission: false,
    defaultExchangeRate: DEFAULT_EXCHANGE_RATE
  });

  const [transferCalculatorState, setTransferCalculatorState] = useState<TransferCalculatorState>(initialCalculatorState);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  const fetchExchangeRate = async () => {
    setLoading(true);
    try {
      const response = await fetch(BINANCE_API_URL);
      if (!response.ok) {
        throw new Error('Error al obtener la tasa de cambio');
      }

      const data = await response.json();
      if (data && data.length > 0) {
        const binanceRate = new Decimal(String(data[0][4]));
        const discountFactor = new Decimal('0.985');
        const finalRate = binanceRate.mul(discountFactor).toDecimalPlaces(2, Decimal.ROUND_DOWN);

        setCalculatorData(prev => ({
          ...prev,
          exchangeRate: `1 USD = ${finalRate} ARS`,
          defaultExchangeRate: finalRate.toNumber()
        }));
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      toast({
        title: 'Error',
        description: 'No se pudo obtener la tasa de cambio',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateUsdToArs = (usdAmount: Decimal, exchangeRate: Decimal, includeCommission: boolean) => {
    const commissionRate = new Decimal(COMMISSION_RATE);
    const smallAmountLimit = new Decimal(SMALL_AMOUNT_LIMIT);
    const discount = new Decimal(SMALL_AMOUNT_DISCOUNT);

    let commission = new Decimal(0);
    let finalUsdAmount = usdAmount;
    let totalUsdAmount = usdAmount;

    if (usdAmount.lessThan(smallAmountLimit)) {
      commission = discount;
      finalUsdAmount = usdAmount.minus(discount);
      totalUsdAmount = usdAmount;
    } else {
      if (includeCommission) {
        commission = usdAmount.mul(commissionRate).toDecimalPlaces(2, Decimal.ROUND_DOWN);
        finalUsdAmount = usdAmount.minus(commission);
        totalUsdAmount = usdAmount;
      } else {
        commission = usdAmount.mul(commissionRate).toDecimalPlaces(2, Decimal.ROUND_DOWN);
        totalUsdAmount = usdAmount.plus(commission);
        finalUsdAmount = usdAmount;
      }
    }

    const arsAmount = finalUsdAmount.mul(exchangeRate).toDecimalPlaces(2, Decimal.ROUND_DOWN);
    return { arsAmount, totalUsdAmount, commission };
  };

  const calculateArsToUsd = (arsAmount: Decimal) => {
    const adjustedRate = new Decimal(calculatorData.defaultExchangeRate + 50);
    const usdAmount = arsAmount.div(adjustedRate).toDecimalPlaces(2, Decimal.ROUND_DOWN);
    return { usdAmount, totalArsAmount: arsAmount };
  };

  const generateUsdToArsMessage = (
    amount: number,
    arsAmount: number,
    commission: number,
    totalAmount: number,
    includeCommission: boolean
  ) => {
    const dateTime = new Date().toLocaleString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let message = `🏦 CAMBIO DE DÓLARES A PESOS 🏦

Fecha y Hora: ${dateTime}

💰 Resumen de la Conversión 💰

* Monto original: USD ${amount.toFixed(2)}
* Tasa de cambio: ${calculatorData.defaultExchangeRate.toFixed(2)}
* Monto en pesos: ARS ${arsAmount.toFixed(2)}
`;

    if (amount < SMALL_AMOUNT_LIMIT) {
      message += `\n(Se deducen ${SMALL_AMOUNT_DISCOUNT} dólares en montos menores a ${SMALL_AMOUNT_LIMIT})`;
    } else {
      if (includeCommission) {
        message += `\n✅ Comisión incluida: USD ${commission.toFixed(2)}`;
      } else {
        message += `\n(Comisión de ${commission.toFixed(2)} dólares no incluida, monto total a enviar: ${totalAmount.toFixed(2)} dólares)`;
      }
    }

    message += `\n
🏦 Datos Bancarios de Transferencia 🏦

🏦 Banco: Produbanco
🌐 Tipo de Cuenta: Pro Pyme
📜 Número de Cuenta: 27059070809
👤 Nombre: Ecucondor S.A.S. Sociedad De Beneficio E Interés Colectivo
📄 RUC: 1391937000001
📧 Correo: ecucondor@gmail.com

⚠ Envíe su comprobante de pago y alias a este chat.
⏳ Tiempo estimado: 5-10 minutos.

🌟 Gracias por elegir ECUCONDOR 🌟
🌐 https://ecucondor.com/`;

    return message;
  };

  const generateArsToUsdMessage = (arsAmount: number, usdAmount: number) => {
    const dateTime = new Date().toLocaleString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `🏦 CAMBIO DE PESOS A DÓLARES 🏦

Fecha y Hora: ${dateTime}

💰 Resumen de la Conversión 💰

* Monto en pesos: ARS ${arsAmount.toFixed(2)}
* Monto en dólares: USD ${usdAmount.toFixed(2)}

🏦 Datos Bancarios 🏦

Reina Mosquera
CVU: 0000003100085925582280
Alias: reinasmb.
CUIT/CUIL: 20963144769

✅ Envíe su comprobante de pago y alias.
⏳ Le notificaremos cuando se complete.

🌟 ¡Gracias por su preferencia! 🌟
🌐 https://ecucondor.com/`;
  };

  const handleCalculate = async () => {
    try {
      setLoading(true);
      const amount = new Decimal(calculatorData.amount.trim());

      if (amount.isNaN() || amount.isZero() || amount.isNegative()) {
        throw new Error('Por favor ingrese un monto válido mayor a cero');
      }

      let message = '';
      let transferDetails = {};

      if (calculatorData.conversionType === '1') {
        const { arsAmount, totalUsdAmount, commission } = calculateUsdToArs(
          amount,
          new Decimal(calculatorData.defaultExchangeRate),
          calculatorData.includeCommission
        );

        message = generateUsdToArsMessage(
          amount.toNumber(),
          arsAmount.toNumber(),
          commission.toNumber(),
          totalUsdAmount.toNumber(),
          calculatorData.includeCommission
        );

        transferDetails = {
          type: 'USD_TO_ARS',
          originalAmount: amount.toNumber(),
          convertedAmount: arsAmount.toNumber(),
          commission: commission.toNumber(),
          totalAmount: totalUsdAmount.toNumber(),
          includeCommission: calculatorData.includeCommission
        };
      } else {
        const { usdAmount, totalArsAmount } = calculateArsToUsd(amount);
        message = generateArsToUsdMessage(amount.toNumber(), usdAmount.toNumber());

        transferDetails = {
          type: 'ARS_TO_USD',
          originalAmount: amount.toNumber(),
          convertedAmount: usdAmount.toNumber(),
          totalAmount: totalArsAmount.toNumber()
        };
      }

      setCalculatorData(prev => ({ ...prev, result: message }));
      if (onTransferAction) {
        onTransferAction({
          amount: transferDetails.originalAmount,
          fromWalletId: '',
          toWalletId: '',
          description: ''
        });
      }
    } catch (error) {
      console.error('Error en el cálculo:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error inesperado en el cálculo',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = async () => {
    try {
      await navigator.clipboard.writeText(calculatorData.result);
      toast({
        title: 'Copiado',
        description: 'Resultado copiado al portapapeles'
      });
    } catch (error) {
      console.error('Error al copiar:', error);
      toast({
        title: 'Error',
        description: 'No se pudo copiar el resultado',
        variant: 'destructive'
      });
    }
  };

  const handleAmountChange = (value: string) => {
    setCalculatorData(prev => ({
      ...prev,
      amount: value
    }));
  };

  const handleExchangeRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCalculatorData(prev => ({
      ...prev,
      defaultExchangeRate: parseFloat(e.target.value) || 0
    }));
  };

  const handleCommissionToggle = (checked: boolean) => {
    setCalculatorData(prev => ({
      ...prev,
      includeCommission: Boolean(checked)
    }));
  };

  return (
    <Card className="w-full p-6">
      <h2 className="text-xl font-semibold mb-6">Calculadora de Transferencias</h2>

      <div className="mb-4 flex flex-col items-center">
        <div className="font-bold">{calculatorData.exchangeRate}</div>
      </div>

      <div className="space-y-4">
        <RadioGroup
          value={calculatorData.conversionType}
          onValueChange={(value) => setCalculatorData(prev => ({ ...prev, conversionType: value as '1' | '2' }))}
          className="flex items-center space-x-2"
        >
          <div className="flex items-center">
            <RadioGroupItem value="1" id="usd-ars" />
            <Label htmlFor="usd-ars">Dólares a Pesos</Label>
          </div>
          <div className="flex items-center">
            <RadioGroupItem value="2" id="ars-usd" />
            <Label htmlFor="ars-usd">Pesos a Dólares</Label>
          </div>
        </RadioGroup>

        <div>
          <Label htmlFor="amount-input">Monto</Label>
          <Input
            id="amount-input"
            type="number"
            placeholder="Ingrese el monto"
            value={calculatorData.amount}
            onChange={(e) => handleAmountChange(e.target.value)}
          />
        </div>

        {calculatorData.conversionType === '1' && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="commission"
              checked={calculatorData.includeCommission}
              onCheckedChange={(checked) => handleCommissionToggle(checked)}
            />
            <Label htmlFor="commission">Comisión incluida</Label>
          </div>
        )}
      </div>

      <Button onClick={handleCalculate} disabled={loading} className="w-full my-6">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Calculando...
          </>
        ) : (
          'Calcular'
        )}
      </Button>

      <Card className="h-[300px] border-dashed p-2">
        <pre className="break-words whitespace-pre-line overflow-y-auto h-full text-sm">
          {calculatorData.result}
        </pre>
      </Card>

      <Button
        onClick={handleCopyResult}
        disabled={!calculatorData.result}
        className="w-full mt-2"
      >
        Copiar Resultado
      </Button>
    </Card>
  );
};

export default TransferCalculator;
