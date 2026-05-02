import { useState, useEffect, useMemo } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Download, Send, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format, getDaysInMonth, isWeekend } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

// Feriados fixos básicos
const getHolidays = (year: number) => [
  `${year}-01-01`,
  `${year}-04-21`,
  `${year}-05-01`,
  `${year}-09-07`,
  `${year}-10-12`,
  `${year}-11-02`,
  `${year}-11-15`,
  `${year}-12-25`,
]

function calculateHours(in1: string, out1: string, in2: string, out2: string) {
  let total = 0

  const timeToHours = (t: string) => {
    if (!t || t.length < 4) return 0
    const [h, m] = t.split(':').map(Number)
    if (isNaN(h) || isNaN(m)) return 0
    return h + m / 60
  }

  const tIn1 = timeToHours(in1)
  const tOut1 = timeToHours(out1)
  const tIn2 = timeToHours(in2)
  const tOut2 = timeToHours(out2)

  if (in1 && out1 && in2 && out2) {
    if (tOut1 > tIn1) total += tOut1 - tIn1
    if (tOut2 > tIn2) total += tOut2 - tIn2
  } else if (in1 && out1 && !in2 && !out2) {
    if (tOut1 > tIn1) {
      total = tOut1 - tIn1
      if (total > 6) total -= 1 // Desconta 1h almoço para jornadas maiores que 6h
    }
  } else if (in1 && out2 && !out1 && !in2) {
    if (tOut2 > tIn1) {
      total = tOut2 - tIn1
      if (total > 6) total -= 1 // Desconta 1h almoço para jornadas maiores que 6h
    }
  } else {
    if (in1 && out1 && tOut1 > tIn1) total += tOut1 - tIn1
    if (in2 && out2 && tOut2 > tIn2) total += tOut2 - tIn2
  }

  return total > 0 ? total : 0
}

const handleTimeMask = (val: string) => {
  let v = val.replace(/\D/g, '')
  if (v.length > 4) v = v.slice(0, 4)
  if (v.length > 2) v = v.slice(0, 2) + ':' + v.slice(2)
  return v
}

