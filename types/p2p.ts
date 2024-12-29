export type Currency = {
    code: string;
    name: string;
    symbol: string;
};

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export type PaymentMethod = {
    id: string;
    name: string;
    description?: string;
    enabled: boolean;
};

export type OrderType = {
    id: string;
    type: 'buy' | 'sell';
    amount: number;
    price: number;
    currency: Currency;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
};

export type CreateOrderDTO = {
    type: 'buy' | 'sell';
    amount: number;
    price: number;
    currencyCode: string;
    paymentMethodId: string;
};

export type P2POrder = OrderType & {
    paymentMethod: PaymentMethod;
    userId: string;
};

export type UserLimits = {
    dailyLimit: number;
    monthlyLimit: number;
    remainingDaily: number;
    remainingMonthly: number;
    currency: Currency;
};
