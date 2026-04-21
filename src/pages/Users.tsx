import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Role } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { ShieldCheck, Plus, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function Users() {
  const [users, setUsers] = useState<any[]>([])
  const [isNewUserOpen, setIsNewUserOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('Usuário')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      checkAdmin()
      fetchUsers()
    }
  }, [user])

  const checkAdmin = async () => {
    if (!user) return
    const { data } = await supabase
      .from('hr_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    if (data?.role === 'Admin') {
      setIsAdmin(true)
    }
    setLoading(false)
  }

  const fetchUsers = async () => {
    const { data } = await supabase.from('hr_profiles').select('*').order('name')
    if (data) setUsers(data)
  }

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (!isAdmin) {
      toast({
        title: 'Acesso Negado',
        description: 'Apenas administradores podem alterar permissões.',
        variant: 'destructive',
      })
      return
    }
    await supabase.from('hr_profiles').update({ role: newRole }).eq('id', userId)
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
    toast({ title: 'Permissões Atualizadas', description: 'O acesso do usuário foi modificado.' })
  }

  const handleInvite = async () => {
    if (!isAdmin) return
    try {
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: { email: newEmail, name: newName, role: newRole },
      })

      if (error || (data && !data.success)) {
        throw new Error('Erro ao adicionar membro')
      }

      toast({
        title: 'Membro Adicionado',
        description: `${newName} foi adicionado à equipe com sucesso.`,
      })
      setIsNewUserOpen(false)
      setNewEmail('')
      setNewName('')
      fetchUsers()
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o membro. Verifique se o e-mail já existe.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8 text-muted-foreground">Carregando permissões...</div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Equipes</h1>
          <p className="text-muted-foreground mt-1">Controle de acesso e permissões do sistema</p>
        </div>
        {isAdmin && (
          <Dialog open={isNewUserOpen} onOpenChange={setIsNewUserOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-sm">
                <Plus className="h-4 w-4" /> Novo Membro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Membro à Equipe</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Maria Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    O usuário será criado instantaneamente (senha padrão).
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Perfil de Acesso</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Usuário">Usuário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setIsNewUserOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleInvite} disabled={!newEmail || !newName}>
                  Adicionar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!isAdmin && (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-md flex items-start gap-3 border border-blue-200">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold">Acesso Restrito</h4>
            <p className="text-sm mt-1">
              Você está visualizando a equipe em modo de leitura. Apenas administradores podem
              adicionar ou alterar permissões de membros.
            </p>
          </div>
        </div>
      )}

      <Card className="shadow-subtle border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead className="w-[200px]">Perfil de Acesso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Select
                      disabled={!isAdmin}
                      value={user.role}
                      onValueChange={(v) => handleRoleChange(user.id, v as Role)}
                    >
                      <SelectTrigger className="h-8 text-xs font-semibold w-32">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-3 w-3 opacity-50" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Usuário">Usuário</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
