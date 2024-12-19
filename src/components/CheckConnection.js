import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { authService } from '../lib/supabaseClient';
const CheckConnection = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
            }
            catch (err) {
                setError('Error al obtener el usuario: ' + err.message);
            }
            finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);
    if (loading)
        return _jsx("div", { children: "Cargando..." });
    if (error)
        return _jsx("div", { children: error });
    return (_jsx("div", { children: user ? (_jsxs("div", { children: ["Conexi\u00F3n exitosa. Usuario: ", user.email] })) : (_jsx("div", { children: "No hay usuario conectado." })) }));
};
export default CheckConnection;
