'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Hourglass } from 'lucide-react'
import { CountdownTimer } from '@/components/registration/CountdownTimer'

const inspirationalPhrases = [
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "El único modo de hacer un gran trabajo es amar lo que haces.",
  "Nunca es tarde para ser lo que podrías haber sido.",
  "El futuro pertenece a quienes creen en la belleza de sus sueños.",
  "La paciencia es amarga, pero su fruto es dulce.",
]

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
          ¡Gracias por tu registro!
        </h1>
        
        <div className="bg-black/40 backdrop-blur-sm p-8 rounded-lg border border-amber-500/20">
          <div className="mb-8 flex justify-center">
            <Hourglass className="w-16 h-16 text-amber-500 animate-spin" />
          </div>

          <CountdownTimer />
          
          <p className="text-xl text-white/80 my-8">
            Tu registro ha sido recibido. Nos pondremos en contacto contigo pronto.
          </p>
          
          <Link href="/">
            <Button className="bg-gradient-to-r from-amber-500 to-amber-700 text-black font-bold px-6 py-2 rounded-full hover:opacity-90 transition-all">
              <ArrowLeft className="mr-2" /> Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}