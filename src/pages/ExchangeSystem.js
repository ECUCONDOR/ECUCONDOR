import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
const ExchangeSystem = () => {
    const [amount, setAmount] = useState('');
    const [sourceCurrency, setSourceCurrency] = useState('USD');
    const [targetCurrency, setTargetCurrency] = useState('EUR');
    const [exchanges, setExchanges] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        fetchExchanges();
    }, []);
    const fetchExchanges = async () => {
        try {
            const response = await api.get('/exchanges');
            setExchanges(response.data);
        }
        catch (error) {
            toast.error('Error al cargar los cambios');
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/exchanges', {
                amount: parseFloat(amount),
                sourceCurrency,
                targetCurrency
            });
            toast.success('Cambio realizado con éxito');
            fetchExchanges();
            setAmount('');
        }
        catch (error) {
            toast.error('Error al realizar el cambio');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "container mx-auto px-4", children: [_jsx("h1", { className: "text-2xl font-bold mb-6", children: "Sistema de Cambios" }), _jsx("div", { className: "bg-white p-6 rounded-lg shadow-md mb-8", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Monto" }), _jsx("input", { type: "number", value: amount, onChange: (e) => setAmount(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm", required: true })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Moneda Origen" }), _jsxs("select", { value: sourceCurrency, onChange: (e) => setSourceCurrency(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm", children: [_jsx("option", { value: "USD", children: "USD" }), _jsx("option", { value: "EUR", children: "EUR" }), _jsx("option", { value: "GBP", children: "GBP" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Moneda Destino" }), _jsxs("select", { value: targetCurrency, onChange: (e) => setTargetCurrency(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm", children: [_jsx("option", { value: "EUR", children: "EUR" }), _jsx("option", { value: "USD", children: "USD" }), _jsx("option", { value: "GBP", children: "GBP" })] })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500", children: loading ? 'Procesando...' : 'Realizar Cambio' })] }) }), _jsxs("div", { className: "bg-white rounded-lg shadow-md", children: [_jsx("div", { className: "px-4 py-5 sm:px-6", children: _jsx("h3", { className: "text-lg font-medium leading-6 text-gray-900", children: "Historial de Cambios" }) }), _jsx("div", { className: "border-t border-gray-200", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Fecha" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Monto" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "De" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "A" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Tasa" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Estado" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: exchanges.map((exchange) => (_jsxs("tr", { children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: new Date(exchange.createdAt).toLocaleDateString() }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: exchange.amount.toFixed(2) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: exchange.sourceCurrency }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: exchange.targetCurrency }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: exchange.rate.toFixed(4) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${exchange.status === 'completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'}`, children: exchange.status }) })] }, exchange.id))) })] }) }) })] })] }));
};
export default ExchangeSystem;
