'use client';

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { isPublicRoute } from '@/lib/utils/routes';

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading && !isPublicRoute(window.location.pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000B1F]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#000B1F]">
      <div className="relative z-10">
        <header className="bg-gray-800 text-white p-4">
          <nav className="container mx-auto flex justify-between items-center">
            <div>
              <Link href={user ? '/dashboard' : '/'} className="text-xl font-bold">
                ECUCONDOR S.A.S
              </Link>
            </div>
            <ul className="flex space-x-4">
              {user ? (
                <>
                  <li>
                    <Link href="/dashboard" className="hover:underline">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                    >
                      Cerrar sesión
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link href="/auth/login" className="hover:underline">
                    Iniciar sesión
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </header>
        <main className="container mx-auto p-4">{children}</main>
        <footer className="bg-gray-900 text-white p-4 text-center">
          <p> 2024 ECUCONDOR S.A.S. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
}