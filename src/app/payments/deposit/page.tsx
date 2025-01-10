import { DashboardLayout } from '@/components/DashboardLayout'
import DepositMethods from '@/components/payments/DepositMethods'

export default function DepositPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Depositar Fondos</h1>
        <DepositMethods />
      </div>
    </DashboardLayout>
  )
}
