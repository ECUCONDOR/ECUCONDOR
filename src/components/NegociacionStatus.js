import { jsx as _jsx } from "react/jsx-runtime";
import { EstadosNegociacion } from '@/types/negociacion';
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
        default:
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
        default:
            return estado;
    }
};
const NegociacionStatus = ({ estado }) => {
    const colorClass = getStatusColor(estado);
    const statusText = getStatusText(estado);
    return (_jsx("span", { className: `px-3 py-1 rounded-full text-sm font-medium ${colorClass}`, children: statusText }));
};
export default NegociacionStatus;
