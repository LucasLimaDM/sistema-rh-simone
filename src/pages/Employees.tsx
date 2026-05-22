import { useState, useMemo, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AppContextType } from '@/lib/types'
import pb from '@/lib/pocketbase/client'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Plus, UserCircle, Trash2, Edit2, Briefcase, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { EmployeeFormSheet } from '@/components/employees/employee-form-sheet'
import { Link } from 'react-router-dom'
import { logAudit } from '@/lib/audit'
import { useAuth } from '@/hooks/use-auth'

export default function Employees() {
  const { company } = useOutletContext<AppContextType>()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [employees, setEmployees] = useState<any[]>([])
  const [empresaId, setEmpresaId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingEmp, setEditingEmp] = useState<any>(null)
  const { toast } = useToast()

  const fetchEmployees = async () => {
    setLoading(true)
    setError(null)
    try {
      const empList = await pb.collection('companies').getFullList({ filter: `name="${company}"` })
      const empData = empList[0]

      if (empData) {
        setEmpresaId(empData.id)
        const allEmpsRaw = await pb.collection('collaborators').getFullList({
          filter: `company_id = "${empData.id}"`,
          expand: 'role_id',
          sort: 'name',
        })
        setEmployees(allEmpsRaw)
      } else {
        setEmployees([])
      }
    } catch (err: any) {
      setError('Erro ao carregar colaboradores: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [company])

  const filtered = useMemo(
    () => employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase())),
    [employees, search],
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este colaborador?')) return
    try {
      await pb.collection('collaborators').delete(id)
      if (user) await logAudit('collaborators', id, 'delete', user.id)
      toast({ title: 'Excluído com sucesso' })
      fetchEmployees()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
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
        <Button onClick={fetchEmployees}>Tentar novamente</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Colaboradores</h1>
          <p className="text-muted-foreground mt-1">Gerencie os funcionários da {company}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/cargos">
            <Button variant="outline" className="gap-2">
              <Briefcase className="h-4 w-4" /> Cargos
            </Button>
          </Link>
          <Button
            onClick={() => {
              setEditingEmp(null)
              setIsSheetOpen(true)
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Novo Colaborador
          </Button>
        </div>
      </div>

      <EmployeeFormSheet
        open={isSheetOpen}
        setOpen={setIsSheetOpen}
        company={company}
        empresaId={empresaId}
        employeeToEdit={editingEmp}
        onSave={() => fetchEmployees()}
      />

      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10 rounded-lg border border-dashed mt-6">
          <UserCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Nenhum registro encontrado</p>
          <p className="text-muted-foreground mb-4">
            Adicione colaboradores a esta empresa para começar.
          </p>
          <Button
            onClick={() => {
              setEditingEmp(null)
              setIsSheetOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Adicionar
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b relative max-w-md">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 ml-4 bg-muted/50 border-none"
              />
            </div>
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-8 w-8 text-muted-foreground opacity-50" />
                        <div>
                          <p>{emp.name}</p>
                          {emp.cpf && (
                            <p className="text-xs text-muted-foreground">CPF: {emp.cpf}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-0.5">{emp.email && <p>{emp.email}</p>}</div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap',
                          emp.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                        )}
                      >
                        {emp.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {emp.expand?.role_id?.title || 'Não definido'}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {Number(emp.expand?.role_id?.hourly_rate || 0).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                          /h
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingEmp(emp)
                            setIsSheetOpen(true)
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(emp.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
