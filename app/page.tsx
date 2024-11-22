'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, DollarSign, Shield, Clock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { FeatureCard as FeatureCardComponent } from './components/FeatureCard'

const BINANCE_API_URL = 'https://api.binance.com/api/v3/ticker/price?symbol=USDTARS'

export default function LandingPage() {
  const [exchangeRate, setExchangeRate] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(BINANCE_API_URL)
        if (!response.ok) throw new Error('Network response was not ok')
        const data = await response.json()
        setExchangeRate(parseFloat(data.price))
        setError(null)
      } catch (error) {
        console.error('Error fetching exchange rate:', error)
        setError('No se pudo obtener la cotización, por favor intente más tarde.')
      }
    }

    fetchExchangeRate()
    const interval = setInterval(fetchExchangeRate, 20000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001F3F] to-[#003366]">
      <header className="p-5 bg-[#00264D]/90 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-cyan-400 to-pink-500">
            Ecucondor
          </h1>
          <div className="space-x-4">
            <Link href="/register">
              <Button className="bg-gradient-to-r from-yellow-400 via-cyan-400 to-pink-500 hover:opacity-90 text-black font-bold">
                Registrarse
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <section className="text-center mb-20">
          <h2 className="text-5xl font-bold mb-6 text-white">
            Transferencias Internacionales
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-cyan-400 to-pink-500">
              Rápidas y Seguras
            </span>
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Conectamos Ecuador con el mundo a través de soluciones financieras innovadoras y confiables
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button className="bg-gradient-to-r from-yellow-400 via-cyan-400 to-pink-500 text-black font-bold px-8 py-6 text-lg rounded-full hover:opacity-90 transition-all">
                Comenzar Ahora <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-20">
          <FeatureCardComponent
            icon={DollarSign}
            title="Mejores Tasas"
            description={`Cotización actual: ${exchangeRate.toFixed(2)} ARS/USD`}
            iconColor="text-yellow-400"
          />
          <FeatureCardComponent
            icon={Shield}
            title="100% Seguro"
            description="Transacciones protegidas y verificadas"
            iconColor="text-cyan-400"
          />
          <FeatureCardComponent
            icon={Clock}
            title="Rápido"
            description="Transferencias procesadas en minutos"
            iconColor="text-pink-500"
          />
        </section>
        {error && <p className="text-red-500 text-center mb-6">{error}</p>}
      </main>

      <footer className="bg-[#00264D]/90 backdrop-blur-sm text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white/80">&copy; 2024 Ecucondor. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

// components/FeatureCard.js
import { Card, CardContent } from "@/components/ui/card"

export function FeatureCard({ icon: Icon, title, description, iconColor }) {
  return (
    <Card className="bg-[#00264D]/50 backdrop-blur-sm border-cyan-400/20">
      <CardContent className="p-6 text-center">
        <Icon className={`w-12 h-12 mx-auto mb-4 ${iconColor}`} />
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/80">{description}</p>
      </CardContent>
    </Card>
  )
} 
