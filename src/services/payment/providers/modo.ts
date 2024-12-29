import axios from 'axios';

// Interfaces para las respuestas de la API
interface ModoQRResponse {
    qr_code: string;
    id: string;
    status: string;
}

interface ModoStatusResponse {
    status: string;
    transaction_id?: string;
}

// Interfaces para nuestros resultados
interface ModoQRResult {
    qr_data: string;
    expiration_time: string;
}

interface ModoPaymentStatus {
    status: 'pending' | 'completed' | 'expired' | 'failed';
    transaction_id?: string;
}

// Configuración del provider
interface ModoConfig {
    apiKey: string;
    baseUrl: string;
    timeout?: number;
}

export class ModoProvider {
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly timeout: number;

    constructor() {
        const apiKey = process.env.MODO_API_KEY;
        const baseUrl = process.env.MODO_API_URL;

        if (!apiKey?.trim()) {
            throw new Error('MODO_API_KEY no está configurado en las variables de entorno');
        }
        if (!baseUrl?.trim()) {
            throw new Error('MODO_API_URL no está configurado en las variables de entorno');
        }

        this.apiKey = apiKey.trim();
        this.baseUrl = baseUrl.trim();
        this.timeout = 10000; // 10 segundos por defecto
    }

    private isQRResponse(data: unknown): data is ModoQRResponse {
        if (!data || typeof data !== 'object') {
            return false;
        }

        const response = data as Record<string, unknown>;
        const isValid = (
            typeof response.qr_code === 'string' && 
            typeof response.id === 'string' && 
            typeof response.status === 'string'
        );

        if (!isValid) {
            console.warn('Respuesta QR de MODO inválida:', response);
        }

        return isValid;
    }

    private isStatusResponse(data: unknown): data is ModoStatusResponse {
        if (!data || typeof data !== 'object') {
            return false;
        }

        const response = data as Record<string, unknown>;
        const isValid = typeof response.status === 'string';

        if (!isValid) {
            console.warn('Respuesta de estado de MODO inválida:', response);
            return false;
        }

        if ('transaction_id' in response && typeof response.transaction_id !== 'string') {
            console.warn('transaction_id inválido en respuesta de MODO:', response);
            return false;
        }

        return true;
    }

    async createQR(amount: number, currency: string): Promise<ModoQRResult> {
        if (!amount || amount <= 0) {
            throw new Error('El monto debe ser mayor a 0');
        }
        if (!currency?.trim()) {
            throw new Error('La moneda es requerida');
        }

        try {
            const response = await axios({
                method: 'POST',
                url: `${this.baseUrl}/qr/generate`,
                data: {
                    amount,
                    currency: currency.trim(),
                    description: 'Depósito via MODO',
                    expiration: 1800 // 30 minutos
                },
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: this.timeout
            });

            if (!response.data) {
                throw new Error('No se recibieron datos del servidor de MODO');
            }

            if (!this.isQRResponse(response.data)) {
                throw new Error('Respuesta inválida del servidor de MODO');
            }

            return {
                qr_data: response.data.qr_code,
                expiration_time: this.calculateExpirationTime(30)
            };
        } catch (error: unknown) {
            if (error && typeof error === 'object') {
                if ('code' in error && error.code === 'ECONNABORTED') {
                    throw new Error('Timeout en la conexión con MODO');
                }
                
                if ('response' in error) {
                    const responseError = error as { response?: { data?: { message?: string } } };
                    const errorMessage = responseError.response?.data?.message || 'Error desconocido';
                    throw new Error(`Error de MODO: ${errorMessage}`);
                }
            }
            throw new Error('Error inesperado al generar QR de MODO');
        }
    }

    async checkPaymentStatus(qrId: string): Promise<ModoPaymentStatus> {
        if (!qrId?.trim()) {
            throw new Error('El ID del QR es requerido');
        }

        try {
            const response = await axios({
                method: 'GET',
                url: `${this.baseUrl}/qr/${qrId.trim()}/status`,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: this.timeout
            });

            if (!response.data) {
                throw new Error('No se recibieron datos al verificar el estado del pago');
            }

            if (!this.isStatusResponse(response.data)) {
                throw new Error('Respuesta inválida al verificar estado del pago');
            }

            return {
                status: this.normalizePaymentStatus(response.data.status),
                transaction_id: response.data.transaction_id
            };
        } catch (error: unknown) {
            if (error && typeof error === 'object') {
                if ('code' in error && error.code === 'ECONNABORTED') {
                    throw new Error('Timeout en la conexión con MODO');
                }
                
                if ('response' in error) {
                    const responseError = error as { response?: { data?: { message?: string } } };
                    const errorMessage = responseError.response?.data?.message || 'Error desconocido';
                    throw new Error(`Error al verificar estado del pago: ${errorMessage}`);
                }
            }
            throw new Error('Error inesperado al verificar estado del pago');
        }
    }

    private calculateExpirationTime(minutes: number = 30): string {
        try {
            const safeMinutes = Math.min(Math.max(1, minutes), 60); // Entre 1 y 60 minutos
            return new Date(Date.now() + safeMinutes * 60000).toISOString();
        } catch (error) {
            console.error('Error al calcular tiempo de expiración:', error);
            return new Date(Date.now() + 1800000).toISOString(); // fallback a 30 minutos
        }
    }

    private normalizePaymentStatus(status: string): ModoPaymentStatus['status'] {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'success':
                return 'completed';
            case 'expired':
            case 'timeout':
                return 'expired';
            case 'failed':
            case 'error':
                return 'failed';
            default:
                return 'pending';
        }
    }
}
