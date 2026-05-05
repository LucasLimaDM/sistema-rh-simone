import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Shield, User as UserIcon, Upload, Trash2, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { logAudit } from '@/lib/audit'
import { maskCPF } from '@/lib/utils'

export default function Settings() {
  const { user, role } = useAuth()
  const [profiles, setProfiles] = useState<any[]>([])
  const [witnesses, setWitnesses] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isWitnessOpen, setIsWitnessOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [pointRules, setPointRules] = useState({
    texto_explicativo: '',
    desconto_almoco: 1,
  })
  const [formData, setFormData] = useState({
    id: '',
    nome_completo: '',
    email: '',
    tipo_usuario: 'Usuario',
    cpf: '',
    assinatura_url: '',
  })
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Usuario',
    cpf: '',
    assinatura_url: '',
  })
  const [witnessData, setWitnessData] = useState({
    id: '',
    nome: '',
    cpf: '',
    rg: '',
    assinatura_url: '',
  })
  const { toast } = useToast()

  const fetchProfiles = async () => {
    const { data } = await supabase.from('usuario_sistema').select('*').order('nome_completo')
    if (data) {
      setProfiles(data)
    }
  }

  const fetchWitnesses = async () => {
    const { data } = await supabase
      .from('testemunhas' as any)
      .select('*')
      .order('nome')
    if (data) setWitnesses(data)
  }

  const fetchUserSettings = async () => {
    if (!user) return
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (data && (data as any).configuracoes_ponto) {
      setPointRules({
        texto_explicativo: (data as any).configuracoes_ponto.texto_explicativo || '',
        desconto_almoco: (data as any).configuracoes_ponto.desconto_almoco ?? 1,
      })
    }
  }

  useEffect(() => {
    fetchProfiles()
    fetchWitnesses()
    if (user) fetchUserSettings()
    setIsAdmin(role === 'Admin')
  }, [user, role])

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
      email: formData.email,
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
    } else {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
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

  const handleUploadNewUserSignature = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    toast({ title: 'Enviando assinatura...', description: 'Aguarde o upload.' })
    const fileExt = file.name.split('.').pop()
    const fileName = `assinatura_novo_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
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
    setNewUserData({ ...newUserData, assinatura_url: publicUrl })
    toast({ title: 'Upload concluído', description: 'Assinatura carregada com sucesso.' })
  }

  const handleAddUser = async () => {
    if (!newUserData.name || !newUserData.email) return
    if (!newUserData.password) {
      return toast({
        title: 'Atenção',
        description: 'A senha é obrigatória',
        variant: 'destructive',
      })
    }
    const { data, error } = await supabase.functions.invoke('invite-user', { body: newUserData })
    if (error || data?.error) {
      toast({
        title: 'Erro ao adicionar',
        description: error?.message || data?.error,
        variant: 'destructive',
      })
    } else {
      if (newUserData.cpf || newUserData.assinatura_url) {
        await supabase
          .from('usuario_sistema')
          .update({
            cpf: newUserData.cpf,
            assinatura_url: newUserData.assinatura_url,
          })
          .eq('email', newUserData.email)
      }
      toast({ title: 'Usuário adicionado com sucesso' })
      setIsAddOpen(false)
      setNewUserData({
        name: '',
        email: '',
        password: '',
        role: 'Usuario',
        cpf: '',
        assinatura_url: '',
      })
      fetchProfiles()
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!isAdmin) return toast({ title: 'Acesso Negado', variant: 'destructive' })
    if (!confirm('Deseja realmente excluir este usuário?')) return
    await supabase.from('usuario_sistema').delete().eq('id', id)
    toast({ title: 'Usuário excluído' })
    fetchProfiles()
  }

  const handleSaveWitness = async () => {
    const payload = {
      nome: witnessData.nome,
      cpf: witnessData.cpf,
      rg: witnessData.rg,
      assinatura_url: witnessData.assinatura_url,
    }

    let error
    if (witnessData.id) {
      const { error: err } = await supabase
        .from('testemunhas' as any)
        .update(payload)
        .eq('id', witnessData.id)
      error = err
    } else {
      const { error: err } = await supabase.from('testemunhas' as any).insert(payload)
      error = err
    }

    if (!error) {
      toast({ title: 'Sucesso', description: 'Testemunha salva com sucesso.' })
      setIsWitnessOpen(false)
      fetchWitnesses()
    } else {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const handleUploadWitness = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    toast({ title: 'Enviando assinatura...', description: 'Aguarde o upload.' })
    const fileExt = file.name.split('.').pop()
    const fileName = `assinatura_test_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
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
    setWitnessData({ ...witnessData, assinatura_url: publicUrl })
    toast({ title: 'Upload concluído', description: 'Assinatura carregada com sucesso.' })
  }

  const handleSavePointRules = async () => {
    if (!user) return
    const { error } = await supabase
      .from('user_settings')
      .update({
        configuracoes_ponto: pointRules,
      } as any)
      .eq('user_id', user.id)

    if (!error) {
      toast({ title: 'Sucesso', description: 'Regras de ponto salvas com sucesso.' })
    } else {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie acessos ao sistema, testemunhas e regras do sistema.
        </p>
      </div>

      <Tabs defaultValue="usuarios" className="w-full">
        <TabsList>
          <TabsTrigger value="usuarios">Usuários do Sistema</TabsTrigger>
          <TabsTrigger value="testemunhas">Testemunhas</TabsTrigger>
          <TabsTrigger value="ponto">Regras de Ponto</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-primary">Usuários Cadastrados</h2>
            {isAdmin && (
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Novo Usuário
              </Button>
            )}
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
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFormData({ ...p, cpf: p.cpf || '', email: p.email || '' })
                              setNewPassword('')
                              setIsOpen(true)
                            }}
                          >
                            Editar
                          </Button>
                          {isAdmin && p.id !== user?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive h-8 w-8"
                              onClick={() => handleDeleteUser(p.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testemunhas" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-primary">Testemunhas Cadastradas</h2>
            <Button
              onClick={() => {
                setWitnessData({ id: '', nome: '', cpf: '', rg: '', assinatura_url: '' })
                setIsWitnessOpen(true)
              }}
            >
              Nova Testemunha
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>RG</TableHead>
                    <TableHead>Assinatura</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {witnesses.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="font-medium">{w.nome}</TableCell>
                      <TableCell>{w.cpf}</TableCell>
                      <TableCell>{w.rg}</TableCell>
                      <TableCell>
                        {w.assinatura_url ? (
                          <img
                            src={w.assinatura_url}
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
                            setWitnessData({
                              id: w.id,
                              nome: w.nome,
                              cpf: w.cpf,
                              rg: w.rg || '',
                              assinatura_url: w.assinatura_url || '',
                            })
                            setIsWitnessOpen(true)
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={async () => {
                            if (confirm('Deseja excluir esta testemunha?')) {
                              await supabase
                                .from('testemunhas' as any)
                                .delete()
                                .eq('id', w.id)
                              fetchWitnesses()
                            }
                          }}
                        >
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ponto" className="space-y-4 pt-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-primary mb-1">Regras de Cálculo de Ponto</h2>
                <p className="text-sm text-muted-foreground">
                  Personalize a fórmula e o texto explicativo da lógica de contagem de horas.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Texto Explicativo da Fórmula de Cálculo</Label>
                <Textarea
                  value={pointRules.texto_explicativo}
                  onChange={(e) =>
                    setPointRules({ ...pointRules, texto_explicativo: e.target.value })
                  }
                  className="min-h-[250px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Este texto será exibido como referência da política da empresa e não afeta
                  diretamente o código.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Desconto Fixo de Almoço (horas)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={pointRules.desconto_almoco}
                  onChange={(e) =>
                    setPointRules({
                      ...pointRules,
                      desconto_almoco: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="max-w-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  Quantidade de horas descontadas automaticamente em jornadas superiores a 5 horas.
                </p>
              </div>
              <Button onClick={handleSavePointRules}>Salvar Regras</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                value={newUserData.email}
                type="email"
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input
                value={newUserData.cpf}
                onChange={(e) => setNewUserData({ ...newUserData, cpf: maskCPF(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Perfil de Acesso</Label>
              <Select
                value={newUserData.role}
                onValueChange={(v) => setNewUserData({ ...newUserData, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Usuario">Usuário</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Senha Temporária</Label>
              <Input
                value={newUserData.password}
                type="password"
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Assinatura (Imagem PNG p/ PDFs)</Label>
              <div className="flex items-center gap-4">
                {newUserData.assinatura_url && (
                  <img
                    src={newUserData.assinatura_url}
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
                    onChange={handleUploadNewUserSignature}
                  />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={!newUserData.name || !newUserData.email || !newUserData.password}
            >
              Salvar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuração Individual de Segurança</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={formData.nome_completo}
                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CPF (Documentos Oficiais)</Label>
              <Input
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: maskCPF(e.target.value) })}
                placeholder=""
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
                  <SelectItem value="Usuario">Usuário</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
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

      <Dialog open={isWitnessOpen} onOpenChange={setIsWitnessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{witnessData.id ? 'Editar Testemunha' : 'Nova Testemunha'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={witnessData.nome}
                onChange={(e) => setWitnessData({ ...witnessData, nome: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input
                  value={witnessData.cpf}
                  onChange={(e) => setWitnessData({ ...witnessData, cpf: maskCPF(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>RG</Label>
                <Input
                  value={witnessData.rg}
                  onChange={(e) => setWitnessData({ ...witnessData, rg: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assinatura (Imagem PNG p/ PDFs)</Label>
              <div className="flex items-center gap-4">
                {witnessData.assinatura_url && (
                  <img
                    src={witnessData.assinatura_url}
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
                    onChange={handleUploadWitness}
                  />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWitnessOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveWitness} disabled={!witnessData.nome || !witnessData.cpf}>
              Salvar Testemunha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
