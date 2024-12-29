import FormularioRegistroBancario from '@/components/FormularioRegistroBancario';

export default function RegistroBancarioPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-[#8B4513]">Registro Bancario</h1>
          <p className="mt-2 text-gray-600">Complete el formulario con sus datos bancarios</p>
        </div>
        <FormularioRegistroBancario />
      </div>
    </div>
  );
}
