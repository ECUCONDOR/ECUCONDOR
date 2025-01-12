export const publicRoutes = [
  '/',
  '/cambio-divisas',
  '/auth/login',
  '/auth/register',
  '/terms'
];

export const authRoutes = [
  '/auth/login',
  '/auth/register',
] as const;

export const apiAuthPrefix = '/api/auth';

export const DEFAULT_LOGIN_REDIRECT = '/dashboard';

export function isPublicRoute(route: string) {
  return publicRoutes.some(
    (publicRoute) => route === publicRoute || route.startsWith(`${publicRoute}/`)
  );
}

export function isAuthRoute(route: string) {
  return authRoutes.some(
    (authRoute) => route === authRoute || route.startsWith(`${authRoute}/`)
  );
}
