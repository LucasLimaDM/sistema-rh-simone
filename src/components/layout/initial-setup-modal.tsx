import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function InitialSetupModal({
  open,
  onComplete,
}: {
  open: boolean
  onComplete: (companyName: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const { user, signOut } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    corporate_name: '',
    cnpj: '',
    phone: '',
    state_registration: '',
    municipal_registration: '',
    responsible_name: '',
    responsible_cpf: '',
  })
  const [logo, setLogo] = useState<File | null>(null)
  const [signature, setSignature] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('corporate_name', formData.corporate_name)
      data.append('cnpj', formData.cnpj.replace(/\D/g, ''))
      data.append('phone', formData.phone.replace(/\D/g, ''))
      data.append('state_registration', formData.state_registration.replace(/\D/g, ''))
      data.append('municipal_registration', formData.municipal_registration.replace(/\D/g, ''))
      data.append('responsible_name', formData.responsible_name)
      data.append('responsible_cpf', formData.responsible_cpf.replace(/\D/g, ''))
      data.append('active', 'true')
      if (user?.id) {
        data.append('user_id', user.id)
      }

      if (logo) data.append('logo', logo)
      if (signature) data.append('signature', signature)

      const record = await pb.collection('companies').create(data)
      toast({ title: 'Sucesso', description: 'Empresa cadastrada com sucesso!' })
      onComplete(record.name)
    } catch (error: any) {
      const fieldErrors = extractFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors)
        toast({
          title: 'Erro de Validação',
          description: 'Verifique os campos em vermelho.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao cadastrar empresa.',
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Configuração Inicial</DialogTitle>
          <DialogDescription>
            Detectamos que você não possui nenhuma empresa cadastrada. Por favor, cadastre sua
            primeira organização para acessar o sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={errors.name ? 'text-destructive' : ''}>
                Nome Fantasia *
              </Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="corporate_name"
                className={errors.corporate_name ? 'text-destructive' : ''}
              >
                Razão Social
              </Label>
              <Input
                id="corporate_name"
                name="corporate_name"
                value={formData.corporate_name}
                onChange={handleChange}
              />
              {errors.corporate_name && (
                <p className="text-xs text-destructive">{errors.corporate_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj" className={errors.cnpj ? 'text-destructive' : ''}>
                CNPJ
              </Label>
              <Input id="cnpj" name="cnpj" value={formData.cnpj} onChange={handleChange} />
              {errors.cnpj && <p className="text-xs text-destructive">{errors.cnpj}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className={errors.phone ? 'text-destructive' : ''}>
                Telefone
              </Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="state_registration"
                className={errors.state_registration ? 'text-destructive' : ''}
              >
                Inscrição Estadual
              </Label>
              <Input
                id="state_registration"
                name="state_registration"
                value={formData.state_registration}
                onChange={handleChange}
              />
              {errors.state_registration && (
                <p className="text-xs text-destructive">{errors.state_registration}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="municipal_registration"
                className={errors.municipal_registration ? 'text-destructive' : ''}
              >
                Inscrição Municipal
              </Label>
              <Input
                id="municipal_registration"
                name="municipal_registration"
                value={formData.municipal_registration}
                onChange={handleChange}
              />
              {errors.municipal_registration && (
                <p className="text-xs text-destructive">{errors.municipal_registration}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="responsible_name"
                className={errors.responsible_name ? 'text-destructive' : ''}
              >
                Nome do Responsável
              </Label>
              <Input
                id="responsible_name"
                name="responsible_name"
                value={formData.responsible_name}
                onChange={handleChange}
              />
              {errors.responsible_name && (
                <p className="text-xs text-destructive">{errors.responsible_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="responsible_cpf"
                className={errors.responsible_cpf ? 'text-destructive' : ''}
              >
                CPF do Responsável
              </Label>
              <Input
                id="responsible_cpf"
                name="responsible_cpf"
                value={formData.responsible_cpf}
                onChange={handleChange}
              />
              {errors.responsible_cpf && (
                <p className="text-xs text-destructive">{errors.responsible_cpf}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo" className={errors.logo ? 'text-destructive' : ''}>
                Logotipo
              </Label>
              <Input
                id="logo"
                name="logo"
                type="file"
                accept="image/*"
                onChange={(e) => setLogo(e.target.files?.[0] || null)}
              />
              {errors.logo && <p className="text-xs text-destructive">{errors.logo}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="signature" className={errors.signature ? 'text-destructive' : ''}>
                Assinatura Responsável
              </Label>
              <Input
                id="signature"
                name="signature"
                type="file"
                accept="image/*"
                onChange={(e) => setSignature(e.target.files?.[0] || null)}
              />
              {errors.signature && <p className="text-xs text-destructive">{errors.signature}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={signOut} disabled={loading}>
              Sair
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar e Continuar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
