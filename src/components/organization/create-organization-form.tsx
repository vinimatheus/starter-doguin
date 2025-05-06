'use client'

import { createOrganization } from '@/actions/organization'
import { Button } from '@/components/ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { OrganizationSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useOrganizationContext } from '@/providers/organization-provider'

type OrganizationForm = z.infer<typeof OrganizationSchema>

interface CreateOrganizationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel?: () => void
  isStandalone?: boolean
}

export function CreateOrganizationForm({ 
  onOpenChange,
  onCancel,
  isStandalone = false
}: CreateOrganizationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { refreshOrganizations } = useOrganizationContext()

  const form = useForm<OrganizationForm>({
    resolver: zodResolver(OrganizationSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })


  const onSubmit = async (values: OrganizationForm) => {
    try {
      setIsSubmitting(true)
      const result = await createOrganization(
        values.name,
        values.description
      )

      console.log('Resultado da criação da organização:', result);
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.success && result.organization) {
        console.log('Organização criada com sucesso:', result.organization);
        console.log('ID da organização:', result.organization.id);
        
        toast.success('Organização criada com sucesso!')
        onOpenChange(false)
        form.reset()
        
        // Atualizar o contexto e redirecionar
        await refreshOrganizations()
        router.push(`/dashboard/${result.organization.id}/settings/members`)
      }
    } catch (error) {
      toast.error('Erro ao criar organização')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onOpenChange(false)
    }
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da organização</FormLabel>
              <FormControl>
                <Input
                  placeholder="Minha Empresa"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Nome da sua organização ou empresa.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Uma breve descrição da sua organização"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Uma descrição curta da sua organização (opcional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Criando...' : 'Criar organização'}
          </Button>
        </div>
      </form>
    </Form>
  )

  // Se for componente autônomo, renderiza fora do modal
  if (isStandalone) {
    return formContent
  }

  // Se for modal, renderiza dentro do DialogContent
  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Criar nova organização</DialogTitle>
        <DialogDescription>
          Preencha os dados abaixo para criar uma nova organização.
        </DialogDescription>
      </DialogHeader>
      {formContent}
    </DialogContent>
  )
} 