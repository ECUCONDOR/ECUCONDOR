import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNegociacion } from '@/hooks/useNegociacion';
import NegociacionForm from '@/components/NegociacionForm';
const getStatusColor = (estado) => {
    switch (estado) {
        case EstadosNegociacion.PENDIENTE:
            return 'bg-yellow-100 text-yellow-800';
        case EstadosNegociacion.EN_PROCESO:
            return 'bg-blue-100 text-blue-800';
        case EstadosNegociacion.VERIFICADO:
            return 'bg-green-100 text-green-800';
        case EstadosNegociacion.COMPLETADO:
            return 'bg-green-100 text-green-800';
        case EstadosNegociacion.FALLIDO:
            return 'bg-red-100 text-red-800';
        case EstadosNegociacion.EXPIRADO:
            return 'bg-gray-100 text-gray-800';
    }
};
const getStatusText = (estado) => {
    switch (estado) {
        case EstadosNegociacion.PENDIENTE:
            return 'Pendiente';
        case EstadosNegociacion.EN_PROCESO:
            return 'En Proceso';
        case EstadosNegociacion.VERIFICADO:
            return 'Verificado';
        case EstadosNegociacion.COMPLETADO:
            return 'Completado';
        case EstadosNegociacion.FALLIDO:
            return 'Fallido';
        case EstadosNegociacion.EXPIRADO:
            return 'Expirado';
    }
};
const NegociacionesPage = () => {
    const { listarNegociaciones, loading } = useNegociacion();
    const [negociaciones, setNegociaciones] = useState([]);
    useEffect(() => {
        const cargarNegociaciones = async () => {
            try {
                const data = await listarNegociaciones();
                setNegociaciones(data);
            }
            catch (error) {
                console.error('Error al cargar negociaciones:', error);
            }
        };
        cargarNegociaciones();
    }, [listarNegociaciones]);
    return (_jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { className: "bg-white p-6 rounded-lg shadow-lg", children: [_jsx("h2", { className: "text-2xl font-bold mb-6", children: "Nueva Negociaci\u00F3n" }), _jsx(NegociacionForm, {})] }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-lg", children: [_jsx("h2", { className: "text-2xl font-bold mb-6", children: "Mis Negociaciones" }), loading ? (_jsx("p", { children: "Cargando..." })) : (_jsxs("div", { className: "space-y-4", children: [negociaciones.map((negociacion) => (_jsxs("div", { className: "border rounded-lg p-4 hover:bg-gray-50 transition-colors", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsxs("span", { className: "font-medium", children: [negociacion.monedaOrigen, " \u2192 ", negociacion.monedaDestino] }), _jsx("span", { className: `px-2 py-1 rounded-lg text-sm ${getStatusColor(negociacion.estado)}`, children: getStatusText(negociacion.estado) })] }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsxs("p", { children: ["Monto: ", negociacion.montoOrigen, " ", negociacion.monedaOrigen] }), _jsxs("p", { children: ["Tasa: ", negociacion.tasaCambio] }), _jsxs("p", { children: ["Fecha: ", new Date(negociacion.fechaCreacion).toLocaleDateString()] })] })] }, negociacion.id))), negociaciones.length === 0 && (_jsx("p", { className: "text-gray-500 text-center", children: "No hay negociaciones" }))] }))] })] }) }));
};
export default NegociacionesPage;
