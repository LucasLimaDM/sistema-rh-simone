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
import { useAuth } from '@/hooks/use-auth'
import { logAudit } from '@/lib/audit'

export default function Settings() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [formData, setFormData] = useState({
    id: '',
    nome_completo: '',
    email: '',
    tipo_usuario: 'Colaborador',
    cpf: '',
    assinatura_url: '',
  })
  const { toast } = useToast()

  const fetchProfiles = async () => {
    const { data } = await supabase.from('usuario_sistema').select('*').order('nome_completo')
    if (data) setProfiles(data)
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  const handleSave = async () => {
    if (newPassword && (user?.id === formData.id || user?.email === formData.email)) {
      const { error: authError } = await supabase.auth.updateUser({ password: newPassword })
      if (authError) {
        toast({
          title: 'Erro ao alterar senha',
          description: authError.message,
          variant: 'destructive',
        })
        return
      }
    }

    const payload = {
      nome_completo: formData.nome_completo,
      tipo_usuario: formData.tipo_usuario,
      cpf: formData.cpf,
      assinatura_url: formData.assinatura_url,
    }
    const { error } = await supabase.from('usuario_sistema').update(payload).eq('id', formData.id)
    if (!error) {
      if (user) logAudit('usuario_sistema', formData.id, 'update', user.id, null, payload)
      toast({ title: 'Sucesso', description: 'Usuário atualizado com sucesso.' })
      setIsOpen(false)
      setNewPassword('')
      fetchProfiles()
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    toast({ title: 'Enviando assinatura...', description: 'Aguarde o upload.' })
    const fileExt = file.name.split('.').pop()
    const fileName = `assinatura_${formData.id}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
    const filePath = `assinaturas_usuarios/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('rh_files')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      toast({ title: 'Erro no upload', description: uploadError.message, variant: 'destructive' })
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('rh_files').getPublicUrl(filePath)
    setFormData({ ...formData, assinatura_url: publicUrl })
    toast({ title: 'Upload concluído', description: 'Assinatura carregada com sucesso.' })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Configuração de Usuários do Sistema
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie níveis de acesso, senhas e assinaturas de auditoria.
        </p>
      </div>

      <Card>
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
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nome_completo}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.cpf}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {p.tipo_usuario === 'Admin' ? (
                        <Shield className="h-4 w-4 text-primary" />
                      ) : (
                        <UserIcon className="h-4 w-4" />
                      )}
                      {p.tipo_usuario}
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.assinatura_url ? (
                      <img
                        src={p.assinatura_url}
                        className="h-8 border p-1 bg-white object-contain"
                        alt="Assinatura"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">Pendente</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData({ ...p, cpf: p.cpf || '' })
                        setNewPassword('')
                        setIsOpen(true)
                      }}
                    >
                      Configurar
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
            <DialogTitle>Configuração Individual de Segurança</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={formData.nome_completo}
                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CPF (Documentos Oficiais)</Label>
              <Input
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-2">
              <Label>Perfil de Acesso</Label>
              <Select
                value={formData.tipo_usuario}
                onValueChange={(v) => setFormData({ ...formData, tipo_usuario: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Colaborador">Colaborador</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Coordenadora">Coordenadora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(user?.id === formData.id || user?.email === formData.email) && (
              <div className="space-y-2">
                <Label>Nova Senha (Opcional)</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Deixe em branco para não alterar"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Assinatura (Imagem PNG p/ PDFs)</Label>
              <div className="flex items-center gap-4">
                {formData.assinatura_url && (
                  <img
                    src={formData.assinatura_url}
                    className="h-10 border p-1 bg-white"
                    alt="Assinatura"
                  />
                )}
                <Button variant="outline" className="relative">
                  <Upload className="h-4 w-4 mr-2" /> Upload{' '}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0"
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
