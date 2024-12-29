'use client';

import React, { useEffect, useRef } from 'react';

const NewYearFireworks = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Firework particle class
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      
      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 3 + 2;
        this.vx = Math.cos(angle) * velocity;
        this.vy = Math.sin(angle) * velocity;
        this.alpha = 1;
        this.color = color;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // gravity
        this.alpha -= 0.01;
        return this.alpha > 0;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Firework class
    class Firework {
      particles: Particle[];
      
      constructor(x: number, y: number) {
        this.particles = [];
        const colors = ['#ff0', '#f0f', '#0ff', '#0f0', '#ff5'];
        for (let i = 0; i < 50; i++) {
          this.particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)]));
        }
      }

      update() {
        this.particles = this.particles.filter(particle => particle.update());
        return this.particles.length > 0;
      }

      draw(ctx: CanvasRenderingContext2D) {
        this.particles.forEach(particle => particle.draw(ctx));
      }
    }

    const fireworks: Firework[] = [];
    let lastFireworkTime = 0;

    // Animation loop
    const animate = (timestamp: number) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create new firework
      if (timestamp - lastFireworkTime > 2000) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height / 2);
        fireworks.push(new Firework(x, y));
        lastFireworkTime = timestamp;
      }

      // Update and draw fireworks
      for (let i = fireworks.length - 1; i >= 0; i--) {
        if (!fireworks[i].update()) {
          fireworks.splice(i, 1);
        } else {
          fireworks[i].draw(ctx);
        }
      }

      requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default NewYearFireworks;
