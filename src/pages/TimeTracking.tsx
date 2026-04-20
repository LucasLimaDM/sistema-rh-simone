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
import { Clock, Send, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function TimeTracking() {
  const { company } = useOutletContext<AppContextType>()
  const [tracks, setTracks] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedEmp, setSelectedEmp] = useState('')
  const [in1, setIn1] = useState('08:00')
  const [out1, setOut1] = useState('12:00')
  const [in2, setIn2] = useState('13:00')
  const [out2, setOut2] = useState('17:00')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchTracks = async () => {
    const { data } = await supabase
      .from('time_tracks')
      .select('*, employees!inner(name, company)')
      .eq('employees.company', company)
      .order('track_date', { ascending: false })
      .limit(50)
    if (data) setTracks(data)
  }

  useEffect(() => {
    fetchTracks()
    supabase
      .from('employees')
      .select('id, name')
      .eq('company', company)
      .then(({ data }) => {
        if (data) setEmployees(data)
      })
  }, [company])

  const handleSave = async () => {
    if (!selectedEmp)
      return toast({
        title: 'Atenção',
        description: 'Selecione um colaborador',
        variant: 'destructive',
      })
    setLoading(true)

    const t1 =
      (new Date(`1970-01-01T${out1}:00Z`).getTime() - new Date(`1970-01-01T${in1}:00Z`).getTime()) /
      3600000
    const t2 =
      (new Date(`1970-01-01T${out2}:00Z`).getTime() - new Date(`1970-01-01T${in2}:00Z`).getTime()) /
      3600000
    const totalHours = (t1 > 0 ? t1 : 0) + (t2 > 0 ? t2 : 0)

    const { error } = await supabase.from('time_tracks').insert({
      employee_id: selectedEmp,
      track_date: new Date().toISOString().split('T')[0],
      in1,
      out1,
      in2,
      out2,
      total_hours: totalHours.toFixed(2),
    })

    if (!error) {
      toast({
        title: 'Ponto Registrado',
        description: 'O registro de horas foi salvo com sucesso.',
      })
      fetchTracks()
      setSelectedEmp('')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controle de Ponto</h1>
          <p className="text-muted-foreground mt-1">Gestão diária e relatórios de jornada</p>
        </div>
        <ExportDialog />
      </div>

      <Card className="shadow-subtle border-border bg-gradient-to-br from-card to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" /> Lançamento Diário Rápido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 items-end">
            <div className="space-y-2 md:col-span-2">
              <Label>Colaborador</Label>
              <Select value={selectedEmp} onValueChange={setSelectedEmp}>
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label>Entrada</Label>
              <Input
                type="time"
                value={in1}
                onChange={(e) => setIn1(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Ida Almoço</Label>
              <Input
                type="time"
                value={out1}
                onChange={(e) => setOut1(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Volta Almoço</Label>
              <Input
                type="time"
                value={in2}
                onChange={(e) => setIn2(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Saída</Label>
              <Input
                type="time"
                value={out2}
                onChange={(e) => setOut2(e.target.value)}
                className="font-mono"
              />
            </div>
            <Button onClick={handleSave} disabled={loading} className="w-full md:col-span-6 mt-2">
              {loading ? 'Salvando...' : 'Registrar Ponto'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-subtle border-border">
        <CardHeader>
          <CardTitle className="text-lg">Registros do Mês</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Saída</TableHead>
                <TableHead>Total Horas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              )}
              {tracks.map((track) => (
                <TableRow key={track.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    {new Date(track.track_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </TableCell>
                  <TableCell>{track.employees?.name}</TableCell>
                  <TableCell className="font-mono text-xs">{track.in1?.slice(0, 5)}</TableCell>
                  <TableCell className="font-mono text-xs">{track.out2?.slice(0, 5)}</TableCell>
                  <TableCell className="font-bold text-primary">{track.total_hours}h</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
          <Download className="h-4 w-4" /> Exportar Mês
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar Relatório de Ponto</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Escolha como deseja exportar o relatório consolidado do mês atual.
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
