import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

export class MercadoPagoProvider {
    private client: MercadoPagoConfig;

    constructor(accessToken: string) {
        this.client = new MercadoPagoConfig({ 
            accessToken: accessToken 
        });
    }

    async createPreference(data: any) {
        const preference = new Preference(this.client);
        return await preference.create({ body: data });
    }

    async getPaymentById(id: string) {
        const payment = new Payment(this.client);
        return await payment.get({ id });
    }
}
