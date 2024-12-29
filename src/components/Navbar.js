import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
const Navbar = () => {
    const navigate = useNavigate();
    return (_jsx("nav", { className: "relative z-10 container mx-auto px-4 py-6", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("div", { className: "text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-green-300 cursor-pointer", onClick: () => navigate('/'), children: "ECUCONDOR" }), _jsxs("div", { className: "flex space-x-8", children: [_jsx("button", { onClick: () => navigate('/'), className: "text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-white to-green-300 hover:from-red-400 hover:to-green-400 transition-all", children: "Inicio" }), _jsx("button", { className: "text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-white to-red-300 hover:from-green-400 hover:to-red-400 transition-all", children: "Servicios" }), _jsx("button", { onClick: () => navigate('/login'), className: "text-lg font-semibold bg-gradient-to-r from-red-600 to-green-600 px-6 py-2 rounded-full text-white hover:from-red-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl", children: "Conectar" })] })] }) }));
};
export default Navbar;
