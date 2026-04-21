import { useState, useMemo, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AppContextType } from '@/lib/types'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Plus, UserCircle, Trash2, Edit2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { EmployeeFormSheet } from '@/components/employees/employee-form-sheet'

export default function Employees() {
  const { company } = useOutletContext<AppContextType>()
  const [search, setSearch] = useState('')
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingEmp, setEditingEmp] = useState<any>(null)
  const { toast } = useToast()

  const fetchEmployees = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('employees')
      .select('*, employee_documents(*)')
      .eq('company', company)
      .order('name', { ascending: true })

    if (data) {
      const formatted = data.map((emp) => {
        const docs = emp.employee_documents || []
        let status = 'up-to-date'
        docs.forEach((d: any) => {
          if (!d.expiry_date) return
          const exp = new Date(d.expiry_date)
          const now = new Date()
          if (exp < now) status = 'expired'
          else if (exp < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) && status !== 'expired')
            status = 'expiring'
        })
        return { ...emp, status }
      })
      setEmployees(formatted)
    }
    setLoading(false)
    setSelectedIds([])
  }

  useEffect(() => {
    fetchEmployees()
  }, [company])

  const filtered = useMemo(() => {
    return employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
  }, [employees, search])

  const handleOpenNew = () => {
    setEditingEmp(null)
    setIsSheetOpen(true)
  }

  const handleOpenEdit = (emp: any) => {
    setEditingEmp(emp)
    setIsSheetOpen(true)
  }

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return
    if (!confirm('Deseja excluir os colaboradores selecionados?')) return
    await supabase.from('employees').delete().in('id', selectedIds)
    toast({ title: 'Excluídos com sucesso' })
    fetchEmployees()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este colaborador?')) return
    await supabase.from('employees').delete().eq('id', id)
    toast({ title: 'Excluído com sucesso' })
    fetchEmployees()
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(filtered.map((f) => f.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Colaboradores</h1>
          <p className="text-muted-foreground mt-1">Gerencie os funcionários da {company}</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelected} className="gap-2">
              <Trash2 className="h-4 w-4" /> Excluir ({selectedIds.length})
            </Button>
          )}
          <Button onClick={handleOpenNew} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" /> Novo Colaborador
          </Button>
        </div>
      </div>

      <EmployeeFormSheet
        open={isSheetOpen}
        setOpen={setIsSheetOpen}
        company={company}
        employeeToEdit={editingEmp}
        onSave={() => {
          fetchEmployees()
          toast({ title: 'Sucesso', description: 'Dados salvos com sucesso.' })
        }}
      />

      <Card className="shadow-subtle border-border">
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-muted/50 border-none"
              />
            </div>
          </div>
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Vínculo</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Status Documentos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((emp) => (
                <TableRow key={emp.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(emp.id)}
                      onCheckedChange={() => toggleSelect(emp.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-8 w-8 text-muted-foreground opacity-50" />
                      <div>
                        <p>{emp.name}</p>
                        {emp.cpf && (
                          <p className="text-xs text-muted-foreground font-normal">
                            CPF: {emp.cpf}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-0.5">
                      {emp.phone && <p>{emp.phone}</p>}
                      {emp.email && <p className="text-muted-foreground">{emp.email}</p>}
                    </div>
                  </TableCell>
                  <TableCell>{emp.contract_type}</TableCell>
                  <TableCell>{emp.role}</TableCell>
                  <TableCell>
                    <StatusBadge status={emp.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(emp)}
                        className="text-primary hover:bg-primary/10"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(emp.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : (
                filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum colaborador encontrado.
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn('px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap', {
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':
          status === 'up-to-date',
        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400':
          status === 'expiring',
        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': status === 'expired',
      })}
    >
      {status === 'up-to-date' ? 'Em dia' : status === 'expiring' ? 'A Vencer' : 'Vencido'}
    </span>
  )
}
