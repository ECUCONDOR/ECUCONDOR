'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";

// Configuración de la fuente Inter
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Componente interno que maneja la lógica de autenticación
function LayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <header className="bg-gray-800 text-white p-4">
          <nav className="container mx-auto flex justify-between items-center">
            <div>
              <a href="/" className="text-xl font-bold">ECUCONDOR S.A.S</a>
            </div>
            <ul className="flex space-x-4">
              {user ? (
                <>
                  <li>
                    <a href="/dashboard" className="hover:underline">Dashboard</a>
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
                  <a href="/login" className="hover:underline">Iniciar sesión</a>
                </li>
              )}
            </ul>
          </nav>
        </header>
        <main className="container mx-auto p-4">{children}</main>
        <footer className="bg-gray-900 text-white p-4 text-center">
          <p>© 2024 ECUCONDOR S.A.S. Todos los derechos reservados.</p>
        </footer>
      </body>
    </html>
  );
}

// Componente principal que provee el contexto de autenticación
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}