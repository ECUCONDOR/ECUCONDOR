import { jsx as _jsx } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
const ConnectButton = () => {
    const navigate = useNavigate();
    const handleConnect = () => {
        navigate('/login');
    };
    return (_jsx("button", { onClick: handleConnect, className: "bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200", children: "Conectar" }));
};
export default ConnectButton;
