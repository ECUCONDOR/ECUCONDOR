import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNotification } from '../context/NotificationContext';
const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { addNotification } = useNotification();
    useEffect(() => {
        fetchNotifications();
        // Polling cada 30 segundos
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);
    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data);
            setUnreadCount(response.data.filter((n) => !n.read).length);
        }
        catch (error) {
            console.error('Error al obtener notificaciones:', error);
        }
    };
    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        catch (error) {
            addNotification('error', 'Error al marcar la notificación como leída');
        }
    };
    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        }
        catch (error) {
            addNotification('error', 'Error al marcar las notificaciones como leídas');
        }
    };
    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n.id !== id));
            if (!notifications.find(n => n.id === id)?.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        }
        catch (error) {
            addNotification('error', 'Error al eliminar la notificación');
        }
    };
    return (_jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setShowDropdown(!showDropdown), className: "relative p-2 text-gray-600 hover:text-gray-900", children: [_jsx("svg", { className: "h-6 w-6", fill: "none", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" }) }), unreadCount > 0 && (_jsx("span", { className: "absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full", children: unreadCount }))] }), showDropdown && (_jsxs("div", { className: "absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50", children: [_jsxs("div", { className: "px-4 py-2 border-b flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Notificaciones" }), unreadCount > 0 && (_jsx("button", { onClick: markAllAsRead, className: "text-sm text-blue-600 hover:text-blue-800", children: "Marcar todas como le\u00EDdas" }))] }), _jsx("div", { className: "max-h-96 overflow-y-auto", children: notifications.length === 0 ? (_jsx("p", { className: "px-4 py-2 text-gray-500", children: "No hay notificaciones" })) : (notifications.map(notification => (_jsx("div", { className: `px-4 py-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`, children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm text-gray-900", children: notification.message }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: new Date(notification.createdAt).toLocaleString() })] }), _jsxs("div", { className: "ml-4 flex-shrink-0 flex", children: [!notification.read && (_jsx("button", { onClick: () => markAsRead(notification.id), className: "text-blue-600 hover:text-blue-800 text-sm", children: "Marcar como le\u00EDda" })), _jsx("button", { onClick: () => deleteNotification(notification.id), className: "ml-2 text-red-600 hover:text-red-800 text-sm", children: "Eliminar" })] })] }) }, notification.id)))) })] }))] }));
};
export default NotificationBell;
