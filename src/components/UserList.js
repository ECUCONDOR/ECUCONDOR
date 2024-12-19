import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
export const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        loadUsers();
    }, []);
    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getUsers();
            setUsers(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
        finally {
            setLoading(false);
        }
    };
    if (loading)
        return _jsx("div", { children: "Loading users..." });
    if (error)
        return _jsxs("div", { children: ["Error: ", error] });
    return (_jsxs("div", { className: "p-4", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Users" }), _jsx("div", { className: "grid gap-4", children: users.map((user) => (_jsxs("div", { className: "p-4 border border-gold rounded-lg", children: [_jsx("h3", { className: "font-bold", children: user.name }), _jsx("p", { children: user.email }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Joined: ", new Date(user.created_at).toLocaleDateString()] })] }, user.id))) })] }));
};
