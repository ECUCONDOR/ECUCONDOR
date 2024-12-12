import { useNavigate } from 'react-router-dom';

const ConnectButton = () => {
  const navigate = useNavigate();

  const handleConnect = () => {
    navigate('/login');
  };

  return (
    <button
      onClick={handleConnect}
      className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
    >
      Conectar
    </button>
  );
};

export default ConnectButton;
