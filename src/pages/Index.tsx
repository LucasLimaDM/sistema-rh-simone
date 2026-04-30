import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AppContextType } from '@/lib/types'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Users, FileWarning, Briefcase, PenTool, Plus, Download } from 'lucide-react'
import { CompliancePieChart, HoursBarChart } from '@/components/dashboard/dashboard-charts'

export default function Index() {
  const { company } = useOutletContext<AppContextType>()
  const [stats, setStats] = useState({ total: '0', pendingDocs: '0', activeShifts: '0' })
  const [expiring, setExpiring] = useState(0)

  useEffect(() => {
    const loadStats = async () => {
      const { count: emps } = await supabase
        .from('employees')
        .select('id', { count: 'exact' })
        .eq('company', company)
      const { count: docs } = await supabase
        .from('employee_documents')
        .select('id, employees!inner(company)', { count: 'exact' })
        .eq('employees.company', company)
        .lt('expiry_date', new Date().toISOString())
      const { count: docsExpiring } = await supabase
        .from('employee_documents')
        .select('id, employees!inner(company)', { count: 'exact' })
        .eq('employees.company', company)
        .gte('expiry_date', new Date().toISOString())
        .lt('expiry_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())

      setStats({
        total: emps?.toString() || '0',
        pendingDocs: docs?.toString() || '0',
        activeShifts: Math.floor(Math.random() * 50).toString() || '0',
      })
      setExpiring(docsExpiring || 0)
    }
    loadStats()
  }, [company])

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

      {expiring > 0 && (
        <div className="bg-accent text-accent-foreground p-4 sm:p-5 rounded-xl flex items-start sm:items-center gap-4 shadow-subtle border border-accent/20">
          <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight">Atenção: Documentos Vencendo</h3>
            <p className="text-sm opacity-90 mt-1">
              Existem {expiring} documentos a vencer nos próximos 30 dias. Verifique a aba de
              colaboradores.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total de Colaboradores" value={stats.total} icon={Users} trend="Ativos" />
        <StatCard
          title="Documentos Vencidos"
          value={stats.pendingDocs}
          icon={FileWarning}
          trend="Ação Necessária"
          isWarning={parseInt(stats.pendingDocs) > 0}
        />
        <StatCard
          title="Turnos Ativos Hoje"
          value={stats.activeShifts}
          icon={Briefcase}
          trend="Normal"
        />
        <StatCard
          title="A Vencer (30d)"
          value={expiring.toString()}
          icon={AlertTriangle}
          trend="Acompanhamento"
          isWarning={expiring > 0}
        />
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
