'use client';

import { useEffect, useState } from 'react';

interface Snowflake {
  id: number;
  left: string;
  size: number;
  delay: number;
  duration: number;
}

export const Snowflakes = () => {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const flakes = Array.from({ length: 50 }, (_, index) => ({
      id: index,
      left: `${Math.random() * 100}%`,
      size: Math.random() * (20 - 5) + 5,
      delay: Math.random() * 5,
      duration: Math.random() * (15 - 8) + 8
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute animate-fall text-white opacity-70"
          style={{
            left: flake.left,
            fontSize: `${flake.size}px`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
};
