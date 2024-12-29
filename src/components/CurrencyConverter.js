import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { binanceService } from '../services/binanceService';
const CurrencyConverter = () => {
    const [amount, setAmount] = useState(0);
    const [fromCurrency, setFromCurrency] = useState('USDT');
    const [toCurrency, setToCurrency] = useState('ARS');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [rates, setRates] = useState({});
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        fetchRates();
        const interval = setInterval(fetchRates, 30000); // Actualizar cada 30 segundos
        return () => clearInterval(interval);
    }, []);
    const fetchRates = async () => {
        try {
            const newRates = await binanceService.getMultipleRates();
            setRates(newRates);
        }
        catch (err) {
            setError('Error al obtener las tasas de cambio');
        }
    };
    const handleConvert = async () => {
        setError(null);
        setLoading(true);
        try {
            let convertedAmount;
            const pair = `${fromCurrency}${toCurrency}`;
            if (rates[pair]) {
                convertedAmount = amount * rates[pair];
            }
            else {
                // Si no existe la conversión directa, usar USDT como intermediario
                const fromRate = rates[`${fromCurrency}USDT`] || 1 / rates[`USDT${fromCurrency}`];
                const toRate = rates[`USDT${toCurrency}`];
                convertedAmount = amount * fromRate * toRate;
            }
            setResult(convertedAmount);
        }
        catch (err) {
            setError('Error en la conversión');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "p-6 border border-gold rounded-lg bg-black bg-opacity-30", children: [_jsx("h2", { className: "text-3xl font-bold mb-6 text-gold", children: "Convertir Divisas" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Cantidad" }), _jsx("input", { type: "number", value: amount, onChange: (e) => setAmount(Number(e.target.value)), className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold", placeholder: "Ingrese el monto" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "De" }), _jsxs("select", { value: fromCurrency, onChange: (e) => setFromCurrency(e.target.value), className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold", children: [_jsx("option", { value: "USDT", children: "USDT" }), _jsx("option", { value: "ARS", children: "ARS" }), _jsx("option", { value: "BRL", children: "BRL" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "A" }), _jsxs("select", { value: toCurrency, onChange: (e) => setToCurrency(e.target.value), className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold", children: [_jsx("option", { value: "ARS", children: "ARS" }), _jsx("option", { value: "BRL", children: "BRL" }), _jsx("option", { value: "USDT", children: "USDT" })] })] })] }), _jsx("button", { onClick: handleConvert, disabled: loading, className: "w-full bg-gold hover:bg-gold-dark text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out", children: loading ? 'Convirtiendo...' : 'Convertir' }), result !== null && (_jsxs("div", { className: "mt-4 p-4 bg-white bg-opacity-10 rounded-lg", children: [_jsx("h3", { className: "text-xl font-semibold", children: "Resultado:" }), _jsxs("p", { className: "text-2xl text-gold", children: [result.toFixed(2), " ", toCurrency] }), _jsxs("p", { className: "text-sm text-gray-400", children: ["Tasa: 1 ", fromCurrency, " = ", (result / amount).toFixed(4), " ", toCurrency] })] })), error && (_jsx("div", { className: "mt-4 p-4 bg-red-500 bg-opacity-10 text-red-500 rounded-lg", children: error }))] })] }));
};
export default CurrencyConverter;
