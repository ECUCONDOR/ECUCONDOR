'use client'

import { useEffect, useRef } from 'react'

export default function RocketExplosionCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initThree = async () => {
      const THREE = await import('three')
      if (!containerRef.current) return

      // Scene setup
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000)
      containerRef.current.appendChild(renderer.domElement)

      // Particles
      const particleCount = 2000
      const particles = new THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)
      const colors = new Float32Array(particleCount * 3)
      const velocities: { x: number; y: number; z: number }[] = []

      for (let i = 0; i < particleCount * 3; i += 3) {
        // Initial positions (centered)
        positions[i] = (Math.random() - 0.5) * 0.5
        positions[i + 1] = (Math.random() - 0.5) * 0.5
        positions[i + 2] = (Math.random() - 0.5) * 0.5

        // Colors (orange to yellow)
        colors[i] = Math.random() * 0.5 + 0.5     // R
        colors[i + 1] = Math.random() * 0.3 + 0.2 // G
        colors[i + 2] = 0.1                       // B

        // Store velocities
        velocities.push({
          x: (Math.random() - 0.5) * 0.02,
          y: Math.random() * 0.02,
          z: (Math.random() - 0.5) * 0.02
        })
      }

      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      particles.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
      })

      const points = new THREE.Points(particles, material)
      scene.add(points)

      camera.position.z = 5

      // Animation
      function animate() {
        requestAnimationFrame(animate)

        const positions = particles.attributes.position.array as Float32Array
        const colors = particles.attributes.color.array as Float32Array

        for (let i = 0; i < particleCount * 3; i += 3) {
          const index = i / 3

          // Update positions
          positions[i] += velocities[index].x
          positions[i + 1] += velocities[index].y
          positions[i + 2] += velocities[index].z

          // Gravity effect
          velocities[index].y -= 0.0001

          // Color fade
          colors[i] *= 0.99     // R
          colors[i + 1] *= 0.99 // G
          colors[i + 2] *= 0.99 // B

          // Reset particles that go too far
          if (Math.abs(positions[i]) > 5 || 
              Math.abs(positions[i + 1]) > 5 || 
              Math.abs(positions[i + 2]) > 5) {
            positions[i] = (Math.random() - 0.5) * 0.5
            positions[i + 1] = (Math.random() - 0.5) * 0.5
            positions[i + 2] = (Math.random() - 0.5) * 0.5

            colors[i] = Math.random() * 0.5 + 0.5
            colors[i + 1] = Math.random() * 0.3 + 0.2
            colors[i + 2] = 0.1

            velocities[index] = {
              x: (Math.random() - 0.5) * 0.02,
              y: Math.random() * 0.02,
              z: (Math.random() - 0.5) * 0.02
            }
          }
        }

        particles.attributes.position.needsUpdate = true
        particles.attributes.color.needsUpdate = true

        renderer.render(scene, camera)
      }

      // Handle window resize
      function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }

      window.addEventListener('resize', handleResize)

      // Start animation
      animate()

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize)
        if (containerRef.current) {
          containerRef.current.removeChild(renderer.domElement)
        }
        renderer.dispose()
      }
    }

    initThree()
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
