import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AppContextType } from '@/lib/types'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2, Plus, ArrowLeft, Edit2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { logAudit } from '@/lib/audit'

export default function Roles() {
  const { company } = useOutletContext<AppContextType>()
  const { user } = useAuth()
  const [roles, setRoles] = useState<any[]>([])
  const [empId, setEmpId] = useState<string>('')
  const [name, setName] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [dailyRate, setDailyRate] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchRoles = async () => {
    const { data: empData } = await supabase
      .from('empresa_contratante')
      .select('id')
      .eq('nome_fantasia', company)
      .single()
    if (empData) {
      setEmpId(empData.id)
      const { data } = await supabase
        .from('cargo')
        .select('*')
        .eq('empresa_id', empData.id)
        .order('nome')
      if (data) setRoles(data)
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
    setName(r.nome)
    setHourlyRate(r.valor_hora ? r.valor_hora.toString().replace('.', ',') : '')
    setDailyRate(r.valor_diaria ? r.valor_diaria.toString().replace('.', ',') : '')
  }

  const handleSave = async () => {
    if (!name || !empId) return
    const payload = {
      empresa_id: empId,
      nome: name,
      valor_hora: parseFloat(hourlyRate.replace(',', '.')) || 0,
      valor_diaria: parseFloat(dailyRate.replace(',', '.')) || 0,
      descricao_rich_text: {},
      ativo: true,
    }

    const newId = editingId || crypto.randomUUID()

    if (editingId) {
      await supabase
        .from('hr_roles')
        .update({ name, hourly_rate: payload.valor_hora, daily_rate: payload.valor_diaria })
        .eq('id', newId)
      await supabase.from('cargo').update(payload).eq('id', newId)
      if (user) logAudit('cargo', newId, 'update', user.id, null, payload)
      toast({ title: 'Cargo atualizado' })
    } else {
      await supabase
        .from('hr_roles')
        .insert({
          id: newId,
          company,
          name,
          hourly_rate: payload.valor_hora,
          daily_rate: payload.valor_diaria,
        })
      await supabase.from('cargo').insert({ id: newId, ...payload })
      if (user) logAudit('cargo', newId, 'create', user.id, null, payload)
      toast({ title: 'Cargo salvo' })
    }

    setName('')
    setHourlyRate('')
    setDailyRate('')
    setEditingId(null)
    fetchRoles()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este cargo?')) return
    await supabase.from('cargo').delete().eq('id', id)
    await supabase.from('hr_roles').delete().eq('id', id)
    if (user) logAudit('cargo', id, 'delete', user.id)
    fetchRoles()
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Editar Cargo' : 'Novo Cargo'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2 md:col-span-2">
              <Label>Nome do Cargo</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Pintor"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Hora (R$)</Label>
              <Input
                value={hourlyRate}
                onChange={(e) => handleHourlyChange(e.target.value)}
                onFocus={() => handleFocus(setHourlyRate, hourlyRate)}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Diária (R$)</Label>
              <Input
                value={dailyRate}
                onChange={(e) => handleDailyChange(e.target.value)}
                onFocus={() => handleFocus(setDailyRate, dailyRate)}
                placeholder="0,00"
              />
            </div>
            <div className="flex items-center gap-2 md:col-span-5">
              {editingId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingId(null)
                    setName('')
                    setHourlyRate('')
                    setDailyRate('')
                  }}
                >
                  Cancelar
                </Button>
              )}
              <Button className="w-full md:flex-1" onClick={handleSave} disabled={!name}>
                {editingId ? (
                  'Salvar Alterações'
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Cargo
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Cargo</TableHead>
              <TableHead>Valor Hora</TableHead>
              <TableHead>Valor Diária</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.nome}</TableCell>
                <TableCell className="font-mono text-primary">
                  {r.valor_hora.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell className="font-mono text-primary">
                  {r.valor_diaria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(r.id)}
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
    </div>
  )
}
