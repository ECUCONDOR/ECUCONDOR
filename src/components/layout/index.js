import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
const Layout = ({ children }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/');
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-100", children: [_jsx("nav", { className: "bg-white shadow-lg", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between h-16", children: [_jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0 flex items-center", children: _jsx(Link, { to: "/", className: "text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-green-300", children: "ECUCONDOR" }) }), _jsxs("div", { className: "hidden sm:ml-6 sm:flex sm:space-x-8", children: [_jsx(Link, { to: "/exchange", className: "inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900", children: "Cambios" }), _jsx(Link, { to: "/negociaciones", className: "inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900", children: "Negociaciones" })] })] }), _jsx("div", { className: "flex items-center", children: _jsx("button", { onClick: handleLogout, className: "ml-4 px-4 py-2 text-sm text-red-600 hover:text-red-900", children: "Cerrar Sesi\u00F3n" }) })] }) }) }), _jsx("main", { className: "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8", children: children })] }));
};
export default Layout;
