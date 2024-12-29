import Image from 'next/image';

export default function CorporateSection() {
  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto mt-12 p-8 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative w-12 h-12">
          <Image
            src="/images/image.svg"
            alt="ECUCONDOR"
            width={48}
            height={48}
            className="rounded-full"
          />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white text-shadow">ECUCONDOR</h3>
          <p className="text-sm text-gray-300 text-shadow">
            Conectando Economías, Fomentando Crecimiento
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold text-[#FFD700] mb-4 text-shadow">
            Nuestros Valores
          </h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-gray-200">
              <span className="w-2 h-2 bg-[#FFD700] rounded-full"></span>
              <span className="text-shadow">Integridad y Transparencia</span>
            </li>
            <li className="flex items-center gap-2 text-gray-200">
              <span className="w-2 h-2 bg-[#FFD700] rounded-full"></span>
              <span className="text-shadow">Innovación Constante</span>
            </li>
            <li className="flex items-center gap-2 text-gray-200">
              <span className="w-2 h-2 bg-[#FFD700] rounded-full"></span>
              <span className="text-shadow">Compromiso con el Cliente</span>
            </li>
            <li className="flex items-center gap-2 text-gray-200">
              <span className="w-2 h-2 bg-[#FFD700] rounded-full"></span>
              <span className="text-shadow">Responsabilidad Social</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-[#FFD700] mb-4 text-shadow">
            Nuestra Misión
          </h4>
          <p className="text-gray-200 leading-relaxed text-shadow">
            Proveer servicios financieros accesibles y eficientes que conecten a las economías de Ecuador, Argentina y Brasil, promoviendo el crecimiento y la inclusión financiera en la región.
          </p>
        </div>
      </div>
    </div>
  );
}
