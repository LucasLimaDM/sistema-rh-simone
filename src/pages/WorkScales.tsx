import { useState, useEffect, useRef } from 'react'
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
import { startOfWeek, addDays, format, subWeeks, addWeeks, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRealtime } from '@/hooks/use-realtime'

function ScaleCell({ initialData, collaboratorId, dateStr, onSave }: any) {
  const [data, setData] = useState({
    is_day_off: false,
    project_name: '',
    start_time: '',
    end_time: '',
    ...initialData,
  })
  const [saving, setSaving] = useState(false)
  const [scheduleStr, setScheduleStr] = useState('')

  useEffect(() => {
    const d = {
      is_day_off: false,
      project_name: '',
      start_time: '',
      end_time: '',
      ...initialData,
    }
    setData(d)
    if (d.is_day_off) {
      setScheduleStr('-')
    } else if (d.start_time && d.end_time) {
      setScheduleStr(`${d.start_time} - ${d.end_time}`)
    } else {
      setScheduleStr('')
    }
  }, [initialData])

  const doSave = async (updates: any) => {
    const next = { ...data, ...updates }
    setData(next)
    setSaving(true)
    await onSave(collaboratorId, dateStr, next)
    setSaving(false)
  }

  const handleScheduleBlur = () => {
    const parts = scheduleStr.split('-').map((p) => p.trim())
    if (parts.length === 2 && parts[0] && parts[1]) {
      doSave({ start_time: parts[0], end_time: parts[1] })
    } else {
      doSave({ start_time: '', end_time: '' })
    }
  }

  const handleToggle = (checked: boolean) => {
    const isDayOff = !checked
    const updates: any = { is_day_off: isDayOff }
    if (isDayOff) {
      updates.start_time = ''
      updates.end_time = ''
      setScheduleStr('-')
    } else {
      setScheduleStr('')
    }
    doSave(updates)
  }

  return (
    <div className="flex flex-col gap-2 min-w-[150px] p-3 bg-muted/20 rounded-md border border-border/50 transition-colors hover:border-primary/30">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'text-xs font-semibold uppercase tracking-wider',
            data.is_day_off ? 'text-muted-foreground' : 'text-primary',
          )}
        >
          {data.is_day_off ? 'Folga' : 'Trabalho'}
        </span>
        <div className="flex items-center gap-2">
          {saving && <Save className="h-3 w-3 animate-pulse text-muted-foreground" />}
          <Switch
            checked={!data.is_day_off}
            onCheckedChange={handleToggle}
            className="scale-75 origin-right data-[state=checked]:bg-primary"
          />
        </div>
      </div>
      {!data.is_day_off && (
        <div className="flex flex-col gap-2 mt-2">
          <Input
            type="text"
            value={scheduleStr}
            onChange={(e) => setScheduleStr(e.target.value)}
            onBlur={handleScheduleBlur}
            placeholder="08:00 - 17:00"
            className="h-8 text-xs font-medium text-center"
          />
          <Input
            type="text"
            value={data.project_name}
            onChange={(e) => setData({ ...data, project_name: e.target.value })}
            onBlur={() => doSave({ project_name: data.project_name })}
            placeholder="Obra/Cliente"
            className="h-8 text-xs"
          />
        </div>
      )}
    </div>
  )
}

