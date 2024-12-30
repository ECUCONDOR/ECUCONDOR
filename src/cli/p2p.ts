#!/usr/bin/env node
import { Command } from 'commander';
import { p2pService } from '../services/p2pService';
import { Currency, OrderTypeEnum, PaymentMethod } from '@/types/p2p';
import Table from 'cli-table3';
import { supabase } from '@/lib/supabase/client';

interface UserLimits {
  max_order_amount: number;
  daily_limit: number;
  monthly_limit: number;
  verified: boolean;
}

const program = new Command();

program
  .name('p2p-cli')
  .description('CLI para gestionar órdenes P2P')
  .version('1.0.0');

program
  .command('create-order')
  .description('Crear una nueva orden P2P')
  .requiredOption('-c, --currency <currency>', 'Moneda (USD, ARS, BRL, WLD)')
  .requiredOption('-t, --type <type>', 'Tipo de orden (buy, sell)')
  .requiredOption('-a, --amount <amount>', 'Cantidad')
  .requiredOption('-p, --price <price>', 'Precio')
  .requiredOption('-m, --payment <method>', 'Método de pago (TRANSFERENCIA_BANCARIA, MERCADOPAGO, PAYPAL)')
  .option('-b, --bank-info <info>', 'Información bancaria')
  .option('--country <country>', 'País')
  .option('--min-amount <amount>', 'Monto mínimo')
  .option('--max-amount <amount>', 'Monto máximo')
  .action(async (options) => {
    try {
      const order = await p2pService.createOrder({
        currency: options.currency as Currency,
        type: options.type as OrderTypeEnum,
        amount: Number(options.amount),
        price: Number(options.price),
        payment_method: options.payment as PaymentMethod,
        bank_info: options.bankInfo,
        country: options.country,
        min_amount: options.minAmount ? Number(options.minAmount) : undefined,
        max_amount: options.maxAmount ? Number(options.maxAmount) : undefined
      });

      console.log('\n✓ Orden creada exitosamente:');
      console.log('------------------------');
      console.log(`ID: ${order.id}`);
      console.log(`Moneda: ${order.moneda}`);
      console.log(`Tipo: ${order.tipo}`);
      console.log(`Cantidad: ${order.cantidad}`);
      console.log(`Precio: ${order.precio}`);
      console.log(`Método de pago: ${order.metodo_pago}`);
      console.log(`Estado: ${order.estado}`);
    } catch (error) {
      console.error('\n✗ Error al crear la orden:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('list-orders')
  .description('Listar órdenes P2P')
  .option('-c, --currency <currency>', 'Filtrar por moneda')
  .option('-t, --type <type>', 'Filtrar por tipo')
  .option('-s, --status <status>', 'Filtrar por estado')
  .action(async (options) => {
    try {
      const orders = await p2pService.getOrders({
        currency: options.currency as Currency,
        type: options.type as OrderTypeEnum,
        status: options.status as any
      });

      if (orders.length === 0) {
        console.log('\nNo se encontraron órdenes');
        return;
      }

      console.log('\nÓrdenes encontradas:');
      console.log('------------------------');
      orders.forEach(order => {
        console.log(`\nID: ${order.id}`);
        console.log(`Moneda: ${order.moneda}`);
        console.log(`Tipo: ${order.tipo}`);
        console.log(`Cantidad: ${order.cantidad}`);
        console.log(`Precio: ${order.precio}`);
        console.log(`Método de pago: ${order.metodo_pago}`);
        console.log(`Estado: ${order.estado}`);
        console.log('------------------------');
      });
    } catch (error) {
      console.error('\n✗ Error al obtener las órdenes:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('get-limits')
  .description('Obtener límites del usuario')
  .action(async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('No authenticated user');
      }
      const limits: UserLimits = await p2pService.getUserLimits(session.session.user.id);
      
      console.log('\nLímites del usuario:');
      console.log('------------------------');
      console.log(`Límite por orden: ${limits.max_order_amount}`);
      console.log(`Límite diario: ${limits.daily_limit}`);
      console.log(`Límite mensual: ${limits.monthly_limit}`);
    } catch (error) {
      console.error('\n✗ Error al obtener límites:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

if (require.main === module) {
  program.parse(process.argv);
}
