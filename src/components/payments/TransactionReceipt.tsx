'use client'

import { TransaccionExtendida } from '@/types/payments.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Share2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface TransactionReceiptProps {
  transaction: TransaccionExtendida
}

export default function TransactionReceipt({ transaction }: TransactionReceiptProps) {
  const downloadReceipt = async () => {
    // Implementar lógica de descarga del comprobante
    if (transaction.detalles?.comprobante_url) {
      window.open(transaction.detalles.comprobante_url, '_blank')
    }
  }

  const shareReceipt = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Comprobante de transacción',
          text: `Comprobante de ${transaction.tipo.toLowerCase()} por $${transaction.monto}`,
          url: transaction.detalles?.comprobante_url
        })
      } catch (error) {
        console.error('Error compartiendo:', error)
      }
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Comprobante de Transacción</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-t border-b py-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha:</span>
            <span className="font-medium">
              {format(new Date(transaction.created_at), 'PPP', { locale: es })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo:</span>
            <span className="font-medium">{transaction.tipo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monto:</span>
            <span className="font-medium">${transaction.monto.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estado:</span>
            <span className={`font-medium ${
              transaction.estado === 'COMPLETADA' ? 'text-green-600' : 
              transaction.estado === 'PENDIENTE' ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {transaction.estado}
            </span>
          </div>
          {transaction.detalles?.referencia && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Referencia:</span>
              <span className="font-medium">{transaction.detalles.referencia}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {transaction.detalles?.comprobante_url && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={downloadReceipt}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
          )}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={shareReceipt}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
