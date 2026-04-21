import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, Shield, User as UserIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export default function Users() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newUserData, setNewUserData] = useState({ name: '', email: '', role: 'Usuário' })

  const fetchProfiles = async () => {
    setLoading(true)
    const { data } = await supabase.from('hr_profiles').select('*').order('name')
    if (data) setProfiles(data)

    if (user) {
      const currentUserProfile = data?.find((p) => p.id === user.id)
      setIsAdmin(currentUserProfile?.role === 'Admin')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProfiles()
  }, [user])

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      toast({
        title: 'Acesso Negado',
        description: 'Apenas administradores podem excluir usuários.',
        variant: 'destructive',
      })
      return
    }
    if (!confirm('Deseja realmente excluir este usuário? O acesso dele será revogado.')) return

    const { error } = await supabase.from('hr_profiles').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
    } else {
      toast({
        title: 'Usuário excluído',
        description: 'O membro foi removido da equipe com sucesso.',
      })
      fetchProfiles()
    }
  }

  const handleAddUser = async () => {
    if (!newUserData.name || !newUserData.email) return

    const { data, error } = await supabase.functions.invoke('invite-user', {
      body: newUserData,
    })

    if (error || data?.error) {
      toast({
        title: 'Erro ao adicionar usuário',
        description: error?.message || data?.error,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Usuário adicionado com sucesso' })
      setIsAddOpen(false)
      setNewUserData({ name: '', email: '', role: 'Usuário' })
      fetchProfiles()
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Equipes</h1>
          <p className="text-muted-foreground mt-1">Gerencie os acessos ao sistema</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Membro
          </Button>
        )}
      </div>

      <Card className="shadow-subtle border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.email}</TableCell>
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
                  <TableCell className="text-right">
                    {isAdmin && p.id !== user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(p.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Membro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                placeholder="Ex: João Silva"
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="joao@exemplo.com"
                type="email"
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
                  <SelectItem value="Usuário">Usuário</SelectItem>
                  <SelectItem value="Admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddUser} disabled={!newUserData.name || !newUserData.email}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
