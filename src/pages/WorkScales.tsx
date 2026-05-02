import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CalendarDays, Wand2, Save, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { startOfWeek, addDays, format, subWeeks, addWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function ScaleCell({ initialData, userId, dateStr, onSave }: any) {
  const [data, setData] = useState(initialData || { hours: 8, is_day_off: false, project_name: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setData(initialData || { hours: 8, is_day_off: false, project_name: '' })
  }, [initialData])

  const doSave = async (updates: any) => {
    const next = { ...data, ...updates }
    setData(next)
    setSaving(true)
    await onSave(userId, dateStr, next)
    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-2 min-w-[140px] p-3 bg-muted/20 rounded-md border border-border/50">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'text-xs font-semibold',
            data.is_day_off ? 'text-accent' : 'text-muted-foreground',
          )}
        >
          {data.is_day_off ? 'Folga' : 'Trabalho'}
        </span>
        <div className="flex items-center gap-2">
          {saving && <Save className="h-3 w-3 animate-pulse text-muted-foreground" />}
          <Switch
            checked={!data.is_day_off}
            onCheckedChange={(c) => doSave({ is_day_off: !c, hours: !c ? 0 : 8 })}
            className="scale-75 origin-right"
          />
        </div>
      </div>
      {!data.is_day_off && (
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-10">Horas:</span>
            <Input
              type="number"
              value={data.hours}
              onChange={(e) => setData({ ...data, hours: Number(e.target.value) })}
              onBlur={() => doSave({ hours: data.hours })}
              placeholder="0"
              className="h-7 text-xs px-2"
            />
          </div>
          <Input
            type="text"
            value={data.project_name}
            onChange={(e) => setData({ ...data, project_name: e.target.value })}
            onBlur={() => doSave({ project_name: data.project_name })}
            placeholder="Obra/Cliente"
            className="h-7 text-xs px-2"
          />
        </div>
      )}
    </div>
  )
}

export default function WorkScales() {
  const [users, setUsers] = useState<any[]>([])
  const [scalesMap, setScalesMap] = useState<Record<string, any>>({})
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))

  const fetchUsersAndScales = async () => {
    try {
      const usrs = await pb.collection('users').getFullList({ sort: 'name' })
      setUsers(usrs)

      const startDate = format(days[0], 'yyyy-MM-dd')
      const endDate = format(days[6], 'yyyy-MM-dd')
      const fetched = await pb.collection('work_scales').getFullList({
        filter: `date >= "${startDate} 00:00:00" && date <= "${endDate} 23:59:59"`,
      })

      const newMap: Record<string, any> = {}
      fetched.forEach((record) => {
        const dStr = record.date.substring(0, 10)
        newMap[`${record.user_id}_${dStr}`] = record
      })
      setScalesMap(newMap)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchUsersAndScales()
  }, [weekStart])

  const handleSave = async (userId: string, dateStr: string, next: any) => {
    const key = `${userId}_${dateStr}`
    try {
      const current = scalesMap[key]
      let saved
      if (current?.id) {
        saved = await pb.collection('work_scales').update(current.id, {
          hours: next.hours,
          is_day_off: next.is_day_off,
          project_name: next.project_name,
        })
      } else {
        saved = await pb.collection('work_scales').create({
          user_id: userId,
          date: `${dateStr} 12:00:00.000Z`,
          hours: next.hours,
          is_day_off: next.is_day_off,
          project_name: next.project_name,
        })
      }
      setScalesMap((prev) => ({ ...prev, [key]: saved }))
    } catch (err) {
      toast({ title: 'Erro ao salvar escala', variant: 'destructive' })
    }
  }

  const handleAuto6x1 = async () => {
    setLoading(true)
    for (const user of users) {
      const offDayIndex = Math.floor(Math.random() * 7)
      for (let i = 0; i < 7; i++) {
        const dateStr = format(days[i], 'yyyy-MM-dd')
        const isDayOff = i === offDayIndex
        await handleSave(user.id, dateStr, {
          hours: isDayOff ? 0 : 8,
          is_day_off: isDayOff,
          project_name: '',
        })
      }
    }
    setLoading(false)
    toast({ title: 'Escala 6x1 Gerada', description: 'Folgas distribuídas e salvas.' })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Escalas</h1>
          <p className="text-muted-foreground mt-1">
            Planejamento semanal, locais de obra e folgas
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center bg-card rounded-md border shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWeekStart(subWeeks(weekStart, 1))}
              className="h-9 w-9 rounded-r-none border-0 border-r"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium px-4 text-center">
              {format(days[0], 'dd/MM/yyyy')} - {format(days[6], 'dd/MM/yyyy')}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWeekStart(addWeeks(weekStart, 1))}
              className="h-9 w-9 rounded-l-none border-0 border-l"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handleAuto6x1}
            disabled={loading}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-md"
          >
            <Wand2 className="h-4 w-4" /> {loading ? 'Gerando...' : 'Auto-Sugerir 6x1'}
          </Button>
        </div>
      </div>

      <Card className="shadow-subtle border-border">
        <CardHeader className="border-b bg-muted/10 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-accent" /> Matriz da Semana
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[200px] min-w-[200px] sticky left-0 bg-background/95 backdrop-blur z-10 border-r">
                  Colaborador
                </TableHead>
                {days.map((d) => (
                  <TableHead
                    key={d.toISOString()}
                    className="text-center font-bold min-w-[160px] border-r last:border-r-0"
                  >
                    <div className="flex flex-col items-center">
                      <span className="uppercase text-xs text-muted-foreground">
                        {format(d, 'EEE', { locale: ptBR })}
                      </span>
                      <span className="text-sm text-foreground">{format(d, 'dd/MM')}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado no sistema.
                  </TableCell>
                </TableRow>
              )}
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/10 group">
                  <TableCell className="font-medium border-r sticky left-0 bg-background group-hover:bg-muted/30 transition-colors z-10">
                    <div className="truncate">{user.name || user.email}</div>
                    <div className="text-xs text-muted-foreground font-normal truncate">
                      {user.role || 'Usuário'}
                    </div>
                  </TableCell>
                  {days.map((d) => {
                    const dateStr = format(d, 'yyyy-MM-dd')
                    const initialData = scalesMap[`${user.id}_${dateStr}`]
                    return (
                      <TableCell
                        key={d.toISOString()}
                        className="p-2 border-r last:border-r-0 align-top"
                      >
                        <ScaleCell
                          initialData={initialData}
                          userId={user.id}
                          dateStr={dateStr}
                          onSave={handleSave}
                        />
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
