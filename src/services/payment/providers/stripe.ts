import Stripe from 'stripe';

export class StripeProvider {
    private client: Stripe;

    constructor() {
        this.client = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2024-12-18.acacia'
        });
    }

    async createPayment(amount: number, currency: string) {
        const paymentIntent = await this.client.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency.toLowerCase(),
            payment_method_types: ['card'],
        });

        return paymentIntent;
    }

    async getPaymentById(paymentId: string) {
        return await this.client.paymentIntents.retrieve(paymentId);
    }
}
