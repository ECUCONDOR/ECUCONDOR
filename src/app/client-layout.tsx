'use client';

import { Inter } from "next/font/google";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from 'next/link';  // Añadimos la importación de Link

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      router.push("/login");
    } else {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className={`${inter.variable} antialiased`}>
      <header className="bg-gray-800 text-white p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <div>
            {/* Reemplazamos el anchor tag por Link */}
            <Link href="/" className="text-xl font-bold">
              ECUCONDOR S.A.S
            </Link>
          </div>
          <ul className="flex space-x-4">
            {user ? (
              <>
                <li>
                  {/* Reemplazamos el anchor tag por Link */}
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
                {/* Reemplazamos el anchor tag por Link */}
                <Link href="/login" className="hover:underline">
                  Iniciar sesión
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </header>
      <main className="container mx-auto p-4">{children}</main>
      <footer className="bg-gray-900 text-white p-4 text-center">
        <p>© 2024 ECUCONDOR S.A.S. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}