export default function TimeTracking() {
  const { company } = useOutletContext<AppContextType>()
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [grid, setGrid] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    supabase
      .from('empresa_contratante')
      .select('id')
      .eq('nome_fantasia', company)
      .single()
      .then(({ data: empData }) => {
        if (empData) {
          supabase
            .from('colaborador')
            .select(
              'id, nome_completo, cargo_nome_snapshot, valor_hora_snapshot, valor_diaria_snapshot, cargo(valor_hora, valor_diaria)',
            )
            .eq('empresa_id', empData.id)
            .order('nome_completo')
            .then(({ data }) => {
              if (data) {
                setEmployees(
                  data.map((e: any) => ({
                    id: e.id,
                    name: e.nome_completo,
                    role: e.cargo_nome_snapshot,
                    hr_roles: {
                      hourly_rate: e.cargo?.valor_hora || e.valor_hora_snapshot || 0,
                      daily_rate: e.cargo?.valor_diaria || e.valor_diaria_snapshot || 0,
                    },
                  })),
                )
              }
            })
        }
      })
  }, [company])

  useEffect(() => {
    if (!selectedEmpId || !month) return
    loadGrid()
  }, [selectedEmpId, month])

  const loadGrid = async () => {
    const [y, m] = month.split('-')
    const yearNum = parseInt(y)
    const monthNum = parseInt(m)
    const daysCount = getDaysInMonth(new Date(yearNum, monthNum - 1))

    const startDate = `${month}-01`
    const endDate = `${month}-${String(daysCount).padStart(2, '0')}`

    const { data: tracks } = await supabase
      .from('time_tracks')
      .select('*')
      .eq('employee_id', selectedEmpId)
      .gte('track_date', startDate)
      .lte('track_date', endDate)

    const trackMap = new Map()
    if (tracks) tracks.forEach((t) => trackMap.set(t.track_date, t))

    const holidays = getHolidays(yearNum)
    const todayStr = format(new Date(), 'yyyy-MM-dd')

    const newGrid = []
    for (let d = 1; d <= daysCount; d++) {
      const dateStr = `${month}-${String(d).padStart(2, '0')}`
      const dateObj = new Date(yearNum, monthNum - 1, d)
      const existing = trackMap.get(dateStr)

      newGrid.push({
        date: dateStr,
        dateObj,
        isWeekend: isWeekend(dateObj),
        isHoliday: holidays.includes(dateStr),
        isToday: dateStr === todayStr,
        id: existing?.id,
        in1: existing?.in1?.slice(0, 5) || '',
        out1: existing?.out1?.slice(0, 5) || '',
        in2: existing?.in2?.slice(0, 5) || '',
        out2: existing?.out2?.slice(0, 5) || '',
        total_hours: existing?.total_hours || 0,
        saving: false,
      })
    }
    setGrid(newGrid)
  }

  const selectedEmpData = employees.find((e) => e.id === selectedEmpId)
  const roleInfo = selectedEmpData?.hr_roles || { hourly_rate: 0, daily_rate: 0 }
  const hourlyRate = parseFloat(roleInfo.hourly_rate || 0)
  const dailyRate = parseFloat(roleInfo.daily_rate || 0)

  const stats = useMemo(() => {
    let totalHours = 0
    let totalValue = 0
    let workingDays = 0
    let weekends = 0
    let holidays = 0

    grid.forEach((row) => {
      if (row.isWeekend) weekends++
      else if (row.isHoliday) holidays++
      else workingDays++

      totalHours += row.total_hours
      totalValue += row.total_hours * hourlyRate
    })

    return { totalHours, totalValue, workingDays, weekends, holidays }
  }, [grid, hourlyRate])

  const handleChange = (index: number, field: string, value: string) => {
    const newGrid = [...grid]
    newGrid[index][field] = value
    const row = newGrid[index]
    row.total_hours = calculateHours(row.in1, row.out1, row.in2, row.out2)
    setGrid(newGrid)
  }

  const handleBlur = async (index: number) => {
    const row = grid[index]

    if (!row.in1 && !row.out1 && !row.in2 && !row.out2 && !row.id) return

    const newGrid = [...grid]
    newGrid[index].saving = true
    setGrid(newGrid)

    const payload = {
      employee_id: selectedEmpId,
      track_date: row.date,
      in1: row.in1 || null,
      out1: row.out1 || null,
      in2: row.in2 || null,
      out2: row.out2 || null,
      total_hours: parseFloat(row.total_hours.toFixed(2)),
    }
    if (row.id) {
      if (!row.in1 && !row.out1 && !row.in2 && !row.out2) {
        await supabase.from('time_tracks').delete().eq('id', row.id)
        newGrid[index].id = undefined
      } else {
        await supabase.from('time_tracks').update(payload).eq('id', row.id)
      }
    } else {
      const { data } = await supabase.from('time_tracks').insert(payload).select('id').single()
      if (data) newGrid[index].id = data.id
    }

    newGrid[index].saving = false
    setGrid(newGrid)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Folha Mensal</h1>
          <p className="text-muted-foreground mt-1">Controle de jornada e fechamento</p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-40 bg-card"
          />
          <ExportDialog />
        </div>
      </div>

      <Card className="shadow-subtle border-border bg-gradient-to-br from-card to-muted/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 space-y-2">
              <Label>Selecione o Colaborador</Label>
              <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEmpData && (
              <div className="w-full md:w-2/3 bg-background p-4 rounded-lg flex flex-wrap gap-6 items-center justify-between border">
                <div>
                  <h2 className="font-semibold text-lg">{selectedEmpData.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedEmpData.role}</p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Valor Hora</p>
                    <p className="font-mono font-medium text-primary">
                      {hourlyRate.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Diária (8h)</p>
                    <p className="font-mono font-medium text-primary">
                      {dailyRate.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedEmpId && grid.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Horas</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-2xl font-bold">
                {stats.totalHours.toFixed(1)}h
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm text-primary">Valor Total</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-2xl font-bold text-primary">
                {stats.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm text-muted-foreground">Dias Úteis</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-2xl font-bold">{stats.workingDays}</CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm text-muted-foreground">Fins de Semana</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-2xl font-bold">{stats.weekends}</CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm text-muted-foreground">Feriados</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-2xl font-bold">{stats.holidays}</CardContent>
            </Card>
          </div>

          <Card className="shadow-subtle border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[180px]">Data</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Ida Almoço</TableHead>
                    <TableHead>Volta Almoço</TableHead>
                    <TableHead>Saída</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-right">Valor (R$)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grid.map((row, idx) => (
                    <TableRow
                      key={row.date}
                      className={cn('transition-colors', {
                        'bg-red-50/50 dark:bg-red-950/20': row.isHoliday,
                        'bg-slate-50 dark:bg-slate-900/20': row.isWeekend && !row.isHoliday,
                        'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-l-yellow-400':
                          row.isToday,
                      })}
                    >
                      <TableCell className="font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn({
                              'text-yellow-600 dark:text-yellow-400': row.isToday,
                              'text-red-600 dark:text-red-400': row.isHoliday,
                            })}
                          >
                            {format(row.dateObj, 'dd/MM/yy, EEEE', { locale: ptBR })}
                          </span>
                          {row.isHoliday && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 rounded uppercase font-semibold">
                              Feriado
                            </span>
                          )}
                          {row.saving && (
                            <Save className="h-3 w-3 animate-pulse text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          placeholder="00:00"
                          maxLength={5}
                          value={row.in1}
                          onChange={(e) => handleChange(idx, 'in1', handleTimeMask(e.target.value))}
                          onBlur={() => handleBlur(idx)}
                          className={cn('h-8 w-20 text-xs font-mono text-center', {
                            'bg-yellow-100/50 border-yellow-300 dark:bg-yellow-900/30': row.isToday,
                          })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          placeholder="00:00"
                          maxLength={5}
                          value={row.out1}
                          onChange={(e) =>
                            handleChange(idx, 'out1', handleTimeMask(e.target.value))
                          }
                          onBlur={() => handleBlur(idx)}
                          className={cn('h-8 w-20 text-xs font-mono text-center', {
                            'bg-yellow-100/50 border-yellow-300 dark:bg-yellow-900/30': row.isToday,
                          })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          placeholder="00:00"
                          maxLength={5}
                          value={row.in2}
                          onChange={(e) => handleChange(idx, 'in2', handleTimeMask(e.target.value))}
                          onBlur={() => handleBlur(idx)}
                          className={cn('h-8 w-20 text-xs font-mono text-center', {
                            'bg-yellow-100/50 border-yellow-300 dark:bg-yellow-900/30': row.isToday,
                          })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          placeholder="00:00"
                          maxLength={5}
                          value={row.out2}
                          onChange={(e) =>
                            handleChange(idx, 'out2', handleTimeMask(e.target.value))
                          }
                          onBlur={() => handleBlur(idx)}
                          className={cn('h-8 w-20 text-xs font-mono text-center', {
                            'bg-yellow-100/50 border-yellow-300 dark:bg-yellow-900/30': row.isToday,
                          })}
                        />
                      </TableCell>
                      <TableCell className="text-center font-bold text-slate-700 dark:text-slate-300">
                        {row.total_hours > 0 ? `${row.total_hours.toFixed(2)}h` : '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium text-primary">
                        {row.total_hours > 0
                          ? (row.total_hours * hourlyRate).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

function ExportDialog() {
  const { toast } = useToast()
  const handleExport = (type: string) => {
    toast({ title: `Relatório Gerado`, description: `Ação: ${type} completada.` })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Exportar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar Folha de Ponto</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Escolha como deseja exportar o relatório consolidado.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => handleExport('Download PDF')}
              >
                <Download className="h-6 w-6 text-primary" />
                Baixar PDF
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => handleExport('Enviar Email')}
              >
                <Send className="h-6 w-6 text-accent" />
                Enviar por E-mail
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