export default function WorkScales() {
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [scalesMap, setScalesMap] = useState<Record<string, any>>({})
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(false)
  const { toast } = useToast()

  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))

  const fetchCollaboratorsAndScales = async () => {
    try {
      const collabs = await pb.collection('collaborators').getFullList({
        sort: 'name',
        expand: 'role_id',
      })

      const allowedRoles = [
        'Encarregado',
        'Instalador Sênior',
        'Instalador Junior',
        'Auxiliar de serviços gerais',
        'Auxiliar de Serviços Gerais',
      ]

      const filtered = collabs.filter((c) => {
        const roleName = c.expand?.role_id?.title || ''
        return allowedRoles.some((ar) => roleName.toLowerCase() === ar.toLowerCase())
      })

      setCollaborators(filtered)

      const startDate = format(days[0], 'yyyy-MM-dd')
      const endDate = format(days[6], 'yyyy-MM-dd')
      const fetched = await pb.collection('work_scales').getFullList({
        filter: `date >= "${startDate} 00:00:00" && date <= "${endDate} 23:59:59"`,
      })

      const newMap: Record<string, any> = {}
      fetched.forEach((record) => {
        const dStr = record.date.substring(0, 10)
        const cId = record.collaborator_id || record.user_id
        if (cId) {
          newMap[`${cId}_${dStr}`] = record
        }
      })
      setScalesMap(newMap)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchCollaboratorsAndScales()
  }, [weekStart])

  useRealtime('work_scales', () => {
    if (!loadingRef.current) fetchCollaboratorsAndScales()
  })

  useRealtime('collaborators', () => {
    if (!loadingRef.current) fetchCollaboratorsAndScales()
  })

  const handleSave = async (collaboratorId: string, dateStr: string, next: any) => {
    const key = `${collaboratorId}_${dateStr}`
    try {
      const current = scalesMap[key]
      let saved
      if (current?.id) {
        saved = await pb.collection('work_scales').update(current.id, {
          start_time: next.start_time,
          end_time: next.end_time,
          is_day_off: next.is_day_off,
          project_name: next.project_name,
        })
      } else {
        saved = await pb.collection('work_scales').create({
          collaborator_id: collaboratorId,
          date: `${dateStr} 12:00:00.000Z`,
          start_time: next.start_time,
          end_time: next.end_time,
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
    if (collaborators.length === 0) {
      toast({
        title: 'Nenhum colaborador encontrado',
        description: 'Não há colaboradores elegíveis para gerar escala.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    loadingRef.current = true
    try {
      for (const collab of collaborators) {
        const offDayIndex = Math.floor(Math.random() * 7)
        for (let i = 0; i < 7; i++) {
          const date = days[i]
          const dateStr = format(date, 'yyyy-MM-dd')
          const isDayOff = i === offDayIndex

          let st = ''
          let et = ''

          if (!isDayOff) {
            const dayOfWeek = getDay(date) // 0 = Sunday, 6 = Saturday
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
              st = '08:00'
              et = '17:00'
            } else if (dayOfWeek === 6) {
              st = '08:00'
              et = '12:00'
            } else if (dayOfWeek === 0) {
              st = '08:00'
              et = '17:00'
            }
          }

          await handleSave(collab.id, dateStr, {
            is_day_off: isDayOff,
            start_time: st,
            end_time: et,
            project_name: '',
          })
        }
      }
      toast({
        title: 'Escala 6x1 Gerada',
        description: 'Folgas distribuídas e salvas com sucesso.',
      })
    } finally {
      setLoading(false)
      loadingRef.current = false
      fetchCollaboratorsAndScales()
    }
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Gestão de Escalas</h1>
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
            <div className="text-sm font-medium px-4 text-center min-w-[200px]">
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
            className="gap-2 bg-[#6366f1] hover:bg-[#6366f1]/90 shadow-md text-white"
          >
            <Wand2 className="h-4 w-4" /> {loading ? 'Gerando...' : 'Auto-Sugerir 6x1'}
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-border">
        <CardHeader className="border-b bg-muted/10 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-primary">
            <CalendarDays className="h-5 w-5" /> Matriz da Semana
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[1200px]">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[220px] min-w-[220px] sticky left-0 bg-muted/30 z-20 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Colaborador
                </TableHead>
                {days.map((d) => (
                  <TableHead
                    key={d.toISOString()}
                    className="text-center font-bold min-w-[170px] border-r last:border-r-0"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="capitalize text-sm font-semibold text-foreground whitespace-nowrap">
                        Dia - {format(d, 'dd/MM')}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {format(d, 'EEEE', { locale: ptBR })}
                      </span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {collaborators.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    Nenhum colaborador com cargo técnico elegível encontrado.
                  </TableCell>
                </TableRow>
              )}
              {collaborators.map((collab) => (
                <TableRow key={collab.id} className="hover:bg-muted/5 group">
                  <TableCell className="font-medium border-r sticky left-0 bg-background group-hover:bg-muted/5 transition-colors z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    <div className="truncate font-semibold">{collab.name}</div>
                    <div className="text-xs text-muted-foreground font-normal truncate mt-0.5">
                      {collab.expand?.role_id?.title || 'Sem cargo'}
                    </div>
                  </TableCell>
                  {days.map((d) => {
                    const dateStr = format(d, 'yyyy-MM-dd')
                    const initialData = scalesMap[`${collab.id}_${dateStr}`]
                    return (
                      <TableCell
                        key={d.toISOString()}
                        className="p-2 border-r last:border-r-0 align-top"
                      >
                        <ScaleCell
                          initialData={initialData}
                          collaboratorId={collab.id}
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
