'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useP2PStore, p2pService } from '@/services/p2pService';
import { 
  OrderTypeEnum,
  CurrencyCode,
  PaymentMethodType,
  type CreateOrderDTO, 
  type Currency, 
  type P2POrder,
  type PaymentMethod
} from '@/types/p2p';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/mode-toggle';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

function P2PPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [orderType, setOrderType] = useState<OrderTypeEnum>(OrderTypeEnum.Buy);
  const [currency, setCurrency] = useState<Currency>({
    code: CurrencyCode.USD,
    name: 'US Dollar',
    symbol: '$'
  });
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<P2POrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  useEffect(() => {
    loadOrders();
  }, [orderType, currency]);

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const activeOrders = await p2pService.getOrders({ currency, type: orderType });
      setOrders(activeOrders);
    } catch (error: any) {
      console.error('Error cargando órdenes:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudieron cargar las órdenes activas',
        variant: 'destructive'
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!user) {
      toast({
        title: '❌ Error',
        description: 'Debes iniciar sesión para crear una orden',
        variant: 'destructive'
      });
      return;
    }

    if (!amount || !price || parseFloat(amount) <= 0 || parseFloat(price) <= 0) {
      toast({
        title: '⚠️ Atención',
        description: 'Por favor ingresa una cantidad y precio válidos',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const orderData: CreateOrderDTO = {
        type: orderType,
        currency,
        amount: parseFloat(amount),
        price: parseFloat(price),
        payment_method: {
          id: 'transfer-1',
          type: PaymentMethodType.TransferenciaBancaria,
          name: 'Transferencia Bancaria',
          enabled: true
        }
      };

      await p2pService.createOrder(orderData);
      
      toast({
        title: '✨ ¡Orden creada con éxito!',
        description: 'Tu orden ha sido publicada. Te notificaremos cuando alguien quiera negociar contigo.',
      });

      setAmount('');
      setPrice('');
      loadOrders();
    } catch (error: any) {
      console.error('Error creando orden:', error);
      toast({
        title: '❌ Error',
        description: error.message || 'No se pudo crear la orden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Mercado Amigo 🤝</h1>
              <p className="text-muted-foreground mt-2">
                Intercambia criptomonedas directamente con otros usuarios de forma segura y sencilla
              </p>
            </div>
            <ModeToggle />
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex space-x-4 mb-6">
                <Button
                  className="flex-1 h-12"
                  variant={orderType === OrderTypeEnum.Buy ? 'default' : 'outline'}
                  onClick={() => {
                    setOrderType(OrderTypeEnum.Buy);
                    toast({
                      title: "💡 Consejo para Comprar",
                      description: "Revisa las ofertas disponibles y elige la que mejor se ajuste a tu presupuesto. ¡Es muy fácil!",
                    });
                  }}
                >
                  Comprar
                </Button>
                <Button
                  className="flex-1 h-12"
                  variant={orderType === OrderTypeEnum.Sell ? 'default' : 'outline'}
                  onClick={() => {
                    setOrderType(OrderTypeEnum.Sell);
                    toast({
                      title: "💡 Consejo para Vender",
                      description: "Publica tu oferta especificando el precio y la cantidad. ¡Otros usuarios podrán contactarte!",
                    });
                  }}
                >
                  Vender
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Moneda
                  </label>
                  <select
                    value={currency.code}
                    onChange={(e) => setCurrency({
                      code: e.target.value as any,
                      name: 'US Dollar',
                      symbol: '$'
                    })}
                    className="w-full p-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                  >
                    <option value="USD">USD</option>
                    <option value="ARS">ARS</option>
                    <option value="BRL">BRL</option>
                    <option value="WLD">WLD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cantidad
                  </label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ingrese cantidad"
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Precio por unidad
                  </label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ingrese precio"
                    className="h-12"
                  />
                </div>

                <Button
                  className="w-full h-12 mt-4"
                  onClick={handleCreateOrder}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    orderType === OrderTypeEnum.Buy ? 'Crear Orden de Compra' : 'Publicar Orden de Venta'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Órdenes Activas</h2>
              {loadingOrders ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left">Usuario</th>
                        <th className="px-4 py-3 text-left">Precio</th>
                        <th className="px-4 py-3 text-left">Cantidad</th>
                        <th className="px-4 py-3 text-left">Total</th>
                        <th className="px-4 py-3 text-left">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b">
                          <td className="px-4 py-3">{order.user?.name || 'Usuario'}</td>
                          <td className="px-4 py-3">{order.price} {order.currency.code}</td>
                          <td className="px-4 py-3">{order.amount}</td>
                          <td className="px-4 py-3">{(order.price * order.amount).toFixed(2)} {order.currency.code}</td>
                          <td className="px-4 py-3">
                            <Button
                              variant="outline"
                              onClick={() => {
                                toast({
                                  title: "🤝 ¡Genial!",
                                  description: "Te conectaremos con el vendedor para realizar la operación.",
                                });
                              }}
                            >
                              {orderType === OrderTypeEnum.Buy ? 'Comprar' : 'Vender'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay órdenes activas en este momento
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default P2PPage;
