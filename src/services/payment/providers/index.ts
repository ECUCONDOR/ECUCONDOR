import { MercadoPagoProvider } from './mercadopago';
import { ModoProvider } from './modo';
import { PixProvider } from './pix';
import { StripeProvider } from './stripe';

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN no está configurado en las variables de entorno');
}

export const providers = {
    MERCADOPAGO: new MercadoPagoProvider(process.env.MERCADOPAGO_ACCESS_TOKEN),
    MODO: new ModoProvider(),
    PIX: new PixProvider(),
    STRIPE: new StripeProvider(),
} as const;
