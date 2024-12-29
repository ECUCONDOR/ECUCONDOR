'use client';

const AnimatedBackground = () => {
  return (
    <>
      {/* Fondo animado */}
      <div className="stars-background">
        <div className="stars"></div>
      </div>

      {/* Burbujas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="bubbles">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="bubble"
              style={{
                left: `${10 + (i * 10)}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${8 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default AnimatedBackground;
