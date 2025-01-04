'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { useExchange } from '@/hooks/useExchange';
import { bankAccounts } from '@/config/bankAccounts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Currency, ExchangeFormData } from '@/lib/exchange';

interface ExchangeFormProps {
  action: (data: ExchangeFormData) => Promise<{ success: boolean; error: string | null }>;
}

export function ExchangeForm({ action }: ExchangeFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { exchangeRate, calculateExchange, isLoading } = useExchange();
  
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [alias, setAlias] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "El archivo es demasiado grande. Máximo 5MB.",
          variant: "destructive",
        });
        return;
      }
      setComprobante(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedBank || !comprobante || !alias) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Subir el comprobante
      const formData = new FormData();
      formData.append('file', comprobante);
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) throw new Error('Error al subir el comprobante');
      
      const { fileUrl } = await uploadResponse.json();
      const { sourceAmount, targetAmount } = calculateExchange(amount, 'USD_TO_ARS');
      
      const result = await action({
        amount: sourceAmount,
        targetCurrency: 'ARS' as Currency,
        bankAccount: selectedBank,
        comprobante: fileUrl,
        alias
      });

      if (!result.success) throw new Error(result.error || 'Error al procesar la transacción');

      toast({
        title: "Transacción enviada",
        description: "Su solicitud de cambio está siendo procesada",
      });

      // Limpiar formulario
      setAmount('');
      setSelectedBank('');
      setComprobante(null);
      setAlias('');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un error al procesar su solicitud",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const { sourceAmount, targetAmount, appliedRate, commission } = calculateExchange(amount || '0', 'USD_TO_ARS');
  const selectedBankDetails = bankAccounts.find(bank => bank.id === selectedBank);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Monto en USD</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            disabled={isLoading || uploading}
          />
        </div>

        <div className="space-y-2">
          <Label>Seleccionar Banco para Depósito</Label>
          <Select value={selectedBank} onValueChange={setSelectedBank}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un banco" />
            </SelectTrigger>
            <SelectContent>
              {bankAccounts.map((bank) => (
                <SelectItem key={bank.id} value={bank.id}>
                  {bank.bankName} - {bank.accountType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedBankDetails && (
            <Card className="mt-2">
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Banco:</span> {selectedBankDetails.bankName}
                  </div>
                  <div>
                    <span className="font-medium">Tipo de Cuenta:</span> {selectedBankDetails.accountType}
                  </div>
                  <div>
                    <span className="font-medium">Número de Cuenta:</span> {selectedBankDetails.accountNumber}
                  </div>
                  <div>
                    <span className="font-medium">Titular:</span> {selectedBankDetails.holderName}
                  </div>
                  <div>
                    <span className="font-medium">{selectedBankDetails.documentType}:</span> {selectedBankDetails.holderDocument}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-2">
          <Label>Comprobante de Pago</Label>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              id="comprobante"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className="hidden"
              disabled={isLoading || uploading}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById('comprobante')?.click()}
              disabled={isLoading || uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {comprobante ? comprobante.name : 'Subir Comprobante'}
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Formatos aceptados: imágenes y PDF. Tamaño máximo: 5MB
          </p>
        </div>

        <div className="space-y-2">
          <Label>Alias o Referencia</Label>
          <Input
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="Su alias o referencia"
            disabled={isLoading || uploading}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de la Conversión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Monto USD:</span>
                <span>${sourceAmount.toFixed(2)}</span>
              </div>
              {commission > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>
                    {sourceAmount < 15 ? 'Cargo por monto pequeño:' : 'Comisión (3%):'}
                  </span>
                  <span>-${commission.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tasa de cambio:</span>
                <span>{appliedRate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total en ARS:</span>
                <span>${targetAmount.toFixed(2)}</span>
              </div>
              {commission > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  {sourceAmount < 15 
                    ? "Se aplica un cargo fijo de $0.50 USD para montos menores a $15 USD"
                    : "Se aplica una comisión del 3% sobre el monto en USD"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || uploading || !comprobante}>
        {(isLoading || uploading) ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {uploading ? 'Subiendo comprobante...' : 'Procesando...'}
          </>
        ) : (
          'Confirmar Cambio'
        )}
      </Button>
    </form>
  );
}
