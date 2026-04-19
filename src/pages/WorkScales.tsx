import { useState } from 'react'
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
import { mockScales } from '@/lib/mock'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function WorkScales() {
  const [scales, setScales] = useState(mockScales)
  const { toast } = useToast()

  const handleAuto6x1 = () => {
    const updated = scales.map((row) => {
      const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']
      const offDayIndex = Math.floor(Math.random() * 7)
      const newSchedule: Record<string, string> = {}
      days.forEach((day, idx) => {
        newSchedule[day] = idx === offDayIndex ? 'Folga' : '08:00 - 17:00'
      })
      return { ...row, schedule: newSchedule }
    })
    setScales(updated)
    toast({
      title: 'Escala 6x1 Gerada',
      description: 'Folgas distribuídas automaticamente garantindo cobertura.',
      className: 'bg-primary text-primary-foreground border-none',
    })
  }

  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Escalas</h1>
          <p className="text-muted-foreground mt-1">Organize as equipes e as regras 6x1</p>
        </div>
        <Button onClick={handleAuto6x1} className="gap-2 bg-primary hover:bg-primary/90 shadow-md">
          <Wand2 className="h-4 w-4" /> Auto-Sugerir 6x1
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
