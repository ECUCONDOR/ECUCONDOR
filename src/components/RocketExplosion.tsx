'use client'

import { useEffect, useRef } from 'react'

export default function RocketExplosion() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()
    window.addEventListener('resize', setCanvasSize)

    // Particle class
    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      alpha: number
      color: string

      constructor() {
        this.x = window.innerWidth / 2
        this.y = window.innerHeight / 2
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 2 + 1
        this.vx = Math.cos(angle) * speed
        this.vy = Math.sin(angle) * speed - Math.random() * 0.5
        this.alpha = 1
        this.color = `hsl(${Math.random() * 30 + 15}, 100%, 50%)`
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.vy += 0.02 // gravity
        this.alpha *= 0.99
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    // Particle system
    const particles: Particle[] = []
    const maxParticles = 300

    // Animation loop
    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add new particles
      if (particles.length < maxParticles) {
        for (let i = 0; i < 5; i++) {
          particles.push(new Particle())
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i]
        particle.update()
        particle.draw(ctx)

        // Remove faded particles
        if (particle.alpha < 0.01) {
          particles.splice(i, 1)
        }
      }

      requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasSize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ background: 'black' }}
    />
  )
}
