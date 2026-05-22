import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Clock,
  FileText,
  Settings,
  LogOut,
  Building2,
  Upload,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { cn, maskCNPJ, maskCPF, maskIE, maskIM } from '@/lib/utils'
import { AppContextType, Company } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

export function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [company, setCompany] = useState<Company>('')
  const [companies, setCompanies] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

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
  const [files, setFiles] = useState<{ logo?: File; signature?: File }>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const fetchCompanies = async () => {
    try {
      const records = await pb.collection('companies').getFullList({ sort: 'name' })
      setCompanies(records)
      if (records.length === 0) {
        setShowModal(true)
      } else {
        setShowModal(false)
        if (!company || !records.find((c) => c.name === company)) {
          setCompany(records[0].name)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCompanies()
    }
  }, [user])

  useRealtime('companies', () => {
    fetchCompanies()
  })

  const handleLogout = () => {
    signOut()
    navigate('/login')
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logo' | 'signature',
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      setFiles((prev) => ({ ...prev, [field]: file }))
    }
  }

  const handleSaveCompany = async () => {
    setFormErrors({})

    if (!formData.name.trim()) {
      setFormErrors({ name: 'Nome Fantasia é obrigatório.' })
      return
    }

    setSaving(true)
    try {
      const payload = new FormData()

      payload.append('name', formData.name.trim())
      payload.append('active', 'true')

      if (user?.id) {
        payload.append('user_id', user.id)
      }

      const stringFields: (keyof typeof formData)[] = [
        'corporate_name',
        'cnpj',
        'phone',
        'state_registration',
        'municipal_registration',
        'responsible_name',
        'responsible_cpf',
      ]

      stringFields.forEach((field) => {
        const val = formData[field]?.trim()
        if (val) {
          payload.append(field, val)
        }
      })

      if (files.logo) {
        payload.append('logo', files.logo)
      }
      if (files.signature) {
        payload.append('signature', files.signature)
      }

      await pb.collection('companies').create(payload)

      toast({ title: 'Sucesso', description: 'Empresa cadastrada com sucesso!' })

      // Update the state immediately
      await fetchCompanies()
    } catch (err: any) {
      const fieldErrs = extractFieldErrors(err)
      setFormErrors(fieldErrs)
      const errorMsg =
        Object.values(fieldErrs).join(' ') || err.message || 'Verifique os campos do formulário.'
      toast({ title: 'Erro ao salvar', description: errorMsg, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Empresas', href: '/empresas', icon: Building2 },
    { name: 'Colaboradores', href: '/colaboradores', icon: Users },
    { name: 'Cargos', href: '/cargos', icon: Briefcase },
    { name: 'Ponto', href: '/ponto', icon: Clock },
    { name: 'Documentos', href: '/documentos', icon: FileText },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ]

  const contextValue: AppContextType = {
    company,
    setCompany,
  }

  return (
    <div className="flex h-screen bg-muted/20">
      <aside className="w-64 bg-background border-r flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-lg font-bold text-primary">Sistema RH</h1>
        </div>

        <div className="p-4 border-b">
          <Select
            value={company}
            onValueChange={(value) => setCompany(value as Company)}
            disabled={isFetching || companies.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a empresa" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href))
            return (
              <Link key={item.name} to={item.href}>
                <span
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {!isFetching && companies.length > 0 ? (
            <Outlet context={contextValue} />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              {isFetching ? 'Carregando empresas...' : 'Aguardando cadastro de empresa...'}
            </div>
          )}
        </div>
      </main>

      <Dialog
        open={showModal}
        onOpenChange={(open) => {
          if (!open && companies.length === 0) return
          setShowModal(open)
        }}
      >
        <DialogContent
          className="max-w-2xl"
          onInteractOutside={(e) => {
            if (companies.length === 0) e.preventDefault()
          }}
          onEscapeKeyDown={(e) => {
            if (companies.length === 0) e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>Configuração Inicial</DialogTitle>
            <DialogDescription>
              Detectamos que você não possui nenhuma empresa cadastrada. Por favor, cadastre sua
              primeira organização para acessar o sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label>
                Nome Fantasia <span className="text-destructive">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Primer Pisos"
              />
              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Razão Social</Label>
              <Input
                value={formData.corporate_name}
                onChange={(e) => setFormData({ ...formData, corporate_name: e.target.value })}
              />
              {formErrors.corporate_name && (
                <p className="text-xs text-destructive">{formErrors.corporate_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: maskCNPJ(e.target.value) })}
                placeholder="00.000.000/0000-00"
              />
              {formErrors.cnpj && <p className="text-xs text-destructive">{formErrors.cnpj}</p>}
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              {formErrors.phone && <p className="text-xs text-destructive">{formErrors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label>Inscrição Estadual</Label>
              <Input
                value={formData.state_registration}
                onChange={(e) =>
                  setFormData({ ...formData, state_registration: maskIE(e.target.value) })
                }
              />
              {formErrors.state_registration && (
                <p className="text-xs text-destructive">{formErrors.state_registration}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Inscrição Municipal</Label>
              <Input
                value={formData.municipal_registration}
                onChange={(e) =>
                  setFormData({ ...formData, municipal_registration: maskIM(e.target.value) })
                }
              />
              {formErrors.municipal_registration && (
                <p className="text-xs text-destructive">{formErrors.municipal_registration}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Nome do Responsável</Label>
              <Input
                value={formData.responsible_name}
                onChange={(e) => setFormData({ ...formData, responsible_name: e.target.value })}
              />
              {formErrors.responsible_name && (
                <p className="text-xs text-destructive">{formErrors.responsible_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>CPF do Responsável</Label>
              <Input
                value={formData.responsible_cpf}
                onChange={(e) =>
                  setFormData({ ...formData, responsible_cpf: maskCPF(e.target.value) })
                }
                placeholder="000.000.000-00"
              />
              {formErrors.responsible_cpf && (
                <p className="text-xs text-destructive">{formErrors.responsible_cpf}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Logotipo</Label>
              <div className="flex gap-2 items-center">
                <Button type="button" variant="outline" className="relative text-xs">
                  <Upload className="h-3 w-3 mr-1" /> {files.logo ? 'Alterar' : 'Upload'}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'logo')}
                  />
                </Button>
                {files.logo && (
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {files.logo.name}
                  </span>
                )}
              </div>
              {formErrors.logo && <p className="text-xs text-destructive">{formErrors.logo}</p>}
            </div>
            <div className="space-y-2">
              <Label>Assinatura Responsável</Label>
              <div className="flex gap-2 items-center">
                <Button type="button" variant="outline" className="relative text-xs">
                  <Upload className="h-3 w-3 mr-1" /> {files.signature ? 'Alterar' : 'Upload'}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'signature')}
                  />
                </Button>
                {files.signature && (
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {files.signature.name}
                  </span>
                )}
              </div>
              {formErrors.signature && (
                <p className="text-xs text-destructive">{formErrors.signature}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleLogout} variant="ghost" disabled={saving}>
              Sair
            </Button>
            <Button onClick={handleSaveCompany} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar e Continuar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Layout
