import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from 'react'

const banks = [
  {
    name: "Banco Pacífico",
    account: "Cuenta Corriente: 1068491700",
    ruc: "RUC: 1391937000001",
    titular: "Titular: ECUCONDOR S.A.S. SOCIEDAD DE BENEFICIO E INTERÉS COLECTIVO",
  },
  {
    name: "Produbanco",
    account: "Cuenta Pro Pyme: 27059070809",
    ruc: "RUC: 1391937000001",
    titular: "Titular: Ecucondor S.A.S. Sociedad De Beneficio E Interés Colectivo",
    email: "Correo: ecucondor@gmail.com",
  },
  {
    name: "Banco Internacional",
    account: "Cuenta Corriente: 7608113692",
    ruc: "RUC: 1391937000001",
    titular: "Titular: ECUCONDOR S.A.S. SOCIEDAD DE BENEFICIO E INTERÉS COLECTIVO",
  },
  {
    name: "Banco Guayaquil",
    account: "Cuenta Corriente: 40370557",
    ruc: "RUC: 1391937000001",
    titular: "Titular: ECUCONDOR S.A.S. SOCIEDAD DE BENEFICIO E INTERÉS COLECTIVO",
  },
]

export function BankSelector({ onChange, error }: { onChange: (value: string) => void; error?: string }) {
  const [selectedBank, setSelectedBank] = useState<typeof banks[number] | null>(null)

  const handleBankChange = (bankName: string) => {
    const selected = banks.find((bank) => bank.name === bankName) || null
    setSelectedBank(selected as typeof banks[number] | null)
    onChange(bankName)
  }

  return (
    <div>
      {/* Selector de Banco */}
      <Select onValueChange={handleBankChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccione un banco" />
        </SelectTrigger>
        <SelectContent>
          {banks.map((bank, index) => (
            <SelectItem key={index} value={bank.name}>
              {bank.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {/* Detalles del banco seleccionado */}
      {selectedBank && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <p><strong>Banco:</strong> {selectedBank.name}</p>
          <p><strong>Cuenta:</strong> {selectedBank.account}</p>
          <p><strong>RUC:</strong> {selectedBank.ruc}</p>
          <p><strong>Titular:</strong> {selectedBank.titular}</p>
          {selectedBank.email && <p><strong>Email:</strong> {selectedBank.email}</p>}
        </div>
      )}
    </div>
  )
}
