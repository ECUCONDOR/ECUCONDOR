import { create } from 'zustand';
import type { Database } from '@/types/supabase';
import { 
  OrderTypeEnum,
  Currency,
  OrderStatusEnum,
  CreateOrderDTO,
  P2POrder,
  UserLimits
} from '@/types/p2p';
import { validateOrder } from '@/utils/validation';
import { handleServiceError, P2PServiceError, P2PErrorCodes } from '@/utils/errors';
import { supabase } from '@/lib/supabase';

interface P2PState {
  orders: P2POrder[];
  activeOrder: P2POrder | null;
  loading: boolean;
  error: string | null;
  userLimits: UserLimits | null;
  setOrders: (orders: P2POrder[]) => void;
  setActiveOrder: (order: P2POrder | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUserLimits: (limits: UserLimits | null) => void;
}

export const useP2PStore = create<P2PState>((set) => ({
  orders: [],
  activeOrder: null,
  loading: false,
  error: null,
  userLimits: null,
  setOrders: (orders) => set({ orders }),
  setActiveOrder: (order) => set({ activeOrder: order }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setUserLimits: (limits) => set({ userLimits: limits }),
}));

class P2PService {
  private supabase;

  constructor() {
    this.supabase = supabase;
  }

  async getOrders(filters?: {
    currency?: Currency;
    type?: OrderTypeEnum;
    status?: OrderStatusEnum;
  }) {
    try {
      let query = this.supabase
        .from('ordenes_p2p')
        .select(`
          *,
          usuario:user_id (
            id,
            email,
            metadata->nombre,
            metadata->apellido
          )
        `);

      if (filters?.currency) query = query.eq('moneda', filters.currency);
      if (filters?.type) query = query.eq('tipo', filters.type);
      if (filters?.status) query = query.eq('estado', filters.status);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async createOrder(orderData: CreateOrderDTO) {
    try {
      const { data: session } = await this.supabase.auth.getSession();
      const user = session?.session?.user;
      if (!user) {
        throw new P2PServiceError('UNAUTHORIZED', 'No estás autorizado para crear órdenes');
      }

      if (!user.user_metadata?.emailVerified) {
        throw new P2PServiceError('UNAUTHORIZED', 'Necesitas verificar tu cuenta para crear órdenes');
      }

      // Validate order data
      const validatedData = validateOrder(orderData);

      // Get user limits
      const userLimits = await this.getUserLimits(user.id);
      if (!userLimits) {
        throw new P2PServiceError('NOT_FOUND', 'No se encontraron límites para el usuario');
      }

      // Check amount limits
      if (validatedData.amount > userLimits.max_order_amount) {
        throw new P2PServiceError('LIMIT_EXCEEDED', `El monto excede tu límite máximo de ${userLimits.max_order_amount}`);
      }

      const { data, error } = await this.supabase
        .from('ordenes_p2p')
        .insert([
          {
            user_id: user.id,
            moneda: validatedData.currency,
            tipo: validatedData.type,
            cantidad: validatedData.amount,
            precio: validatedData.price,
            metodo_pago: validatedData.payment_method,
            estado: 'open',
            bank_info: validatedData.bank_info,
            country: validatedData.country,
            min_amount: validatedData.min_amount,
            max_amount: validatedData.max_amount
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw handleServiceError(error);
    }
  }

  async getUserLimits(userId: string): Promise<UserLimits> {
    try {
      const { data, error } = await this.supabase
        .from('user_limits')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) {
        throw new P2PServiceError(
          'NOT_FOUND', 'No se encontraron límites para el usuario'
        );
      }

      return data;
    } catch (error) {
      throw handleServiceError(error);
    }
  }
}

export const p2pService = new P2PService();
