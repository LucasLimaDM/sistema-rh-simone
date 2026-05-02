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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Download, Send, Save, Check, ChevronsUpDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format, getDaysInMonth, isWeekend } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

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

function calculateHours(in1: string, out1: string, in2: string, out2: string, rules: any) {
  const roundTime = (timeStr: string) => {
    if (!timeStr || timeStr.length < 4) return null
    const [hStr, mStr] = timeStr.split(':')
    let h = parseInt(hStr, 10)
    let m = parseInt(mStr, 10)
    if (isNaN(h) || isNaN(m)) return null

    if (m >= 0 && m <= 10) m = 0
    else if (m >= 11 && m <= 40) m = 30
    else if (m >= 41 && m <= 59) {
      m = 0
      h += 1
    }
    return h + m / 60
  }

  const start = roundTime(in1)
  let end = roundTime(out2)
  if (end === null) end = roundTime(out1)

  if (start !== null && end !== null && end > start) {
    let gross = end - start
    const desconto = rules?.desconto_almoco !== undefined ? parseFloat(rules.desconto_almoco) : 1

    // Desconta o almoço se a jornada for razoavelmente longa (ex: 5h ou mais)
    if (gross >= 5 && desconto > 0) {
      gross -= desconto
    }
    return gross > 0 ? gross : 0
  }
  return 0
}

const handleTimeMask = (val: string) => {
  let v = val.replace(/\D/g, '')
  if (v.length > 4) v = v.slice(0, 4)
  if (v.length > 2) v = v.slice(0, 2) + ':' + v.slice(2)
  return v
}

export default function TimeTracking() {
  const { company } = useOutletContext<AppContextType>()
  const { user } = useAuth()
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [empOpen, setEmpOpen] = useState(false)
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [grid, setGrid] = useState<any[]>([])
  const [pointRules, setPointRules] = useState<any>({ desconto_almoco: 1 })
  const { toast } = useToast()

  const currentYear = new Date().getFullYear()
  const monthsList = useMemo(() => {
    const list = []
    for (let y = currentYear - 1; y <= currentYear + 1; y++) {
      for (let m = 0; m < 12; m++) {
        const d = new Date(y, m, 1)
        list.push({
          value: format(d, 'yyyy-MM'),
          label: format(d, 'MMMM yyyy', { locale: ptBR }),
        })
      }
    }
    return list
  }, [currentYear])

  useEffect(() => {
    if (user) {
      supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if ((data as any)?.configuracoes_ponto) {
            setPointRules((data as any).configuracoes_ponto)
          }
        })
    }
  }, [user])

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
                  data.map((e: any) => {
                    const cargoObj = Array.isArray(e.cargo) ? e.cargo[0] : e.cargo
                    return {
                      id: e.id,
                      name: e.nome_completo,
                      role: e.cargo_nome_snapshot,
                      hr_roles: {
                        hourly_rate: cargoObj?.valor_hora || e.valor_hora_snapshot || 0,
                        daily_rate: cargoObj?.valor_diaria || e.valor_diaria_snapshot || 0,
                      },
                    }
                  }),
                )
              }
            })
        }
      })
  }, [company])

  useEffect(() => {
    if (!selectedEmpId || !month || !pointRules) return
    loadGrid()
  }, [selectedEmpId, month, pointRules])

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

      const in1 = existing?.in1?.slice(0, 5) || ''
      const out1 = existing?.out1?.slice(0, 5) || ''
      const in2 = existing?.in2?.slice(0, 5) || ''
      const out2 = existing?.out2?.slice(0, 5) || ''
      const calculated = calculateHours(in1, out1, in2, out2, pointRules)

      newGrid.push({
        date: dateStr,
        dateObj,
        isWeekend: isWeekend(dateObj),
        isHoliday: holidays.includes(dateStr),
        isToday: dateStr === todayStr,
        id: existing?.id,
        in1,
        out1,
        in2,
        out2,
        total_hours: calculated,
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
    let diasTrabalhados = 0

    grid.forEach((row) => {
      if (row.isWeekend) weekends++
      else if (row.isHoliday) holidays++
      else workingDays++

      totalHours += row.total_hours
      totalValue += row.total_hours * hourlyRate

      if (row.total_hours >= 2) {
        diasTrabalhados++
      }
    })

    return { totalHours, totalValue, workingDays, weekends, holidays, diasTrabalhados }
  }, [grid, hourlyRate])

  const handleChange = (index: number, field: string, value: string) => {
    const newGrid = [...grid]
    newGrid[index][field] = value
    const row = newGrid[index]
    row.total_hours = calculateHours(row.in1, row.out1, row.in2, row.out2, pointRules)
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
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[180px] bg-card capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthsList.map((m) => (
                <SelectItem key={m.value} value={m.value} className="capitalize">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ExportDialog />
        </div>
      </div>

      <Card className="shadow-subtle border-border bg-gradient-to-br from-card to-muted/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 space-y-2 flex flex-col">
              <Label>Selecione o Colaborador</Label>
              <Popover open={empOpen} onOpenChange={setEmpOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={empOpen}
                    className="w-full justify-between font-normal bg-background"
                  >
                    {selectedEmpId
                      ? employees.find((e) => e.id === selectedEmpId)?.name
                      : 'Buscar colaborador...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] md:w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Digite o nome..." />
                    <CommandList>
                      <CommandEmpty>Nenhum colaborador encontrado.</CommandEmpty>
                      <CommandGroup>
                        {employees.map((e) => (
                          <CommandItem
                            key={e.id}
                            value={e.name}
                            onSelect={() => {
                              setSelectedEmpId(e.id)
                              setEmpOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedEmpId === e.id ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            {e.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                    <p className="text-xs text-muted-foreground uppercase mb-1">Diária Padrão</p>
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
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm text-primary">Dias Trabalhados</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-2xl font-bold text-primary">
                {stats.diasTrabalhados}
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
