"use client"

import { useState, useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import axios from "axios"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const BINANCE_API_URL = 'https://api.binance.com/api/v3/ticker/price?symbol=USDTARS'

const formSchema = z.object({
  amountUSD: z.string().min(1, "Ingrese el monto en USD"),
  amountARS: z.string().optional(),
  senderName: z.string().min(2, "Ingrese el nombre completo"),
  senderEmail: z.string().email("Ingrese un correo electrónico válido"),
  senderPhone: z.string().min(8, "Ingrese un teléfono válido"),
  beneficiaryName: z.string().min(2, "Ingrese el nombre del beneficiario"),
  beneficiaryDNI: z.string().min(1, "Ingrese el DNI"),
  beneficiaryCBU: z.string().min(1, "Ingrese el CBU"),
  beneficiaryAlias: z.string().optional(),
  transferDate: z.string().min(1, "Seleccione la fecha"),
  transferTime: z.string().min(1, "Seleccione la hora"),
  originBank: z.string().min(1, "Ingrese el banco de origen"),
  lastDigits: z.string().min(4, "Ingrese los últimos 4 dígitos"),
  referenceNumber: z.string().min(1, "Ingrese el número de comprobante"),
  additionalDetails: z.string().optional(),
  destinationBank: z.string().min(1, "Seleccione el banco de destino"),
})

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

export function TransactionForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amountUSD: "",
      amountARS: "",
      senderName: "",
      senderEmail: "",
      senderPhone: "",
      beneficiaryName: "",
      beneficiaryDNI: "",
      beneficiaryCBU: "",
      beneficiaryAlias: "",
      transferDate: "",
      transferTime: "",
      originBank: "",
      lastDigits: "",
      referenceNumber: "",
      additionalDetails: "",
      destinationBank: "",
    },
  })

  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [selectedBank, setSelectedBank] = useState(banks[0])

  const fetchExchangeRate = async () => {
    try {
      const response = await axios.get(BINANCE_API_URL)
      setExchangeRate(parseFloat(response.data.price))
    } catch (error) {
      console.error("Error fetching exchange rate:", error)
    }
  }

  useEffect(() => {
    fetchExchangeRate()
    const interval = setInterval(fetchExchangeRate, 20000)
    return () => clearInterval(interval)
  }, [])

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="bg-[#1A1A1A] border-[#333333] shadow-lg">
          <CardHeader className="border-b border-[#333333]">
            <CardTitle className="text-2xl font-semibold text-white">Formulario de Registro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Montos */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="amountUSD"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Monto en USD</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="0.00" 
                        {...field} 
                        className="bg-[#1E1E1E] border-[#333333] text-white placeholder:text-gray-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amountARS"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Monto en ARS</FormLabel>
                    <FormControl>
                      <div className="space-y-1">
                        <Input
                          readOnly
                          value={
                            form.watch("amountUSD") && exchangeRate
                              ? `$ ${(parseFloat(form.watch("amountUSD")) * exchangeRate * 0.965).toFixed(2)}`
                              : "$ 0,00"
                          }
                          className="bg-[#1E1E1E] border-[#333333] text-white"
                        />
                        <p className="text-sm text-[#A0A0A0]">
                          Tasa actual: $ {exchangeRate?.toFixed(2) || '0.00'} ARS/USD
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Datos del Remitente */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Datos del Remitente</h3>
              <FormField
                control={form.control}
                name="senderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Nombre Completo</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-[#1E1E1E] border-[#333333] text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="senderEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} className="bg-[#1E1E1E] border-[#333333] text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="senderPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-[#1E1E1E] border-[#333333] text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Datos del Beneficiario */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Datos del Beneficiario</h3>
              <FormField
                control={form.control}
                name="beneficiaryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Nombre Completo</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-[#1E1E1E] border-[#333333] text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="beneficiaryDNI"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">DNI</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-[#1E1E1E] border-[#333333] text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="beneficiaryCBU"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">CBU</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-[#1E1E1E] border-[#333333] text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="beneficiaryAlias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Alias (Opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-[#1E1E1E] border-[#333333] text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Detalles de la Transferencia */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Detalles de la Transferencia</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="transferDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Fecha de Transferencia</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-[#1E1E1E] border-[#333333] text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="transferTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Hora de Transferencia</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} className="bg-[#1E1E1E] border-[#333333] text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="originBank"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Banco de Origen</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-[#1E1E1E] border-[#333333] text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastDigits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Últimos 4 dígitos</FormLabel>
                      <FormControl>
                        <Input maxLength={4} {...field} className="bg-[#1E1E1E] border-[#333333] text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="referenceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Número de Comprobante</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-[#1E1E1E] border-[#333333] text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="additionalDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Detalles Adicionales</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-[#1E1E1E] border-[#333333] text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Banco de Destino */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Banco de Destino</h3>
              <FormField
                control={form.control}
                name="destinationBank"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text
-white">Seleccione un banco</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        setSelectedBank(banks.find(bank => bank.name === value) || banks[0])
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#1E1E1E] border-[#333333] text-white">
                          <SelectValue placeholder="Seleccione un banco" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1E1E1E] border-[#333333]">
                        {banks.map((bank) => (
                          <SelectItem key={bank.name} value={bank.name}>{bank.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Card className="bg-[#1A1A1A] border-[#333333] shadow-lg">
                      <CardContent className="p-4 space-y-2">
                        <p className="text-lg font-semibold text-white">{selectedBank.name}</p>
                        <p className="text-sm text-gray-300">{selectedBank.account}</p>
                        <p className="text-sm text-gray-300">{selectedBank.ruc}</p>
                        <p className="text-sm text-gray-300">{selectedBank.titular}</p>
                        {selectedBank.email && <p className="text-sm text-gray-300">{selectedBank.email}</p>}
                      </CardContent>
                    </Card>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full font-semibold py-3 rounded-lg transition-colors bg-gradient-to-r from-[#F0E100] to-[#FF3366] text-white hover:opacity-90"
            >
              Registrar Transacción
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}

