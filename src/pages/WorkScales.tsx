import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AppContextType } from '@/lib/types'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CalendarDays, Wand2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function WorkScales() {
  const { company } = useOutletContext<AppContextType>()
  const [scales, setScales] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const currentPeriod = new Date().toISOString().slice(0, 7)

  const fetchScales = async () => {
    const { data: empData } = await supabase
      .from('empresa_contratante')
      .select('id')
      .eq('nome_fantasia', company)
      .single()

    if (!empData) return

    const { data: emps } = await supabase
      .from('colaborador')
      .select('id, nome_completo, cargo_nome_snapshot')
      .eq('empresa_id', empData.id)
      .eq('ativo', true)

    const { data: scs } = await supabase.from('work_scales').select('*').eq('period', currentPeriod)

    if (emps) {
      const allowedRoles = [
        'encarregado',
        'instalador sênior',
        'instalador júnior',
        'auxiliar de serviços gerais',
      ]
      const excludedRoles = ['almoxarifado', 'veículo']

      const filtered = emps.filter((emp) => {
        const roleName = (emp.cargo_nome_snapshot || '').toLowerCase()
        if (excludedRoles.some((ex) => roleName.includes(ex))) return false
        return allowedRoles.some((al) => roleName.includes(al))
      })

      const formatted = filtered.map((emp) => {
        const empScale = scs?.find((s: any) => s.employee_id === emp.id)
        return {
          id: empScale?.id || `new-${emp.id}`,
          employee_id: emp.id,
          employeeName: emp.nome_completo,
          role: emp.cargo_nome_snapshot,
          schedule: empScale?.schedule || {
            Seg: '08:00 - 17:00',
            Ter: '08:00 - 17:00',
            Qua: '08:00 - 17:00',
            Qui: '08:00 - 17:00',
            Sex: '08:00 - 17:00',
            Sab: '08:00 - 12:00',
            Dom: 'Folga',
          },
        }
      })

      formatted.sort((a, b) => a.employeeName.localeCompare(b.employeeName))
      setScales(formatted)
    }
  }

  useEffect(() => {
    fetchScales()
  }, [company])

  const handleAuto6x1 = async () => {
    setLoading(true)
    const updated = scales.map((row) => {
      const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']
      const offDayIndex = Math.floor(Math.random() * 7)
      const newSchedule: Record<string, string> = {}
      days.forEach((day, idx) => {
        newSchedule[day] = idx === offDayIndex ? 'Folga' : '08:00 - 17:00'
      })
      return { ...row, schedule: newSchedule }
    })

    for (const s of updated) {
      const { data } = await supabase
        .from('work_scales')
        .select('id')
        .eq('employee_id', s.employee_id)
        .eq('period', currentPeriod)
        .single()
      if (data) {
        await supabase.from('work_scales').update({ schedule: s.schedule }).eq('id', data.id)
      } else {
        await supabase
          .from('work_scales')
          .insert({ employee_id: s.employee_id, period: currentPeriod, schedule: s.schedule })
      }
    }

    setScales(updated)
    setLoading(false)
    toast({ title: 'Escala 6x1 Gerada', description: 'Folgas distribuídas e salvas no banco.' })
  }

  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Escalas</h1>
          <p className="text-muted-foreground mt-1">Organize as equipes e as regras 6x1</p>
        </div>
        <Button
          onClick={handleAuto6x1}
          disabled={loading}
          className="gap-2 bg-primary hover:bg-primary/90 shadow-md"
        >
          <Wand2 className="h-4 w-4" /> {loading ? 'Gerando...' : 'Auto-Sugerir 6x1'}
        </Button>
      </div>

      <Card className="shadow-subtle border-border">
        <CardHeader className="border-b bg-muted/10 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-accent" /> Matriz da Semana Atual
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[200px]">Colaborador</TableHead>
                {days.map((d) => (
                  <TableHead key={d} className="text-center font-bold">
                    {d}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {scales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Nenhum colaborador encontrado.
                  </TableCell>
                </TableRow>
              )}
              {scales.map((scale) => (
                <TableRow key={scale.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium border-r bg-muted/5">
                    <div>{scale.employeeName}</div>
                    <div className="text-xs text-muted-foreground font-normal">{scale.role}</div>
                  </TableCell>
                  {days.map((d) => {
                    const isFolga = scale.schedule[d] === 'Folga'
                    return (
                      <TableCell key={d} className="text-center p-2 border-r last:border-r-0">
                        <div
                          className={cn(
                            'py-1.5 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer hover:opacity-80',
                            isFolga
                              ? 'bg-accent/10 text-accent border border-accent/20'
                              : 'bg-background text-muted-foreground border border-border',
                          )}
                        >
                          {scale.schedule[d]}
                        </div>
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
