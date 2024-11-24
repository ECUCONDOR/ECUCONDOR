'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const BINANCE_API_URL = 'https://api.binance.com/api/v3/ticker/price?symbol=USDTARS'

// Validación con Zod
const formSchema = z.object({
  amountUSD: z.number().min(1, 'El monto en USD es requerido'),
  amountARS: z.number().optional(),
  beneficiaryName: z.string().min(1, 'El nombre del beneficiario es requerido'),
  cbuOrAlias: z.string().min(6, 'CBU o Alias es requerido'),
  bank: z.string().min(1, 'Seleccione un banco'),
  receipt: z.any()
    .refine((file) => file?.length > 0, 'El comprobante es requerido')
    .refine(
      (file) => file?.[0]?.size <= MAX_FILE_SIZE,
      'El archivo no debe superar 2MB'
    )
    .refine(
      (file) => ['application/pdf', 'image/jpeg', 'image/png'].includes(file?.[0]?.type),
      'Solo se permiten archivos PDF, JPEG o PNG'
    )
})

type FormData = z.infer<typeof formSchema>

export default function RegistrationForm() {
  const [exchangeRate, setExchangeRate] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amountUSD: 0,
      beneficiaryName: '',
      cbuOrAlias: '',
      bank: ''
    }
  })

  const amountUSD = watch('amountUSD')

  // Fetch Exchange Rate
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
  }, [])

  // Calcular Monto en ARS
  const amountARS = amountUSD && exchangeRate ? amountUSD * exchangeRate * 0.965 : 0

  // Submit Handler
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      const formData = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        if (key === 'receipt' && value[0]) {
          formData.append('receipt', value[0])
        } else {
          formData.append(key, value.toString())
        }
      })

      formData.append('amountARS', amountARS.toFixed(2)) // Agregar monto en ARS

      const response = await fetch('/api/register', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Error al enviar el formulario')
      }

      alert('Formulario enviado con éxito')
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Error al enviar el formulario. Por favor, inténtelo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="amountUSD" className="block text-sm font-medium text-gray-300">
          Monto en USD
        </label>
        <input
          type="number"
          id="amountUSD"
          {...register('amountUSD', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white"
        />
        {errors.amountUSD && <p className="text-red-500">{errors.amountUSD.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Monto en ARS (3.5% descuento)
        </label>
        <input
          type="text"
          value={amountARS.toFixed(2)}
          readOnly
          className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white"
        />
      </div>

      <div>
        <label htmlFor="beneficiaryName" className="block text-sm font-medium text-gray-300">
          Nombre del Beneficiario
        </label>
        <input
          type="text"
          id="beneficiaryName"
          {...register('beneficiaryName')}
          className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white"
        />
        {errors.beneficiaryName && <p className="text-red-500">{errors.beneficiaryName.message}</p>}
      </div>

      <div>
        <label htmlFor="cbuOrAlias" className="block text-sm font-medium text-gray-300">
          CBU o Alias (opcional)
        </label>
        <input
          type="text"
          id="cbuOrAlias"
          {...register('cbuOrAlias')}
          className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white"
        />
        {errors.cbuOrAlias && <p className="text-red-500">{errors.cbuOrAlias.message}</p>}
      </div>

      <div>
        <label htmlFor="bank" className="block text-sm font-medium text-gray-300">
          Banco en Argentina
        </label>
        <input
          type="text"
          id="bank"
          {...register('bank')}
          className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white"
        />
        {errors.bank && <p className="text-red-500">{errors.bank.message}</p>}
      </div>

      <div>
        <label htmlFor="receipt" className="block text-sm font-medium text-gray-300">
          Comprobante de Pago
        </label>
        <input
          type="file"
          id="receipt"
          {...register('receipt')}
          accept=".pdf,.jpeg,.png"
          className="mt-1 block w-full text-gray-300 file:bg-gray-700 file:text-gray-300"
        />
        {errors.receipt && (
          <p className="text-red-500">{String(errors.receipt.message)}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar Registro'}
      </button>
    </form>
  )
}
