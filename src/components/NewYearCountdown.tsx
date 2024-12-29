'use client';

import React, { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const NewYearCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calculateTimeLeft = () => {
      const now = new Date();
      const newYear = new Date(now.getFullYear() + 1, 0, 1);
      const difference = newYear.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold text-yellow-400 mb-2">
        Cuenta regresiva para el 2025
      </h3>
      <div className="flex justify-center gap-4">
        <TimeUnit value={timeLeft.days} label="Días" />
        <TimeUnit value={timeLeft.hours} label="Horas" />
        <TimeUnit value={timeLeft.minutes} label="Minutos" />
        <TimeUnit value={timeLeft.seconds} label="Segundos" />
      </div>
      <p className="text-sm text-gray-400 mt-4">
        ¡Felices Fiestas de parte de ECUCONDOR!
      </p>
    </div>
  );
};

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 min-w-[80px]">
      <div className="text-2xl font-bold text-yellow-400">{value.toString().padStart(2, '0')}</div>
      <div className="text-sm text-white/60">{label}</div>
    </div>
  );
}

export default NewYearCountdown;
