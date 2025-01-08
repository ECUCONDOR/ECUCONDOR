import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
const LoadingContext = createContext(undefined);
export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const showLoading = useCallback(() => {
        setIsLoading(true);
    }, []);
    const hideLoading = useCallback(() => {
        setIsLoading(false);
        setMessage('');
    }, []);
    const setLoadingMessage = useCallback((newMessage) => {
        setMessage(newMessage);
    }, []);
    return (_jsxs(LoadingContext.Provider, { value: { showLoading, hideLoading, setLoadingMessage }, children: [children, isLoading && (_jsxs("div", { className: "fixed inset-0 bg-gray-900 bg-opacity-50 flex flex-col items-center justify-center z-50", children: [_jsx(LoadingSpinner, { size: "large", color: "white" }), message && (_jsx("p", { className: "mt-4 text-white text-lg", children: message }))] }))] }));
};
export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};
