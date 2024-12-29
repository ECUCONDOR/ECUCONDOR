#!/usr/bin/env node
import { Command } from 'commander';
import { p2pService } from '../services/p2pService';
import { Currency, OrderType, PaymentMethod } from '@/types/p2p';
import chalk from 'chalk';
import Table from 'cli-table3';

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
        type: options.type as OrderType,
        amount: Number(options.amount),
        price: Number(options.price),
        payment_method: options.payment as PaymentMethod,
        bank_info: options.bankInfo,
        country: options.country,
        min_amount: options.minAmount ? Number(options.minAmount) : undefined,
        max_amount: options.maxAmount ? Number(options.maxAmount) : undefined
      });

      console.log(chalk.green('✓ Orden creada exitosamente'));
      console.log(chalk.cyan('Detalles de la orden:'));
      console.table({
        ID: order.id,
        Moneda: order.moneda,
        Tipo: order.tipo,
        Cantidad: order.cantidad,
        Precio: order.precio,
        'Método de Pago': order.metodo_pago,
        Estado: order.estado
      });
    } catch (error) {
      console.error(chalk.red('✗ Error al crear la orden:'), error.message);
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
        type: options.type as OrderType,
        status: options.status as any
      });

      if (orders.length === 0) {
        console.log(chalk.yellow('No se encontraron órdenes'));
        return;
      }

      const table = new Table({
        head: ['ID', 'Moneda', 'Tipo', 'Cantidad', 'Precio', 'Método', 'Estado'].map(h => chalk.cyan(h)),
        colWidths: [8, 8, 6, 10, 10, 15, 10]
      });

      orders.forEach(order => {
        table.push([
          order.id,
          order.moneda,
          order.tipo,
          order.cantidad.toString(),
          order.precio.toString(),
          order.metodo_pago,
          order.estado
        ]);
      });

      console.log(table.toString());
    } catch (error) {
      console.error(chalk.red('✗ Error al listar órdenes:'), error.message);
      process.exit(1);
    }
  });

program
  .command('get-limits')
  .description('Obtener límites del usuario')
  .action(async () => {
    try {
      const limits = await p2pService.getUserLimits();
      
      console.log(chalk.cyan('Límites del usuario:'));
      console.table({
        'Verificado': limits.verified ? '✓ Sí' : '✗ No',
        'Límite por orden': limits.max_order_amount,
        'Límite diario': limits.daily_limit,
        'Límite mensual': limits.monthly_limit
      });
    } catch (error) {
      console.error(chalk.red('✗ Error al obtener límites:'), error.message);
      process.exit(1);
    }
  });

if (require.main === module) {
  program.parse(process.argv);
}
