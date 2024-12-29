import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNegociacion } from '@/hooks/useNegociacion';
const NegociacionForm = () => {
    const { crearNegociacion, loading } = useNegociacion();
    const [formData, setFormData] = useState({
        montoOrigen: 0,
        monedaOrigen: 'USD',
        monedaDestino: 'ARS',
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await crearNegociacion(formData);
        }
        catch (error) {
            console.error('Error al crear negociación:', error);
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'montoOrigen' ? parseFloat(value) : value
        }));
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "montoOrigen", className: "block text-sm font-medium text-gray-700", children: "Monto" }), _jsx("input", { type: "number", name: "montoOrigen", id: "montoOrigen", value: formData.montoOrigen, onChange: handleChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm", required: true, min: "0", step: "0.01" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "monedaOrigen", className: "block text-sm font-medium text-gray-700", children: "Moneda Origen" }), _jsxs("select", { name: "monedaOrigen", id: "monedaOrigen", value: formData.monedaOrigen, onChange: handleChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm", children: [_jsx("option", { value: "USD", children: "USD" }), _jsx("option", { value: "ARS", children: "ARS" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "monedaDestino", className: "block text-sm font-medium text-gray-700", children: "Moneda Destino" }), _jsxs("select", { name: "monedaDestino", id: "monedaDestino", value: formData.monedaDestino, onChange: handleChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm", children: [_jsx("option", { value: "ARS", children: "ARS" }), _jsx("option", { value: "USD", children: "USD" })] })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500", children: loading ? 'Procesando...' : 'Crear Negociación' })] }));
};
export default NegociacionForm;
