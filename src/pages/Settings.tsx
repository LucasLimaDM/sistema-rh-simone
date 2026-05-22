import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Shield, User as UserIcon, Upload, Trash2, Plus, AlertCircle } from 'lucide-react'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    role: 'Usuario',
    cpf: '',
  })
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Usuario',
    cpf: '',
  })
  const [witnessData, setWitnessData] = useState({
    id: '',
    name: '',
    cpf: '',
    rg: '',
  })

  const [files, setFiles] = useState<{ user?: File; new_user?: File; witness?: File }>({})
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [usersData, witData] = await Promise.all([
        pb.collection('users').getFullList({ sort: 'name' }),
        pb.collection('witnesses').getFullList({ sort: 'name' }),
      ])
      setProfiles(usersData)
      setWitnesses(witData)

      if (user) {
        const u = await pb.collection('users').getOne(user.id)
        if (u.settings?.configuracoes_ponto) {
          setPointRules({
            texto_explicativo: u.settings.configuracoes_ponto.texto_explicativo || '',
            desconto_almoco: u.settings.configuracoes_ponto.desconto_almoco ?? 1,
          })
        }
      }
    } catch (err: any) {
      setError('Erro ao carregar configurações: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    setIsAdmin(role === 'Admin')
  }, [user, role])

  const handleSave = async () => {
    try {
      const fd = new FormData()
      fd.append('name', formData.name)
      fd.append('email', formData.email)
      fd.append('role', formData.role)
      fd.append('cpf', formData.cpf)
      if (newPassword && (user?.id === formData.id || user?.email === formData.email)) {
        fd.append('password', newPassword)
        fd.append('passwordConfirm', newPassword)
      }
      if (files.user) fd.append('signature', files.user)

      await pb.collection('users').update(formData.id, fd)
      if (user) logAudit('users', formData.id, 'update', user.id, null, formData)

      toast({ title: 'Sucesso', description: 'Usuário atualizado com sucesso.' })
      setIsOpen(false)
      setNewPassword('')
      setFiles({})
      fetchData()
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' })
    }
  }

  const handleAddUser = async () => {
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      return toast({
        title: 'Atenção',
        description: 'Preencha os campos obrigatórios',
        variant: 'destructive',
      })
    }
    try {
      const fd = new FormData()
      fd.append('name', newUserData.name)
      fd.append('email', newUserData.email)
      fd.append('password', newUserData.password)
      fd.append('passwordConfirm', newUserData.password)
      fd.append('role', newUserData.role)
      fd.append('cpf', newUserData.cpf)
      if (files.new_user) fd.append('signature', files.new_user)

      await pb.collection('users').create(fd)
      toast({ title: 'Usuário adicionado com sucesso' })
      setIsAddOpen(false)
      setNewUserData({ name: '', email: '', password: '', role: 'Usuario', cpf: '' })
      setFiles({})
      fetchData()
    } catch (err: any) {
      toast({ title: 'Erro ao adicionar', description: err.message, variant: 'destructive' })
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!isAdmin) return toast({ title: 'Acesso Negado', variant: 'destructive' })
    if (!confirm('Deseja realmente excluir este usuário?')) return
    try {
      await pb.collection('users').delete(id)
      toast({ title: 'Usuário excluído' })
      fetchData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleSaveWitness = async () => {
    try {
      const fd = new FormData()
      fd.append('name', witnessData.name)
      fd.append('cpf', witnessData.cpf)
      fd.append('rg', witnessData.rg)
      if (files.witness) fd.append('signature', files.witness)

      if (witnessData.id) {
        await pb.collection('witnesses').update(witnessData.id, fd)
      } else {
        await pb.collection('witnesses').create(fd)
      }

      toast({ title: 'Sucesso', description: 'Testemunha salva.' })
      setIsWitnessOpen(false)
      setFiles({})
      fetchData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleSavePointRules = async () => {
    if (!user) return
    try {
      const currentUser = await pb.collection('users').getOne(user.id)
      const currentSettings = currentUser.settings || {}

      await pb.collection('users').update(user.id, {
        settings: {
          ...currentSettings,
          configuracoes_ponto: pointRules,
        },
      })
      toast({ title: 'Sucesso', description: 'Regras de ponto salvas com sucesso.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: 'user' | 'new_user' | 'witness',
  ) => {
    const f = e.target.files?.[0]
    if (f) setFiles((prev) => ({ ...prev, [key]: f }))
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4">
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
        <Button onClick={fetchData}>Tentar novamente</Button>
      </div>
    )
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
              <Button
                onClick={() => {
                  setIsAddOpen(true)
                  setFiles({})
                }}
              >
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
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.email}</TableCell>
                      <TableCell>{p.cpf}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {p.role === 'Admin' ? (
                            <Shield className="h-4 w-4 text-primary" />
                          ) : (
                            <UserIcon className="h-4 w-4" />
                          )}
                          {p.role}
                        </div>
                      </TableCell>
                      <TableCell>
                        {p.signature ? (
                          <img
                            src={pb.files.getUrl(p, p.signature)}
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
                              setFormData({
                                id: p.id,
                                name: p.name,
                                cpf: p.cpf || '',
                                email: p.email || '',
                                role: p.role,
                              })
                              setNewPassword('')
                              setFiles({})
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
                setWitnessData({ id: '', name: '', cpf: '', rg: '' })
                setFiles({})
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
                      <TableCell className="font-medium">{w.name}</TableCell>
                      <TableCell>{w.cpf}</TableCell>
                      <TableCell>{w.rg}</TableCell>
                      <TableCell>
                        {w.signature ? (
                          <img
                            src={pb.files.getUrl(w, w.signature)}
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
                            setWitnessData({ id: w.id, name: w.name, cpf: w.cpf, rg: w.rg || '' })
                            setFiles({})
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
                              await pb.collection('witnesses').delete(w.id)
                              fetchData()
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
                <Button variant="outline" className="relative">
                  <Upload className="h-4 w-4 mr-2" /> Upload{' '}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={(e) => handleFile(e, 'new_user')}
                  />
                </Button>
                {files.new_user && <span className="text-xs">{files.new_user.name}</span>}
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                <Button variant="outline" className="relative">
                  <Upload className="h-4 w-4 mr-2" /> Upload{' '}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={(e) => handleFile(e, 'user')}
                  />
                </Button>
                {files.user && <span className="text-xs">{files.user.name}</span>}
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
                value={witnessData.name}
                onChange={(e) => setWitnessData({ ...witnessData, name: e.target.value })}
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
                <Button variant="outline" className="relative">
                  <Upload className="h-4 w-4 mr-2" /> Upload{' '}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={(e) => handleFile(e, 'witness')}
                  />
                </Button>
                {files.witness && <span className="text-xs">{files.witness.name}</span>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWitnessOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveWitness} disabled={!witnessData.name || !witnessData.cpf}>
              Salvar Testemunha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
