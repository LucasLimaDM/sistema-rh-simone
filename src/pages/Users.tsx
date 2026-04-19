import { useState } from 'react'
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
import { mockUsers } from '@/lib/mock'
import { Role } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { ShieldCheck } from 'lucide-react'

export default function Users() {
  const [users, setUsers] = useState(mockUsers)
  const { toast } = useToast()

  const handleRoleChange = (userId: string, newRole: Role) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
    toast({ title: 'Permissões Atualizadas', description: 'O acesso do usuário foi modificado.' })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
        <p className="text-muted-foreground mt-1">Controle de acesso e permissões do sistema</p>
      </div>

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
                <TableRow key={user.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(v) => handleRoleChange(user.id, v as Role)}
                    >
                      <SelectTrigger className="h-8 text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-3 w-3 opacity-50" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Coordenadora">Coordenadora</SelectItem>
                        <SelectItem value="Encarregado">Encarregado</SelectItem>
                        <SelectItem value="Colaborador">Colaborador</SelectItem>
                        <SelectItem value="NovoUsuario">Novo Usuário</SelectItem>
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
