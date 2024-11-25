'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AmountInput } from './AmountInput'
import { SenderInfo } from './SenderInfo'
import { BeneficiaryInfo } from './BeneficiaryInfo'
import { BankSelector } from './BankSelector'
import { ReceiptUpload } from './ReceiptUpload'

const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB

const formSchema = z.object({
  amount: z.number().min(1, 'El monto es requerido'),
  senderName: z.string().min(1, 'El nombre es requerido'),
  senderEmail: z.string().email('Email inválido'),
  beneficiaryName: z.string().min(1, 'El nombre del beneficiario es requerido'),
  beneficiaryDNI: z.string().min(7, 'DNI inválido'),
  beneficiaryCBU: z.string().regex(/^\d{22}$/, 'CBU debe tener 22 dígitos'),
  beneficiaryAlias: z.string().min(6, 'Alias inválido').optional(),
  ecucondorBank: z.string().min(1, 'Seleccione un banco'),
  receipt: z.any()
    .refine((file) => file?.length > 0, 'El comprobante es requerido')
    .refine(
      (file) => file?.[0]?.size <= MAX_FILE_SIZE,
      'El archivo no debe superar 1MB'
    )
    .refine(
      (file) => ['application/pdf', 'image/jpeg', 'image/png'].includes(file?.[0]?.type),
      'Solo se permiten archivos PDF, JPEG o PNG'
    )
})

type FormData = z.infer<typeof formSchema>

const BINANCE_API_URL = 'https://api.binance.com/api/v3/ticker/price?symbol=USDTARS'

export function RegistrationForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [exchangeRate, setExchangeRate] = useState(0)
  const [arsAmount, setArsAmount] = useState(0)

  const {
    control,
    register,
    watch,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      senderName: '',
      senderEmail: '',
      beneficiaryName: '',
      beneficiaryDNI: '',
      beneficiaryCBU: '',
      beneficiaryAlias: '',
      ecucondorBank: ''
    }
  })

  const amount = watch('amount')

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
    const interval = setInterval(fetchExchangeRate, 20000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (amount && exchangeRate) {
      const calculatedAmount = amount * exchangeRate * 0.965
      setArsAmount(calculatedAmount)
    } else {
      setArsAmount(0)
    }
  }, [amount, exchangeRate])

  // Función para convertir archivo a Base64
  const fileToBase64 = (file: File): Promise<string | ArrayBuffer | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)

      let receiptBase64 = null
      if (data.receipt?.[0]) {
        receiptBase64 = await fileToBase64(data.receipt[0])
      }

      const jsonData = {
        amount: data.amount,
        senderName: data.senderName,
        senderEmail: data.senderEmail,
        beneficiaryName: data.beneficiaryName,
        beneficiaryDNI: data.beneficiaryDNI,
        beneficiaryCBU: data.beneficiaryCBU,
        beneficiaryAlias: data.beneficiaryAlias || null,
        ecucondorBank: data.ecucondorBank,
        receipt: receiptBase64, // Archivo convertido a Base64
        arsAmount: arsAmount
      }

      const response = await fetch('https://hook.us2.make.com/vk4r6xteeest2rbuh0s378ys8fwth9l9', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
      })

      if (!response.ok) {
        throw new Error('Error al enviar el formulario')
      }

      router.push('/thank-you')
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Error al enviar el formulario. Por favor, inténtelo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-gradient-to-b from-zinc-900/50 to-black/50 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-white">
          Formulario de Registro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AmountInput register={register} errors={errors} arsAmount={arsAmount} />
          <SenderInfo register={register} errors={errors} />
          <BeneficiaryInfo register={register} errors={errors} />
          <Controller
            name="ecucondorBank"
            control={control}
            render={({ field }) => (
              <BankSelector
                onChange={field.onChange}
                error={errors.ecucondorBank?.message}
              />
            )}
          />
          <ReceiptUpload register={register} errors={errors} />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-white via-white to-white/90 text-black font-bold hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Registro'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
