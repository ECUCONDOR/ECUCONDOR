import { useState, type FormEvent as ReactFormEvent, type ChangeEvent as ReactChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAuth } from '@/hooks/useAuth'
import type { Database } from '@/types/supabase'
import type { PostgrestError } from '@supabase/supabase-js'

type ClientType = 'natural' | 'juridica'

interface FormErrors {
  first_name?: string[]
  last_name?: string[]
  identification?: string[]
  email?: string[]
  phone?: string[]
  address?: string[]
  type?: string[]
}

interface FormData {
  first_name: string
  last_name: string
  identification: string
  email: string
  phone: string
  address: string
  type: ClientType
}

type InsertClient = Database['public']['Tables']['clients']['Insert']

type FormFields = {
  [K in keyof Omit<FormData, 'type'>]: string
}

const formFields: FormFields = {
  first_name: 'First Name',
  last_name: 'Last Name',
  identification: 'Identification',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
}

export function ClientSelectionStep() {
  const router = useRouter()
  const { user, supabase } = useAuth()

  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    identification: '',
    email: '',
    phone: '',
    address: '',
    type: 'natural',
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (data: FormData): boolean => {
    const newErrors: FormErrors = {}

    if (!data.first_name) {
      newErrors.first_name = ['First name is required']
    }

    if (!data.last_name) {
      newErrors.last_name = ['Last name is required']
    }

    if (!data.identification) {
      newErrors.identification = ['Identification is required']
    }

    if (!data.email) {
      newErrors.email = ['Email is required']
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = ['Invalid email format']
    }

    if (!data.phone) {
      newErrors.phone = ['Phone is required']
    }

    if (!data.address) {
      newErrors.address = ['Address is required']
    }

    if (!data.type) {
      newErrors.type = ['Type is required']
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: ReactFormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      })
      return
    }

    const isValid = validateForm(formData)
    if (!isValid) return

    try {
      const clientData: InsertClient = {
        ...formData,
        user_id: user.id,
      }

      const { error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single()

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Client information saved successfully',
      })

      router.push('/dashboard')
    } catch (error) {
      const pgError = error as PostgrestError
      toast({
        title: 'Error',
        description: pgError.message,
        variant: 'destructive',
      })
    }
  }

  const handleInputChange = (e: ReactChangeEvent<HTMLInputElement>, field: keyof FormData) => {
    const { value } = e.target
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTypeChange = (value: ClientType): void => {
    setFormData((prev: FormData) => ({
      ...prev,
      type: value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {Object.entries(formFields).map(([field, label]) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <Input
              id={field}
              type={field === 'email' ? 'email' : 'text'}
              value={formData[field as keyof FormData]}
              onChange={(e: ReactChangeEvent<HTMLInputElement>) => handleInputChange(e, field as keyof FormData)}
            />
            {errors[field as keyof FormErrors]?.map((error: string, i: number) => (
              <p key={i} className="text-sm text-red-500">
                {error}
              </p>
            ))}
          </div>
        ))}

        <div className="space-y-2">
          <Label>Client Type</Label>
          <RadioGroup
            value={formData.type}
            onValueChange={handleTypeChange}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="natural" id="natural" />
              <Label htmlFor="natural">Natural Person</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="juridica" id="juridica" />
              <Label htmlFor="juridica">Legal Entity</Label>
            </div>
          </RadioGroup>
          {errors.type?.map((error: string, i: number) => (
            <p key={i} className="text-sm text-red-500">
              {error}
            </p>
          ))}
        </div>
      </div>

      <Button type="submit">Continue</Button>
    </form>
  )
}