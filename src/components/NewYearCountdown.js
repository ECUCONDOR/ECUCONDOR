import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const NewYearCountdown = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const nextYear = new Date(now.getFullYear() + 1, 0, 1);
            const difference = nextYear.getTime() - now.getTime();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        };
        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft();
        return () => clearInterval(timer);
    }, []);
    return (_jsx("div", { className: "countdown-container flex justify-center space-x-4", children: Object.entries(timeLeft).map(([unit, value]) => (_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "countdown-number", children: value.toString().padStart(2, '0') }), _jsx("div", { className: "countdown-label", children: unit })] }, unit))) }));
};
export default NewYearCountdown;
