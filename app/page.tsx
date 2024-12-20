'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, DollarSign, Shield, Clock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { signIn, signOut, useSession } from "next-auth/react"

const BINANCE_API_URL = 'https://api.binance.com/api/v3/ticker/price?symbol=USDTARS'

export default function LandingPage() {
  const [exchangeRate, setExchangeRate] = useState(0)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(BINANCE_API_URL)
        const data = await response.json()
        setExchangeRate(parseFloat(data.price))
      } catch (error) {
        console.error('Error fetching exchange rate:', error)
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
            {session ? (
              <Button onClick={() => signOut()} className="bg-red-500 hover:bg-red-600 text-white font-bold transition duration-300 ease-in-out transform hover:scale-105">
                Cerrar Sesión
              </Button>
            ) : (
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-lg shadow-xl">
                <CardContent className="flex flex-col space-y-4">
                  <Button onClick={() => signIn('google')} className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow transition duration-300 ease-in-out transform hover:scale-105">
                    <img src="https://www.google.com/favicon.ico" alt="Google logo" className="w-5 h-5 mr-2" />
                    Iniciar con Google
                  </Button>
                  <Button onClick={() => signIn('facebook')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 border border-blue-700 rounded shadow transition duration-300 ease-in-out transform hover:scale-105">
                    <img src="https://www.facebook.com/favicon.ico" alt="Facebook logo" className="w-5 h-5 mr-2" />
                    Iniciar con Facebook
                  </Button>
                </CardContent>
              </Card>
            )}
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
              <Button className="bg-gradient-to-r from-yellow-400 via-cyan-400 to-pink-500 text-black font-bold px-8 py-6 text-lg rounded-full hover:opacity-90 transition-all transform hover:scale-105 duration-300">
                Comenzar Ahora <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="bg-[#00264D]/50 backdrop-blur-sm border-cyan-400/20 transition-all duration-300 hover:shadow-lg hover:scale-105">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-xl font-bold text-white mb-2">Mejores Tasas</h3>
              <p className="text-white/80">Cotización actual: {exchangeRate.toFixed(2)} ARS/USD</p>
            </CardContent>
          </Card>
          <Card className="bg-[#00264D]/50 backdrop-blur-sm border-cyan-400/20 transition-all duration-300 hover:shadow-lg hover:scale-105">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
              <h3 className="text-xl font-bold text-white mb-2">100% Seguro</h3>
              <p className="text-white/80">Transacciones protegidas y verificadas</p>
            </CardContent>
          </Card>
          <Card className="bg-[#00264D]/50 backdrop-blur-sm border-cyan-400/20 transition-all duration-300 hover:shadow-lg hover:scale-105">
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-pink-500" />
              <h3 className="text-xl font-bold text-white mb-2">Rápido</h3>
              <p className="text-white/80">Transferencias procesadas en minutos</p>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="bg-[#00264D]/90 backdrop-blur-sm text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white/80">&copy; 2024 Ecucondor. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

