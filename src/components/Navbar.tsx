import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="relative z-10 container mx-auto px-4 py-6">
      <div className="flex justify-between items-center">
        <div 
          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-green-300 cursor-pointer"
          onClick={() => navigate('/')}
        >
          ECUCONDOR
        </div>
        <div className="flex space-x-8">
          <button 
            onClick={() => navigate('/')}
            className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-white to-green-300 hover:from-red-400 hover:to-green-400 transition-all"
          >
            Inicio
          </button>
          <button 
            className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-white to-red-300 hover:from-green-400 hover:to-red-400 transition-all"
          >
            Servicios
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-lg font-semibold bg-gradient-to-r from-red-600 to-green-600 px-6 py-2 rounded-full text-white hover:from-red-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
          >
            Conectar
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
