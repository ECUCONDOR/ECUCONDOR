'use client'

import { useEffect, useRef } from 'react'

export default function RocketExplosion() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Verificaciones iniciales
    if (typeof window === 'undefined' || !canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    // Si no hay contexto, salimos temprano
    if (!context) return

    // Función para ajustar el tamaño del canvas
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    setCanvasSize()
    window.addEventListener('resize', setCanvasSize)

    // Clase Particle para manejar cada partícula individual
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
        this.vy += 0.02
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

    // Sistema de partículas y animación
    const particles: Particle[] = []
    const maxParticles = 300

    // La función createAnimationLoop asegura que context está disponible
    const createAnimationLoop = (ctx: CanvasRenderingContext2D) => {
      return function animate() {
        // Aplicamos el efecto de desvanecimiento
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Generamos nuevas partículas
        if (particles.length < maxParticles) {
          for (let i = 0; i < 5; i++) {
            particles.push(new Particle())
          }
        }

        // Actualizamos y dibujamos las partículas
        for (let i = particles.length - 1; i >= 0; i--) {
          const particle = particles[i]
          particle.update()
          particle.draw(ctx)

          // Eliminamos partículas desvanecidas
          if (particle.alpha < 0.01) {
            particles.splice(i, 1)
          }
        }

        requestAnimationFrame(animate)
      }
    }

    // Iniciamos la animación con el contexto verificado
    const animationLoop = createAnimationLoop(context)
    animationLoop()

    // Limpieza al desmontar el componente
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