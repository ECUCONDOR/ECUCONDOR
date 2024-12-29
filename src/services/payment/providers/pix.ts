import axios from 'axios';

// Constantes para configuración
const PIX_CONFIG = {
    TIMEOUT_MS: 8000,
    MAX_RETRIES: 3,
    ERROR_MESSAGES: {
        NO_DATA: 'No se recibieron datos en la respuesta PIX',
        INVALID_QR: 'QR code inválido o faltante',
        INVALID_COPY: 'Copia e cola inválido o faltante',
        INVALID_TXID: 'TXID inválido o faltante',
        INVALID_STATUS: 'Estado de pago inválido o faltante'
    }
} as const;

// Interfaces para las respuestas de la API
interface PixQRResponse {
    qr_code: string;
    copiaecola: string;
    txid: string;
}

interface PixStatusResponse {
    status: string;
    txid: string;
    payment_date?: string;
}

// Interfaces para nuestros resultados
interface PixQRResult {
    qr_data: string;
    copy_paste: string;
    transaction_id: string;
    expiration_time: string;
}

interface PixPaymentStatus {
    status: 'pending' | 'completed' | 'expired' | 'failed';
    transaction_id: string;
    payment_date?: string;
}

export class PixProvider {
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly timeout: number;

    constructor() {
        const apiKey = process.env.PIX_API_KEY;
        const baseUrl = process.env.PIX_API_URL;

        if (!apiKey?.trim()) {
            throw new Error('PIX_API_KEY no está configurado en las variables de entorno');
        }
        if (!baseUrl?.trim()) {
            throw new Error('PIX_API_URL no está configurado en las variables de entorno');
        }

        this.apiKey = apiKey.trim();
        this.baseUrl = baseUrl.trim();
        this.timeout = PIX_CONFIG.TIMEOUT_MS;
    }

    private isQRResponse(data: unknown): data is PixQRResponse {
        if (!data || typeof data !== 'object') {
            return false;
        }

        const response = data as Record<string, unknown>;
        const isValid = (
            typeof response.qr_code === 'string' && 
            typeof response.copiaecola === 'string' && 
            typeof response.txid === 'string'
        );

        if (!isValid) {
            console.warn('Respuesta QR de PIX inválida:', response);
        }

        return isValid;
    }

    private isStatusResponse(data: unknown): data is PixStatusResponse {
        if (!data || typeof data !== 'object') {
            return false;
        }

        const response = data as Record<string, unknown>;
        const isValid = (
            typeof response.status === 'string' &&
            typeof response.txid === 'string'
        );

        if (!isValid) {
            console.warn('Respuesta de estado PIX inválida:', response);
            return false;
        }

        if ('payment_date' in response && typeof response.payment_date !== 'string') {
            console.warn('payment_date inválido en respuesta PIX:', response);
            return false;
        }

        return true;
    }

    async createQR(amount: number, description: string): Promise<PixQRResult> {
        if (!amount || amount <= 0) {
            throw new Error('El monto debe ser mayor a 0');
        }
        if (!description?.trim()) {
            throw new Error('La descripción es requerida');
        }

        try {
            const response = await axios({
                method: 'POST',
                url: `${this.baseUrl}/pix/generate`,
                data: {
                    amount,
                    description: description.trim()
                },
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: this.timeout
            });

            if (!response.data) {
                throw new Error(PIX_CONFIG.ERROR_MESSAGES.NO_DATA);
            }

            if (!this.isQRResponse(response.data)) {
                throw new Error('Respuesta inválida del servidor PIX');
            }

            return {
                qr_data: response.data.qr_code,
                copy_paste: response.data.copiaecola,
                transaction_id: response.data.txid,
                expiration_time: this.calculateExpirationTime(30)
            };
        } catch (error: unknown) {
            if (error && typeof error === 'object') {
                if ('code' in error && error.code === 'ECONNABORTED') {
                    throw new Error('Timeout en la conexión con PIX');
                }
                
                if ('response' in error) {
                    const responseError = error as { response?: { data?: { message?: string } } };
                    const errorMessage = responseError.response?.data?.message || 'Error desconocido';
                    throw new Error(`Error de PIX: ${errorMessage}`);
                }
            }
            throw new Error('Error inesperado al generar QR PIX');
        }
    }

    async checkPaymentStatus(txid: string): Promise<PixPaymentStatus> {
        if (!txid?.trim()) {
            throw new Error('El ID de transacción es requerido');
        }

        try {
            const response = await axios({
                method: 'GET',
                url: `${this.baseUrl}/pix/${txid.trim()}/status`,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: this.timeout
            });

            if (!response.data) {
                throw new Error(PIX_CONFIG.ERROR_MESSAGES.NO_DATA);
            }

            if (!this.isStatusResponse(response.data)) {
                throw new Error(PIX_CONFIG.ERROR_MESSAGES.INVALID_STATUS);
            }

            return {
                status: this.normalizePaymentStatus(response.data.status),
                transaction_id: response.data.txid,
                payment_date: response.data.payment_date
            };
        } catch (error: unknown) {
            if (error && typeof error === 'object') {
                if ('code' in error && error.code === 'ECONNABORTED') {
                    throw new Error('Timeout en la conexión con PIX');
                }
                
                if ('response' in error) {
                    const responseError = error as { response?: { data?: { message?: string } } };
                    const errorMessage = responseError.response?.data?.message || 'Error desconocido';
                    throw new Error(`Error al verificar estado del pago: ${errorMessage}`);
                }
            }
            throw new Error('Error inesperado al verificar estado del pago PIX');
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

    private normalizePaymentStatus(status: string): PixPaymentStatus['status'] {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'success':
            case 'approved':
                return 'completed';
            case 'expired':
            case 'timeout':
                return 'expired';
            case 'failed':
            case 'error':
            case 'rejected':
                return 'failed';
            default:
                return 'pending';
        }
    }
}
