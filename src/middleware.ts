import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

// Add debug logging
function log(message: string, data?: any) {
  console.log(`[Middleware] ${message}`, data ? JSON.stringify(data, null, 2) : '')
}

function redirectToError(request: NextRequest, error: any) {
  const errorDetails = typeof error === 'string' ? error : error?.message || 'Unknown error';
  const url = new URL('/error', request.url);
  const response = NextResponse.redirect(url);
  
  // Set error details in a cookie that the error page can read
  response.cookies.set('error_details', errorDetails, {
    httpOnly: false,
    sameSite: 'strict',
    path: '/',
    maxAge: 30 // 30 seconds
  });
  
  return response;
}

const isAuthRoute = (path: string): boolean => {
  const authRoutes = ['/login', '/register', '/auth'];
  return authRoutes.some(route => path.startsWith(route));
};

const isProtectedRoute = (path: string): boolean => {
  const protectedRoutes = ['/dashboard', '/clients', '/settings'];
  return protectedRoutes.some(route => path.startsWith(route));
};

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req: request, res });
  const path = request.nextUrl.pathname;

  try {
    log('Starting middleware check');
    
    // Allow public routes first
    if (isPublicRoute(path)) {
      log('Public route access:', { path });
      return res;
    }

    // Renovar la sesión si existe
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError) {
      log('Session error:', sessionError);
      return redirectToError(request, 'Error de autenticación: ' + sessionError.message);
    }

    // Handle unauthenticated users
    if (!session) {
      log('No session, redirecting to login');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    log('User authenticated:', { 
      userId: session.user.id,
      email: session.user.email 
    });

    // Si es una ruta protegida y no hay sesión, redirigir a login
    if (isProtectedRoute(path) && !session) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.searchParams.set('redirectedFrom', path);
      return NextResponse.redirect(redirectUrl);
    }

    // Si es una ruta de auth y hay sesión, redirigir al dashboard
    if (isAuthRoute(path) && session) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      return NextResponse.redirect(redirectUrl);
    }

    // Rutas que requieren autenticación
    const protectedRoutes = ['/dashboard', '/clients', '/settings'];
    const isProtectedRouteCheck = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    );

    // Rutas de autenticación
    const authRoutes = ['/login', '/register', '/auth'];
    const isAuthRouteCheck = authRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    );

    // Si es una ruta protegida y no hay sesión, redirigir a login
    if (isProtectedRouteCheck && !session) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Si es una ruta de auth y hay sesión, redirigir al dashboard
    if (isAuthRouteCheck && session) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      return NextResponse.redirect(redirectUrl);
    }

    // Handle auth routes for authenticated users
    if (isAuthRoute(path)) {
      log('Auth route access by authenticated user, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Check client relation for protected routes
    if (requiresClient(path)) {
      log('Checking client relation for route:', { path, userId: session.user.id });
      
      try {
        // Get active client relation
        const { data: relation, error: relationError } = await supabase
          .from('user_client_relation')
          .select('id, client_id, status')
          .eq('user_id', session.user.id)
          .eq('status', 'ACTIVE')
          .single();

        log('Client relation query result:', {
          hasRelation: !!relation,
          userId: session.user.id,
          relationId: relation?.id,
          clientId: relation?.client_id,
          status: relation?.status,
          error: relationError
        });

        if (relationError) {
          if (relationError.code === 'PGRST116') {
            log('No active client relation found');
            return NextResponse.redirect(new URL('/onboarding', request.url));
          }
          log('Database error:', relationError);
          return redirectToError(request, `Error de base de datos: ${relationError.message}`);
        }

        if (!relation || relation.status !== 'ACTIVE') {
          log('No active client relation found or inactive status');
          return NextResponse.redirect(new URL('/onboarding', request.url));
        }

        // Add client information to request headers
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-client-id', relation.client_id.toString());

        // User has valid client relation, proceed with added headers
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });

      } catch (error) {
        log('Unexpected error in client relation check:', error);
        return redirectToError(request, 'Error inesperado al verificar la relación con el cliente');
      }
    }

    // Non-protected route, proceed
    return res;
  } catch (error) {
    log('Unexpected error in middleware:', error);
    return redirectToError(request, 'Error inesperado en el middleware');
  }
}

// Routes that require client verification
function requiresClient(pathname: string): boolean {
  const protectedPaths = [
    '/dashboard',
    '/profile',
    '/settings',
    '/operations',
    '/payments'
  ];
  return protectedPaths.some(path => pathname.startsWith(path));
}

// Public routes that don't require authentication
function isPublicRoute(pathname: string): boolean {
  const publicPaths = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/error' // Add error page to public routes
  ];
  return publicPaths.some(path => pathname === path);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
