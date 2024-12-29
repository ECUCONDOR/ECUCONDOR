import Image from 'next/image';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-black">
      <div className="text-center">
        <Image
          src="/images/image.svg"
          alt="ECUCONDOR Loading"
          width={60}
          height={60}
          className="mx-auto animate-pulse"
        />
        <p className="mt-4 text-white text-lg">Cargando...</p>
      </div>
    </div>
  );
}
