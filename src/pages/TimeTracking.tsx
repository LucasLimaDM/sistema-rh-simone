import { useState } from 'react'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Clock, Send, Download } from 'lucide-react'
import { mockTimeTracks } from '@/lib/mock'
import { useToast } from '@/hooks/use-toast'

export default function TimeTracking() {
  const { toast } = useToast()

  const handleSave = () => {
    toast({ title: 'Ponto Registrado', description: 'O registro de horas foi salvo com sucesso.' })
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label>Entrada</Label>
              <Input type="time" defaultValue="08:00" className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>Ida Almoço</Label>
              <Input type="time" defaultValue="12:00" className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>Volta Almoço</Label>
              <Input type="time" defaultValue="13:00" className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>Saída</Label>
              <Input type="time" defaultValue="17:00" className="font-mono" />
            </div>
            <Button onClick={handleSave} className="w-full">
              Registrar
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
              {mockTimeTracks.map((track) => (
                <TableRow key={track.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{track.date}</TableCell>
                  <TableCell>{track.employeeName}</TableCell>
                  <TableCell className="font-mono text-xs">{track.in1}</TableCell>
                  <TableCell className="font-mono text-xs">{track.out2}</TableCell>
                  <TableCell className="font-bold text-primary">{track.totalHours}</TableCell>
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
