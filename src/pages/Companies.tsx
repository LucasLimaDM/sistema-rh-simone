import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Building2, Plus, Edit2, Upload, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { logAudit } from '@/lib/audit'
import { maskCNPJ, maskCPF, maskIE, maskIM } from '@/lib/utils'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

export default function Companies() {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    id: '',
    corporate_name: '',
    name: '',
    cnpj: '',
    state_registration: '',
    municipal_registration: '',
    responsible_name: '',
    responsible_cpf: '',
  })

  const [files, setFiles] = useState<{ logo?: File; signature?: File }>({})
  const { toast } = useToast()

  const fetchCompanies = async () => {
    setLoading(true)
    setError(null)
    try {
      const records = await pb.collection('companies').getFullList({ sort: 'name' })
      setCompanies(records)
    } catch (err: any) {
      setError('Erro ao carregar as empresas: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'O campo Nome Fantasia é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    try {
      const form = new FormData()
      form.append('name', formData.name)
      if (formData.corporate_name) form.append('corporate_name', formData.corporate_name)
      if (formData.cnpj) form.append('cnpj', formData.cnpj)
      if (formData.state_registration)
        form.append('state_registration', formData.state_registration)
      if (formData.municipal_registration)
        form.append('municipal_registration', formData.municipal_registration)
      if (formData.responsible_name) form.append('responsible_name', formData.responsible_name)
      if (formData.responsible_cpf) form.append('responsible_cpf', formData.responsible_cpf)
      form.append('active', 'true')
      if (user?.id) form.append('user_id', user.id)

      if (files.logo) form.append('logo', files.logo)
      if (files.signature) form.append('signature', files.signature)

      let savedRecord
      if (formData.id) {
        savedRecord = await pb.collection('companies').update(formData.id, form)
        if (user?.id) logAudit('companies', formData.id, 'update', user.id, null, formData)
      } else {
        savedRecord = await pb.collection('companies').create(form)
        if (user?.id) logAudit('companies', savedRecord.id, 'create', user.id, null, formData)
      }

      toast({ title: 'Sucesso', description: 'Empresa salva com sucesso.' })
      setIsOpen(false)
      fetchCompanies()
    } catch (err: any) {
      const fieldErrs = extractFieldErrors(err)
      const errorMsg = Object.values(fieldErrs).join(' ') || err.message || 'Erro desconhecido.'
      toast({ title: 'Erro ao salvar', description: errorMsg, variant: 'destructive' })
    }
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logo' | 'signature',
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      setFiles((prev) => ({ ...prev, [field]: file }))
      toast({ title: 'Arquivo selecionado', description: file.name })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium">{error}</p>
        <Button onClick={fetchCompanies}>Tentar novamente</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Empresas Contratantes</h1>
          <p className="text-muted-foreground mt-1">Gerencie as identidades e papel timbrado</p>
        </div>
        <Button
          onClick={() => {
            setFormData({
              id: '',
              corporate_name: '',
              name: '',
              cnpj: '',
              state_registration: '',
              municipal_registration: '',
              responsible_name: '',
              responsible_cpf: '',
            })
            setFiles({})
            setIsOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Nova Empresa
        </Button>
      </div>

      {companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10 rounded-lg border border-dashed mt-6">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Nenhum registro encontrado</p>
          <p className="text-muted-foreground mb-4">Cadastre a primeira empresa para começar.</p>
          <Button onClick={() => setIsOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Nome Fantasia</TableHead>
                  <TableHead>Razão Social</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      {c.logo ? (
                        <img
                          src={pb.files.getUrl(c, c.logo)}
                          className="h-8 object-contain"
                          alt="logo"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.corporate_name}</TableCell>
                    <TableCell>{c.cnpj}</TableCell>
                    <TableCell>{c.responsible_name}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setFormData({ ...c })
                          setFiles({})
                          setIsOpen(true)
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Razão Social</Label>
              <Input
                value={formData.corporate_name}
                onChange={(e) => setFormData({ ...formData, corporate_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nome Fantasia</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: maskCNPJ(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Inscrição Estadual</Label>
              <Input
                value={formData.state_registration}
                onChange={(e) =>
                  setFormData({ ...formData, state_registration: maskIE(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Inscrição Municipal</Label>
              <Input
                value={formData.municipal_registration}
                onChange={(e) =>
                  setFormData({ ...formData, municipal_registration: maskIM(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Nome do Responsável</Label>
              <Input
                value={formData.responsible_name}
                onChange={(e) => setFormData({ ...formData, responsible_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CPF do Responsável</Label>
              <Input
                value={formData.responsible_cpf}
                onChange={(e) =>
                  setFormData({ ...formData, responsible_cpf: maskCPF(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Logotipo (Timbre)</Label>
              <div className="flex gap-2 items-center">
                <Button variant="outline" className="relative text-xs">
                  <Upload className="h-3 w-3 mr-1" /> {files.logo ? 'Alterar' : 'Upload'}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'logo')}
                  />
                </Button>
                {files.logo && (
                  <span className="text-xs text-muted-foreground truncate">{files.logo.name}</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assinatura Responsável</Label>
              <div className="flex gap-2 items-center">
                <Button variant="outline" className="relative text-xs">
                  <Upload className="h-3 w-3 mr-1" /> {files.signature ? 'Alterar' : 'Upload'}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'signature')}
                  />
                </Button>
                {files.signature && (
                  <span className="text-xs text-muted-foreground truncate">
                    {files.signature.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
