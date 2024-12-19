import React from 'react';

const FestiveLogo = () => (
  <div className="flex items-center select-none">
    <div className="relative">
      <span className="text-4xl font-extrabold bg-gradient-to-br from-red-500 via-green-500 to-red-500 text-transparent bg-clip-text animate-gradient">
        ECUCONDOR
      </span>
      {/* Christmas hat */}
      <div className="absolute -top-6 -left-2 transform -rotate-12">
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-t-full relative">
          <div className="absolute -top-2 right-0 w-4 h-4 bg-white rounded-full animate-twinkle" />
        </div>
      </div>
      {/* Decorative lights */}
      <div className="absolute -top-2 left-0 right-0 flex justify-around">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full animate-twinkle"
            style={{
              backgroundColor: ['#ff0000', '#00ff00', '#ffff00', '#ff0000', '#00ff00'][i],
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default FestiveLogo;
