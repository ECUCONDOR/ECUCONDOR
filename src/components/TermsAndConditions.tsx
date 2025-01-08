import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface TermsAndConditionsProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
  open,
  onClose,
  onAccept,
}) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      onAccept();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Políticas de Ecucondor</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Política de Verificación de Identidad</h3>
            <p className="text-sm text-muted-foreground">
              Ecucondor solo procesará transacciones para clientes cuya identidad haya sido verificada previamente mediante documentos oficiales. Esto incluye documentos de identidad, comprobantes de dirección y otros requisitos aplicables según la legislación vigente.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Política de Información Bancaria</h3>
            <p className="text-sm text-muted-foreground">
              El cliente es responsable de proporcionar información bancaria correcta y completa.
              Ecucondor no se hará responsable por transferencias fallidas debido a errores en los datos proporcionados por el cliente.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Política de Límites de Transacción</h3>
            <p className="text-sm text-muted-foreground">
              Ecucondor podrá establecer límites mínimos y máximos para las transacciones según el tipo de servicio, cliente y requisitos regulatorios.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Responsabilidad sobre Atrasos Bancarios</h3>
            <p className="text-sm text-muted-foreground">
              Ecucondor no se responsabiliza por atrasos ocasionados por las entidades bancarias durante el procesamiento de transferencias internacionales o locales.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Verificación de Comprobantes Bancarios</h3>
            <p className="text-sm text-muted-foreground">
              Ecucondor procesará cualquier solicitud de transferencia únicamente después de recibir y verificar los comprobantes de pago correspondientes.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Compromiso con la Rapidez</h3>
            <p className="text-sm text-muted-foreground">
              Ecucondor se compromete a procesar las transacciones dentro de un plazo máximo de dos horas, siempre y cuando los fondos y comprobantes hayan sido confirmados previamente.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
            />
            <Label htmlFor="terms">
              He leído y acepto los términos y condiciones
            </Label>
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!accepted}
          >
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAndConditions;
