'use client'

import { useState } from 'react'
import { TransaccionExtendida } from '@/types/payments.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Share2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

interface TransactionReceiptProps {
  transaction: TransaccionExtendida
  onError?: (error: Error) => void
}

export default function TransactionReceipt({ 
  transaction, 
  onError 
}: TransactionReceiptProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = (error: unknown) => {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Ha ocurrido un error inesperado'
    setError(errorMessage)
    onError?.(error instanceof Error ? error : new Error(errorMessage))
  }

  const downloadReceipt = async () => {
    if (!transaction.detalles?.comprobante_url) {
      handleError(new Error('URL del comprobante no disponible'))
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      window.open(transaction.detalles.comprobante_url, '_blank')
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const shareReceipt = async () => {
    if (!navigator.share) {
      handleError(new Error('Compartir no está disponible en este dispositivo'))
      return
    }

    if (!transaction.detalles?.comprobante_url) {
      handleError(new Error('URL del comprobante no disponible'))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await navigator.share({
        title: 'Comprobante de transacción',
        text: `Comprobante de ${transaction.tipo.toLowerCase()} por $${transaction.monto}`,
        url: transaction.detalles.comprobante_url
      })
    } catch (error) {
      // Ignoramos errores de cancelación del usuario
      if (error instanceof Error && error.name !== 'AbortError') {
        handleError(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Comprobante de Transacción</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="border-t border-b py-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha:</span>
            {isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <span className="font-medium">
                {format(new Date(transaction.created_at), 'PPP', { locale: es })}
              </span>
            )}
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo:</span>
            {isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <span className="font-medium">{transaction.tipo}</span>
            )}
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monto:</span>
            {isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <span className="font-medium">${transaction.monto.toFixed(2)}</span>
            )}
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estado:</span>
            {isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <span className={`font-medium ${
                transaction.estado === 'COMPLETADA' ? 'text-green-600' : 
                transaction.estado === 'PENDIENTE' ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {transaction.estado}
              </span>
            )}
          </div>
          {transaction.detalles?.referencia && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Referencia:</span>
              <span className="font-medium break-all">
                {transaction.detalles.referencia}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {transaction.detalles?.comprobante_url && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={downloadReceipt}
              disabled={isLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              {isLoading ? 'Descargando...' : 'Descargar'}
            </Button>
          )}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={shareReceipt}
            disabled={isLoading || !navigator.share}
          >
            <Share2 className="w-4 h-4 mr-2" />
            {isLoading ? 'Compartiendo...' : 'Compartir'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
