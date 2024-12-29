import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 via-blue-900 to-black">
      <div className="text-center px-4">
        <Image
          src="/images/image.svg"
          alt="ECUCONDOR Logo"
          width={80}
          height={80}
          className="mx-auto mb-6"
        />
        <h1 className="text-4xl font-bold text-white mb-4">404 - Página no encontrada</h1>
        <p className="text-gray-300 mb-8">Lo sentimos, la página que buscas no existe.</p>
        <Link 
          href="/" 
          className="inline-block bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
