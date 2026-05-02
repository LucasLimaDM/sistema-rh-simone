import { useState, useMemo, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AppContextType } from '@/lib/types'
import { supabase } from '@/lib/supabase/client'
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
import { Search, Plus, UserCircle, Trash2, Edit2, Briefcase } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { EmployeeFormSheet } from '@/components/employees/employee-form-sheet'
import { Link } from 'react-router-dom'
import { logAudit } from '@/lib/audit'
import { useAuth } from '@/hooks/use-auth'

function getRemunerationSuffix(cargoName: string) {
  if (!cargoName) return '/h'
  const dailyRoles = [
    'coordenador',
    'diretor',
    'supervisor',
    'assistente administrativo',
    'encarregado de almoxarifado',
    'representante comercial',
  ]
  const normalized = cargoName.toLowerCase()
  return dailyRoles.some((r) => normalized.includes(r)) ? '/dia' : '/h'
}

export default function Employees() {
  const { company } = useOutletContext<AppContextType>()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [employees, setEmployees] = useState<any[]>([])
  const [empresaId, setEmpresaId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingEmp, setEditingEmp] = useState<any>(null)
  const { toast } = useToast()

  const fetchEmployees = async () => {
    setLoading(true)
    const { data: empData } = await supabase
      .from('empresa_contratante')
      .select('id')
      .eq('nome_fantasia', company)
      .single()

    if (empData) {
      setEmpresaId(empData.id)
      const { data: allEmpsRaw } = await supabase
        .from('colaborador')
        .select('*, cargo(nome, valor_hora, valor_diaria)')
        .order('nome_completo')

      if (allEmpsRaw) {
        const data = allEmpsRaw.filter((e) => {
          const vinculadas = e.dados_dinamicos?.empresas_vinculadas || []
          return e.empresa_id === empData.id || vinculadas.includes(empData.id)
        })

        const empIds = data.map((e) => e.id)
        const { data: docs } = await supabase
          .from('employee_documents')
          .select('*')
          .in('employee_id', empIds)

        const formatted = data.map((emp) => {
          const eDocs = docs?.filter((d) => d.employee_id === emp.id) || []
          let status = 'up-to-date'
          eDocs.forEach((d: any) => {
            if (!d.expiry_date) return
            const exp = new Date(d.expiry_date)
            const now = new Date()
            if (exp < now) status = 'expired'
            else if (
              exp < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) &&
              status !== 'expired'
            )
              status = 'expiring'
          })
          return {
            ...emp,
            status,
            invite_status: emp.dados_dinamicos?.invite_status || 'Não Convidado',
            employee_documents: eDocs,
          }
        })
        setEmployees(formatted)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEmployees()
  }, [company])

  const filtered = useMemo(
    () => employees.filter((e) => e.nome_completo.toLowerCase().includes(search.toLowerCase())),
    [employees, search],
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este colaborador?')) return
    await supabase.from('colaborador').delete().eq('id', id)
    await supabase.from('employees').delete().eq('id', id)
    if (user) await logAudit('colaborador', id, 'delete', user.id)
    toast({ title: 'Excluído com sucesso' })
    fetchEmployees()
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
        onSave={() => {
          fetchEmployees()
          toast({ title: 'Salvo com sucesso' })
        }}
      />

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
                <TableHead>Vínculo</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Documentos</TableHead>
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
                        <p>{emp.nome_completo}</p>
                        {emp.cpf && <p className="text-xs text-muted-foreground">CPF: {emp.cpf}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-0.5">
                      {emp.telefone && <p>{emp.telefone}</p>}
                      {emp.email && <p className="text-muted-foreground">{emp.email}</p>}
                    </div>
                  </TableCell>
                  <TableCell>{emp.tipo_colaborador}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {emp.cargo_nome_snapshot || emp.cargo?.nome || 'Não definido'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {Number(
                          getRemunerationSuffix(emp.cargo_nome_snapshot || emp.cargo?.nome) ===
                            '/dia'
                            ? emp.valor_diaria_snapshot || emp.cargo?.valor_diaria || 0
                            : emp.valor_hora_snapshot || emp.cargo?.valor_hora || 0,
                        ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        {getRemunerationSuffix(emp.cargo_nome_snapshot || emp.cargo?.nome)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={emp.status} />
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
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn('px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap', {
        'bg-green-100 text-green-700': status === 'up-to-date',
        'bg-orange-100 text-orange-700': status === 'expiring',
        'bg-red-100 text-red-700': status === 'expired',
      })}
    >
      {status === 'up-to-date' ? 'Em dia' : status === 'expiring' ? 'A Vencer' : 'Vencido'}
    </span>
  )
}
