import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { authService } from '../../api/auth';
const Navbar = () => {
    const isAuthenticated = authService.isAuthenticated();
    return (_jsx("nav", { className: "bg-white shadow-lg", children: _jsx("div", { className: "max-w-7xl mx-auto px-4", children: _jsxs("div", { className: "flex justify-between h-16", children: [_jsx("div", { className: "flex", children: _jsx(Link, { to: "/", className: "flex items-center", children: _jsx("span", { className: "text-xl font-bold", children: "Mi App" }) }) }), _jsx("div", { className: "flex items-center", children: isAuthenticated ? (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/profile", className: "px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900", children: "Perfil" }), _jsx("button", { onClick: () => authService.logout(), className: "ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700", children: "Cerrar Sesi\u00F3n" })] })) : (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/login", className: "px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900", children: "Iniciar Sesi\u00F3n" }), _jsx(Link, { to: "/register", className: "ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700", children: "Registrarse" })] })) })] }) }) }));
};
export default Navbar;
