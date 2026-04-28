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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Shield, User as UserIcon, Upload } from 'lucide-react'

export default function Settings() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    role: 'Usuário',
    cpf: '',
    signature_url: '',
  })
  const { toast } = useToast()

  const fetchProfiles = async () => {
    const { data } = await supabase.from('hr_profiles').select('*').order('name')
    if (data) setProfiles(data)
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  const handleSave = async () => {
    const { error } = await supabase
      .from('hr_profiles')
      .update({
        name: formData.name,
        role: formData.role,
        cpf: formData.cpf,
        signature_url: formData.signature_url,
      })
      .eq('id', formData.id)

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Usuário atualizado com sucesso.' })
      setIsOpen(false)
      fetchProfiles()
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setFormData({ ...formData, signature_url: event.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Configurações de Usuários
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie CPFs, níveis de acesso e assinaturas digitais por imagem.
        </p>
      </div>

      <Card className="shadow-sm border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Assinatura</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.cpf || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {p.role === 'Admin' ? (
                        <Shield className="h-4 w-4 text-primary" />
                      ) : (
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                      {p.role}
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.signature_url ? (
                      <img src={p.signature_url} alt="Assinatura" className="h-8 object-contain" />
                    ) : (
                      <span className="text-muted-foreground text-sm">Pendente</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...p,
                          cpf: p.cpf || '',
                          signature_url: p.signature_url || '',
                        })
                        setIsOpen(true)
                      }}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Configuração de Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-2">
              <Label>Perfil de Acesso</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Usuário">Usuário</SelectItem>
                  <SelectItem value="Colaborador">Colaborador</SelectItem>
                  <SelectItem value="Admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assinatura (Imagem PNG/JPG)</Label>
              <div className="flex items-center gap-4">
                {formData.signature_url && (
                  <img
                    src={formData.signature_url}
                    className="h-10 border p-1 rounded bg-white"
                    alt="Assinatura atual"
                  />
                )}
                <Button variant="outline" className="relative cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" /> Fazer Upload
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleUpload}
                  />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
