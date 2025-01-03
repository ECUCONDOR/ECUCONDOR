import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    const { searchParams } = new URL(request.url);
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    let query = supabase
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

    const currency = searchParams.get('currency');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    if (currency) query = query.eq('moneda', currency);
    if (type) query = query.eq('tipo', type);
    if (status) query = query.eq('estado', status);

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validación mejorada
    interface Validation {
      field: string;
      message: string;
      check: (value: any) => boolean;
    }

    const validations: Validation[] = [
      { field: 'moneda', message: 'Moneda inválida', check: (v: string) => ['USD', 'ARS', 'BRL', 'WLD'].includes(v) },
      { field: 'tipo', message: 'Tipo inválido', check: (v: string) => ['buy', 'sell'].includes(v) },
      { field: 'cantidad', message: 'Cantidad debe ser mayor a 0', check: (v: number) => v > 0 },
      { field: 'precio', message: 'Precio debe ser mayor a 0', check: (v: number) => v > 0 },
    ];

    for (const validation of validations) {
      const value = body[validation.field];
      if (!value || !validation.check(value)) {
        return NextResponse.json(
          { error: validation.message },
          { status: 400 }
        );
      }
    }

    // Validar los límites del usuario
    const { data: userLimits } = await supabase
      .from('user_limits')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (!userLimits?.verified) {
      return NextResponse.json(
        { error: 'Usuario no verificado' },
        { status: 403 }
      );
    }

    if (body.cantidad > userLimits.max_order_amount) {
      return NextResponse.json(
        { error: 'Cantidad excede el límite máximo permitido' },
        { status: 400 }
      );
    }

    // Crear la orden
    const { data, error } = await supabase
      .from('ordenes_p2p')
      .insert([
        {
          ...body,
          user_id: session.user.id,
          estado: 'abierta',
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al crear orden:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
