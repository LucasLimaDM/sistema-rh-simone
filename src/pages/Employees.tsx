import { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AppContextType } from '@/lib/types'
import { mockEmployees } from '@/lib/mock'
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Search, Plus, FileText, UserCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function Employees() {
  const { company } = useOutletContext<AppContextType>()
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  const filtered = useMemo(() => {
    return mockEmployees.filter(
      (e) => e.company === company && e.name.toLowerCase().includes(search.toLowerCase()),
    )
  }, [company, search])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Colaboradores</h1>
          <p className="text-muted-foreground mt-1">Gerencie os funcionários da {company}</p>
        </div>
        <EmployeeFormSheet
          onSave={() => toast({ title: 'Sucesso', description: 'Colaborador salvo com sucesso.' })}
        />
      </div>

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
                <TableHead>Nome</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Status Documentos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((emp) => (
                <TableRow key={emp.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium flex items-center gap-2">
                    <UserCircle className="h-8 w-8 text-muted-foreground opacity-50" />
                    {emp.name}
                  </TableCell>
                  <TableCell>{emp.contract}</TableCell>
                  <TableCell>{emp.role}</TableCell>
                  <TableCell>
                    <StatusBadge status={emp.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary font-medium hover:text-primary hover:bg-primary/10"
                    >
                      Ver Perfil
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum colaborador encontrado.
                  </TableCell>
                </TableRow>
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

function EmployeeFormSheet({ onSave }: { onSave: () => void }) {
  const [birthDate, setBirthDate] = useState('')

  const isUnder18 = useMemo(() => {
    if (!birthDate) return false
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear()
    return age < 18
  }, [birthDate])

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Novo Colaborador
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Cadastrar Colaborador</SheetTitle>
          <SheetDescription>Preencha os dados pessoais e os documentos exigidos.</SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">
              Dados Pessoais
            </h4>
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input placeholder="Ex: João da Silva" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input placeholder="000.000.000-00" />
              </div>
              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
                {isUnder18 && (
                  <p className="text-xs text-destructive animate-fade-in">
                    Deve ter +18 anos (Regra 05).
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">
              Documentos Base
            </h4>
            <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">ASO</span>
                </div>
                <Input type="date" className="w-[150px] h-8 text-sm" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">NR-35</span>
                </div>
                <Input type="date" className="w-[150px] h-8 text-sm" />
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-4">
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button disabled={isUnder18} onClick={onSave}>
              Salvar Colaborador
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
