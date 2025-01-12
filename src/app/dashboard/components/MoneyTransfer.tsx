'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'

interface Recipient {
  id: string
  name: string
  email: string
  lastTransfer?: string
}

export function MoneyTransfer() {
  const [amount, setAmount] = useState('')
  const [selectedRecipient, setSelectedRecipient] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // Example recipients - in production, these should come from your backend
  const recipients: Recipient[] = [
    { id: '1', name: 'Juan Pérez', email: 'juan@example.com', lastTransfer: '2024-01-10' },
    { id: '2', name: 'María García', email: 'maria@example.com', lastTransfer: '2024-01-05' },
  ]

  const handleTransfer = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement actual transfer logic
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Success notification would go here
    } catch (error) {
      console.error('Error during transfer:', error)
      // Error notification would go here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Enviar Dinero</h2>
      
      <div className="space-y-4">
        {/* Recipient Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Destinatario</label>
          <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar destinatario" />
            </SelectTrigger>
            <SelectContent>
              {recipients.map((recipient) => (
                <SelectItem key={recipient.id} value={recipient.id}>
                  <div>
                    <div>{recipient.name}</div>
                    <div className="text-sm text-muted-foreground">{recipient.email}</div>
                  </div>
                </SelectItem>
              ))}
              <SelectItem value="new">
                <div className="text-primary">+ Nuevo destinatario</div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Monto</label>
          <div className="relative">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="text-lg pl-8"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Saldo disponible:</p>
          <p className="text-lg font-semibold">{formatCurrency(5000)}</p>
        </div>

        {/* Transfer Button */}
        <Button
          className="w-full h-12 text-lg"
          onClick={handleTransfer}
          disabled={!amount || !selectedRecipient || isLoading}
        >
          {isLoading ? 'Procesando...' : 'Enviar Dinero'}
        </Button>

        {/* Recent Recipients */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Transferencias Recientes</h3>
          <div className="space-y-2">
            {recipients.map((recipient) => (
              <div
                key={recipient.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                onClick={() => setSelectedRecipient(recipient.id)}
              >
                <div>
                  <p className="font-medium">{recipient.name}</p>
                  <p className="text-sm text-muted-foreground">{recipient.email}</p>
                </div>
                {recipient.lastTransfer && (
                  <p className="text-sm text-muted-foreground">
                    Última: {new Date(recipient.lastTransfer).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
