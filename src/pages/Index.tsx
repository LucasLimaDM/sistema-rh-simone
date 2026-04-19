import { useOutletContext } from 'react-router-dom'
import { AppContextType } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Users, FileWarning, Briefcase, PenTool, Plus, Download } from 'lucide-react'
import { CompliancePieChart, HoursBarChart } from '@/components/dashboard/dashboard-charts'

export default function Index() {
  const { company } = useOutletContext<AppContextType>()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Geral</h1>
          <p className="text-muted-foreground mt-1">Visão geral da operação para {company}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Relatório Rápido
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Novo Colaborador
          </Button>
        </div>
      </div>

      <div className="bg-accent text-accent-foreground p-4 sm:p-5 rounded-xl flex items-start sm:items-center gap-4 shadow-subtle border border-accent/20">
        <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-lg leading-tight">Atenção: Documentos Vencendo</h3>
          <p className="text-sm opacity-90 mt-1">
            Existem 3 colaboradores com documentos a vencer nos próximos 30 dias. Verifique a aba de
            colaboradores.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="hidden sm:flex text-accent bg-background hover:bg-background/90"
        >
          Revisar Agora
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total de Colaboradores" value="142" icon={Users} trend="+4% este mês" />
        <StatCard
          title="Documentos Pendentes"
          value="12"
          icon={FileWarning}
          trend="5 críticos"
          isWarning
        />
        <StatCard title="Turnos Ativos Hoje" value="89" icon={Briefcase} trend="Normal" />
        <StatCard title="Assinaturas Faltantes" value="7" icon={PenTool} trend="-2 desde ontem" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-subtle hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Conformidade de Documentos</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center pb-2">
            <CompliancePieChart />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-subtle hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Horas Trabalhadas na Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <HoursBarChart />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  isWarning = false,
}: {
  title: string
  value: string
  icon: any
  trend: string
  isWarning?: boolean
}) {
  return (
    <Card
      className={`shadow-subtle hover:-translate-y-1 transition-all duration-300 ${isWarning ? 'border-accent/50 bg-accent/5' : ''}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div
            className={`p-3 rounded-xl ${isWarning ? 'bg-accent/20 text-accent' : 'bg-primary/10 text-primary'}`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-sm font-medium text-muted-foreground mt-1">{title}</p>
        </div>
        <div className="mt-4 flex items-center text-xs font-medium">
          <span className={isWarning ? 'text-accent' : 'text-primary'}>{trend}</span>
        </div>
      </CardContent>
    </Card>
  )
}
