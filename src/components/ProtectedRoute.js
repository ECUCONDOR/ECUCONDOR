import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" }) }));
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login" });
    }
    return _jsx(_Fragment, { children: children });
};
export default ProtectedRoute;
