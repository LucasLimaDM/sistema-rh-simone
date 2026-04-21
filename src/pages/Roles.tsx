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
import { Trash2, Plus, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'

export default function Roles() {
  const { company } = useOutletContext<AppContextType>()
  const [roles, setRoles] = useState<any[]>([])
  const [name, setName] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [dailyRate, setDailyRate] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchRoles = async () => {
    const { data } = await supabase
      .from('hr_roles')
      .select('*')
      .eq('company', company)
      .order('name')
    if (data) setRoles(data)
  }

  useEffect(() => {
    fetchRoles()
  }, [company])

  const handleHourlyChange = (val: string) => {
    setHourlyRate(val)
    const h = parseFloat(val.replace(',', '.'))
    if (!isNaN(h)) {
      setDailyRate((h * 8).toFixed(2))
    }
  }

  const handleSave = async () => {
    if (!name) return
    setLoading(true)
    const { error } = await supabase.from('hr_roles').insert({
      company,
      name,
      hourly_rate: parseFloat(hourlyRate.replace(',', '.')) || 0,
      daily_rate: parseFloat(dailyRate.replace(',', '.')) || 0,
    })
    if (!error) {
      toast({ title: 'Cargo salvo com sucesso' })
      setName('')
      setHourlyRate('')
      setDailyRate('')
      fetchRoles()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este cargo?')) return
    await supabase.from('hr_roles').delete().eq('id', id)
    fetchRoles()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/colaboradores">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cargos e Valores</h1>
          <p className="text-muted-foreground mt-1">Gerencie os cargos e taxas da {company}</p>
        </div>
      </div>

      <Card className="shadow-subtle border-border">
        <CardHeader>
          <CardTitle>Novo Cargo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2 md:col-span-2">
              <Label>Nome do Cargo</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Pintor, Auxiliar..."
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Hora (R$)</Label>
              <Input
                value={hourlyRate}
                onChange={(e) => handleHourlyChange(e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Diária (R$)</Label>
              <Input
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.01"
              />
            </div>
            <Button
              className="w-full md:col-span-4"
              onClick={handleSave}
              disabled={loading || !name}
            >
              <Plus className="h-4 w-4 mr-2" /> Adicionar Cargo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-subtle border-border overflow-hidden">
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
              <TableRow key={r.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="font-mono text-primary">
                  R$ {r.hourly_rate.toFixed(2)}
                </TableCell>
                <TableCell className="font-mono text-primary">
                  R$ {r.daily_rate.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(r.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {roles.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhum cargo cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
