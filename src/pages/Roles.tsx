import { useState, useEffect } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { AppContextType } from '@/lib/types'
import pb from '@/lib/pocketbase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
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
  SheetFooter,
} from '@/components/ui/sheet'
import { Trash2, Plus, ArrowLeft, Edit2, AlertCircle, Briefcase } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { logAudit } from '@/lib/audit'

export default function Roles() {
  const { company } = useOutletContext<AppContextType>()
  const { user } = useAuth()
  const [roles, setRoles] = useState<any[]>([])
  const [empId, setEmpId] = useState<string>('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [dailyRate, setDailyRate] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchRoles = async () => {
    setLoading(true)
    setError(null)
    try {
      const empList = await pb.collection('companies').getFullList({ filter: `name="${company}"` })
      const empData = empList[0]
      if (empData) {
        setEmpId(empData.id)
        const data = await pb.collection('roles').getFullList({
          filter: `company_id="${empData.id}"`,
          sort: 'title',
        })
        setRoles(data)
      } else {
        setRoles([])
      }
    } catch (err: any) {
      setError('Erro ao buscar cargos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [company])

  const handleHourlyChange = (val: string) => {
    let sanitized = val.replace(/[^0-9,]/g, '')
    if (sanitized.length > 1 && sanitized.startsWith('0') && !sanitized.startsWith('0,')) {
      sanitized = sanitized.replace(/^0+/, '')
      if (sanitized.startsWith(',')) sanitized = '0' + sanitized
    }
    setHourlyRate(sanitized)
    const h = parseFloat(sanitized.replace(',', '.'))
    if (!isNaN(h)) setDailyRate((h * 8).toFixed(2).replace('.', ','))
    else setDailyRate('')
  }

  const handleDailyChange = (val: string) => {
    let sanitized = val.replace(/[^0-9,]/g, '')
    if (sanitized.length > 1 && sanitized.startsWith('0') && !sanitized.startsWith('0,')) {
      sanitized = sanitized.replace(/^0+/, '')
      if (sanitized.startsWith(',')) sanitized = '0' + sanitized
    }
    setDailyRate(sanitized)
  }

  const handleFocus = (setter: (val: string) => void, val: string) => {
    if (val === '0' || val === '0,00' || val === '0.00' || val === '0,') setter('')
  }

  const handleEdit = (r: any) => {
    setEditingId(r.id)
    setName(r.title)
    setDescription(r.description || '')
    setLevel(r.level || '')
    setHourlyRate(r.hourly_rate ? r.hourly_rate.toString().replace('.', ',') : '')
    setDailyRate(r.daily_rate ? r.daily_rate.toString().replace('.', ',') : '')
    setIsSheetOpen(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setDescription('')
    setLevel('')
    setHourlyRate('')
    setDailyRate('')
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: 'Aviso',
        description: 'O título do cargo é obrigatório.',
        variant: 'destructive',
      })
      return
    }
    if (!empId) {
      toast({ title: 'Erro', description: 'Empresa não encontrada.', variant: 'destructive' })
      return
    }

    setIsSaving(true)
    const payload = {
      company_id: empId,
      title: name,
      description,
      level,
      hourly_rate: parseFloat(hourlyRate.replace(',', '.')) || 0,
      daily_rate: parseFloat(dailyRate.replace(',', '.')) || 0,
    }

    try {
      if (editingId) {
        await pb.collection('roles').update(editingId, payload)
        if (user && typeof logAudit === 'function')
          logAudit('roles', editingId, 'update', user.id, null, payload)
        toast({ title: 'Cargo atualizado com sucesso' })
      } else {
        const saved = await pb.collection('roles').create(payload)
        if (user && typeof logAudit === 'function')
          logAudit('roles', saved.id, 'create', user.id, null, payload)
        toast({ title: 'Cargo criado com sucesso' })
      }

      setIsSheetOpen(false)
      resetForm()
      fetchRoles()
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este cargo?')) return
    try {
      await pb.collection('roles').delete(id)
      if (user && typeof logAudit === 'function') logAudit('roles', id, 'delete', user.id)
      toast({ title: 'Cargo excluído' })
      fetchRoles()
    } catch (e: any) {
      toast({ title: 'Erro ao excluir', description: e.message, variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
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
        <Button onClick={fetchRoles}>Tentar novamente</Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/colaboradores">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cargos e Valores</h1>
          <p className="text-muted-foreground mt-1">Gerencie os cargos da {company}</p>
        </div>
        <div className="ml-auto">
          <Button
            onClick={() => {
              resetForm()
              setIsSheetOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Novo Cargo
          </Button>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editingId ? 'Editar Cargo' : 'Novo Cargo'}</SheetTitle>
            <SheetDescription>
              {editingId
                ? 'Atualize as informações do cargo selecionado.'
                : 'Preencha os detalhes para criar um novo cargo.'}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Título do Cargo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Pintor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Nível</Label>
              <Input
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="Ex: Junior, Pleno, Sênior"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva as responsabilidades deste cargo..."
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Valor Hora (R$)</Label>
                <Input
                  id="hourlyRate"
                  value={hourlyRate}
                  onChange={(e) => handleHourlyChange(e.target.value)}
                  onFocus={() => handleFocus(setHourlyRate, hourlyRate)}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailyRate">Valor Diária (R$)</Label>
                <Input
                  id="dailyRate"
                  value={dailyRate}
                  onChange={(e) => handleDailyChange(e.target.value)}
                  onFocus={() => handleFocus(setDailyRate, dailyRate)}
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsSheetOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
              {isSaving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Criar Cargo'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {roles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10 rounded-lg border border-dashed">
          <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Nenhum registro encontrado</p>
          <p className="text-muted-foreground mb-4">
            Adicione o primeiro cargo clicando no botão "Novo Cargo".
          </p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Cargo</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Valor Hora</TableHead>
                <TableHead>Valor Diária</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {r.title}
                    {r.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {r.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {r.level ? (
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        {r.level}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-primary">
                    {Number(r.hourly_rate).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </TableCell>
                  <TableCell className="font-mono text-primary">
                    {Number(r.daily_rate).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(r)}
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(r.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
