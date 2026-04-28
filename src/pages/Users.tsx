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
  const { toast } = useToast()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newUserData, setNewUserData] = useState({ name: '', email: '', role: 'Colaborador' })

  const fetchProfiles = async () => {
    const { data } = await supabase.from('usuario_sistema').select('*').order('nome_completo')
    if (data) setProfiles(data)
    if (user) {
      const currentUserProfile = data?.find((p) => p.id === user.id)
      setIsAdmin(currentUserProfile?.tipo_usuario === 'Admin')
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [user])

  const handleDelete = async (id: string) => {
    if (!isAdmin) return toast({ title: 'Acesso Negado', variant: 'destructive' })
    if (!confirm('Deseja realmente excluir este usuário?')) return
    await supabase.from('usuario_sistema').delete().eq('id', id)
    toast({ title: 'Usuário excluído' })
    fetchProfiles()
  }

  const handleAddUser = async () => {
    if (!newUserData.name || !newUserData.email) return
    const { data, error } = await supabase.functions.invoke('invite-user', { body: newUserData })
    if (error || data?.error)
      toast({
        title: 'Erro ao adicionar',
        description: error?.message || data?.error,
        variant: 'destructive',
      })
    else {
      toast({ title: 'Usuário adicionado com sucesso' })
      setIsAddOpen(false)
      setNewUserData({ name: '', email: '', role: 'Colaborador' })
      fetchProfiles()
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Equipes</h1>
          <p className="text-muted-foreground mt-1">Convidar usuários para o sistema</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Membro
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
                <TableHead>Perfil</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nome_completo}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {p.tipo_usuario === 'Admin' ? (
                        <Shield className="h-4 w-4 text-primary" />
                      ) : (
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                      )}{' '}
                      {p.tipo_usuario}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {isAdmin && p.id !== user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(p.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar Membro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
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
              <Label>Perfil</Label>
              <Select
                value={newUserData.role}
                onValueChange={(v) => setNewUserData({ ...newUserData, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Colaborador">Colaborador</SelectItem>
                  <SelectItem value="Admin">Administrador</SelectItem>
                  <SelectItem value="Coordenadora">Coordenadora</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddUser} disabled={!newUserData.name || !newUserData.email}>
              Adicionar e Enviar E-mail
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
