import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
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
import { useToast } from '@/hooks/use-toast'
import { Building2, Plus, Edit2, Upload } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { logAudit } from '@/lib/audit'

export default function Companies() {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    nome_responsavel: '',
    cpf_responsavel: '',
    logo_url: '',
    assinatura_responsavel_url: '',
  })
  const { toast } = useToast()

  const fetchCompanies = async () => {
    const { data } = await supabase.from('empresa_contratante').select('*').order('nome_fantasia')
    if (data) setCompanies(data)
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const handleSave = async () => {
    const payload = {
      razao_social: formData.razao_social,
      nome_fantasia: formData.nome_fantasia,
      cnpj: formData.cnpj,
      inscricao_estadual: formData.inscricao_estadual || null,
      nome_responsavel: formData.nome_responsavel,
      cpf_responsavel: formData.cpf_responsavel,
      logo_url: formData.logo_url || null,
      assinatura_responsavel_url: formData.assinatura_responsavel_url || null,
      endereco: {},
      header_template: {},
      ativa: true,
    }

    if (formData.id) {
      await supabase.from('empresa_contratante').update(payload).eq('id', formData.id)
      if (user) logAudit('empresa_contratante', formData.id, 'update', user.id, null, payload)
    } else {
      const { data } = await supabase.from('empresa_contratante').insert(payload).select().single()
      if (data && user) logAudit('empresa_contratante', data.id, 'create', user.id, null, payload)
    }

    toast({ title: 'Sucesso', description: 'Empresa salva com sucesso.' })
    setIsOpen(false)
    fetchCompanies()
  }

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logo_url' | 'assinatura_responsavel_url',
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => setFormData({ ...formData, [field]: event.target?.result as string })
    reader.readAsDataURL(file)
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
              razao_social: '',
              nome_fantasia: '',
              cnpj: '',
              inscricao_estadual: '',
              nome_responsavel: '',
              cpf_responsavel: '',
              logo_url: '',
              assinatura_responsavel_url: '',
            })
            setIsOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Nova Empresa
        </Button>
      </div>

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
                    {c.logo_url ? (
                      <img src={c.logo_url} className="h-8 object-contain" alt="logo" />
                    ) : (
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{c.nome_fantasia}</TableCell>
                  <TableCell>{c.razao_social}</TableCell>
                  <TableCell>{c.cnpj}</TableCell>
                  <TableCell>{c.nome_responsavel}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFormData(c)
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Razão Social</Label>
              <Input
                value={formData.razao_social}
                onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nome Fantasia</Label>
              <Input
                value={formData.nome_fantasia}
                onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Inscrição Estadual</Label>
              <Input
                value={formData.inscricao_estadual}
                onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nome do Responsável</Label>
              <Input
                value={formData.nome_responsavel}
                onChange={(e) => setFormData({ ...formData, nome_responsavel: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CPF do Responsável</Label>
              <Input
                value={formData.cpf_responsavel}
                onChange={(e) => setFormData({ ...formData, cpf_responsavel: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Logotipo (Timbre)</Label>
              <div className="flex gap-2 items-center">
                {formData.logo_url && (
                  <img src={formData.logo_url} className="h-8 border p-1" alt="logo" />
                )}
                <Button variant="outline" className="relative text-xs">
                  <Upload className="h-3 w-3 mr-1" /> Upload
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0"
                    accept="image/*"
                    onChange={(e) => handleUpload(e, 'logo_url')}
                  />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assinatura Responsável</Label>
              <div className="flex gap-2 items-center">
                {formData.assinatura_responsavel_url && (
                  <img
                    src={formData.assinatura_responsavel_url}
                    className="h-8 border p-1"
                    alt="assinatura"
                  />
                )}
                <Button variant="outline" className="relative text-xs">
                  <Upload className="h-3 w-3 mr-1" /> Upload
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0"
                    accept="image/*"
                    onChange={(e) => handleUpload(e, 'assinatura_responsavel_url')}
                  />
                </Button>
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
