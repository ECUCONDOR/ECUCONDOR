'use client';

import { useEffect, useState } from 'react';

interface Bubble {
  id: number;
  left: string;
  size: number;
  delay: number;
}

export const ChampagneBubbles = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const bubblesArray = Array.from({ length: 30 }, (_, index) => ({
      id: index,
      left: `${Math.random() * 100}%`,
      size: Math.random() * (8 - 3) + 3,
      delay: Math.random() * 3
    }));
    setBubbles(bubblesArray);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute bottom-0 animate-bubble rounded-full bg-yellow-100/30"
          style={{
            left: bubble.left,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            animationDelay: `${bubble.delay}s`
          }}
        />
      ))}
    </div>
  );
};
