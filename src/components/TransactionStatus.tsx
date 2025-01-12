import { TransactionStatus as Status } from '@/types/transaction';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

interface TransactionStatusProps {
  status: Status;
}

const statusConfig = {
  PENDING_UPLOAD: {
    label: 'Pendiente de Comprobante',
    color: 'bg-yellow-500',
    icon: Clock,
  },
  PENDING_VERIFICATION: {
    label: 'Pendiente de Verificación',
    color: 'bg-blue-500',
    icon: RefreshCw,
  },
  IN_ANALYSIS: {
    label: 'En Análisis',
    color: 'bg-purple-500',
    icon: RefreshCw,
  },
  VERIFIED: {
    label: 'Verificado',
    color: 'bg-green-500',
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: 'Completado',
    color: 'bg-green-700',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rechazado',
    color: 'bg-red-500',
    icon: XCircle,
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-gray-500',
    icon: AlertTriangle,
  },
};

export function TransactionStatus({ status }: TransactionStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      className={`${config.color} text-white flex items-center gap-1 px-2 py-1`}
    >
      <Icon className="w-4 h-4" />
      <span>{config.label}</span>
    </Badge>
  );
}
