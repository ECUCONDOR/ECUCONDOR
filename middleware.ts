import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { componentLoggers } from './src/lib/logger';
import { randomUUID } from 'crypto';

const { api: logger } = componentLoggers;

export async function middleware(request: NextRequest) {
  const requestStart = Date.now();
  const requestId = randomUUID();

  try {
    logger.info('Incoming request', {
      method: request.method,
      url: request.url,
      requestId,
      userAgent: request.headers.get('user-agent'),
    });

    const response = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res: response });

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      logger.warn('Failed to retrieve session', { error: sessionError, requestId });
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const session = sessionData?.session;

    const protectedRoutes = ['/dashboard', '/profile'];
    const isProtectedRoute = protectedRoutes.some(route =>
      request.nextUrl.pathname.startsWith(route),
    );

    if (isProtectedRoute && !session) {
      logger.warn('Unauthorized access attempt', {
        path: request.nextUrl.pathname,
        requestId,
      });
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (session && request.nextUrl.pathname.startsWith('/auth')) {
      logger.info('Redirecting authenticated user', {
        path: request.nextUrl.pathname,
        userId: session.user.id,
        requestId,
      });
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const duration = Date.now() - requestStart;
    logger.info('Request completed', {
      method: request.method,
      url: request.url,
      status: response.status,
      duration,
      requestId,
      userId: session?.user?.id,
    });

    response.headers.set('X-Request-ID', requestId);
    response.headers.set('X-Response-Time', `${duration}ms`);

    return response;
  } catch (error) {
    const duration = Date.now() - requestStart;
    logger.error('Request failed', {
      method: request.method,
      url: request.url,
      duration,
      requestId,
    }, error as Error);

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
