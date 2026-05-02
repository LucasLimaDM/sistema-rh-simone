import { useState, useEffect, useCallback, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AppContextType } from '@/lib/types'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertTriangle, Users, FileWarning, Briefcase, Plus, Download, Search } from 'lucide-react'
import { CompliancePieChart, HoursBarChart } from '@/components/dashboard/dashboard-charts'
import { EmployeeFormSheet } from '@/components/employees/employee-form-sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function Index() {
  const { company } = useOutletContext<AppContextType>()
  const [stats, setStats] = useState({ total: '0', pendingDocs: '0', activeShifts: '0' })
  const [expiring, setExpiring] = useState(0)
  const [pieData, setPieData] = useState<any[]>([])
  const [barData, setBarData] = useState<any[]>([])

  const [empresaId, setEmpresaId] = useState<string>('')
  const [lists, setLists] = useState({
    all: [] as any[],
    expired: [] as any[],
    expiring: [] as any[],
    active: [] as any[],
  })

  const [drillDownInfo, setDrillDownInfo] = useState<{
    title: string
    list: any[]
    type: string
  } | null>(null)
  const [drillDownSearch, setDrillDownSearch] = useState('')
  const [editingEmp, setEditingEmp] = useState<any>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const loadStats = useCallback(async () => {
    const { data: empData } = await supabase
      .from('empresa_contratante')
      .select('id')
      .eq('nome_fantasia', company)
      .single()

    if (!empData) return
    const empId = empData.id
    setEmpresaId(empId)

    const { data: allEmpsRaw } = await supabase
      .from('colaborador')
      .select('*, cargo(nome, valor_hora, valor_diaria)')
      .order('nome_completo')

    const allEmps =
      allEmpsRaw?.filter((e) => {
        const vinculadas = e.dados_dinamicos?.empresas_vinculadas || []
        return e.empresa_id === empId || vinculadas.includes(empId)
      }) || []

    const todayStr = new Date().toISOString().split('T')[0]
    const { data: active } = await supabase
      .from('time_tracks')
      .select('employee_id')
      .in(
        'employee_id',
        allEmps.map((e) => e.id),
      )
      .eq('track_date', todayStr)

    const { data: allDocs } = await supabase
      .from('employee_documents')
      .select('*')
      .in(
        'employee_id',
        allEmps.map((e) => e.id),
      )

    let valid = 0,
      expiringCount = 0,
      expired = 0
    const now = new Date()
    const in30d = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const employeesWithStatus = allEmps.map((emp) => {
      const eDocs = allDocs?.filter((d) => d.employee_id === emp.id) || []
      let empExpired = 0
      let empExpiring = 0
      eDocs.forEach((d) => {
        if (!d.expiry_date) return
        const exp = new Date(d.expiry_date)
        if (exp < now) empExpired++
        else if (exp < in30d) empExpiring++
      })
      return {
        ...emp,
        employee_documents: eDocs,
        expiredDocs: empExpired,
        expiringDocs: empExpiring,
      }
    })

    const expiredList = employeesWithStatus.filter((e) => e.expiredDocs > 0)
    const expiringList = employeesWithStatus.filter((e) => e.expiringDocs > 0)

    allDocs?.forEach((d) => {
      if (!d.expiry_date) {
        valid++
        return
      }
      const exp = new Date(d.expiry_date)
      if (exp < now) expired++
      else if (exp < in30d) expiringCount++
      else valid++
    })

    const activeIds = active?.map((t) => t.employee_id) || []
    const activeList = employeesWithStatus.filter((e) => activeIds.includes(e.id))

    setLists({
      all: employeesWithStatus,
      expired: expiredList,
      expiring: expiringList,
      active: activeList,
    })

    setStats({
      total: employeesWithStatus.length.toString(),
      pendingDocs: expired.toString(),
      activeShifts: activeIds.length.toString(),
    })
    setExpiring(expiringCount)

    setPieData([
      { name: 'Em dia', value: valid, fill: 'hsl(var(--chart-1))' },
      { name: 'A Vencer', value: expiringCount, fill: 'hsl(var(--chart-2))' },
      { name: 'Vencido', value: expired, fill: 'hsl(var(--chart-3))' },
    ])

    const weekAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
    const { data: tracks } = await supabase
      .from('time_tracks')
      .select('track_date, total_hours, employee_id')
      .in(
        'employee_id',
        allEmps.map((e) => e.id),
      )
      .gte('track_date', weekAgo.toISOString().split('T')[0])

    const daysMap: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      daysMap[d.toISOString().split('T')[0]] = 0
    }

    tracks?.forEach((t) => {
      if (daysMap[t.track_date] !== undefined) {
        daysMap[t.track_date] += Number(t.total_hours) || 0
      }
    })

    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    const newBarData = Object.entries(daysMap).map(([dateStr, hours]) => {
      const d = new Date(`${dateStr}T12:00:00Z`)
      return {
        name: daysOfWeek[d.getUTCDay()],
        hours: Number(hours.toFixed(1)),
      }
    })
    setBarData(newBarData)
  }, [company])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const handleOpenDrillDown = (title: string, list: any[], type: string) => {
    setDrillDownSearch('')
    setDrillDownInfo({ title, list, type })
  }

  const filteredDrillDown = useMemo(() => {
    if (!drillDownInfo) return []
    if (!drillDownSearch) return drillDownInfo.list
    const s = drillDownSearch.toLowerCase()
    return drillDownInfo.list.filter(
      (item) =>
        item.nome_completo?.toLowerCase().includes(s) ||
        item.email?.toLowerCase().includes(s) ||
        item.cpf?.includes(s) ||
        item.cargo_nome_snapshot?.toLowerCase().includes(s) ||
        item.cargo?.nome?.toLowerCase().includes(s),
    )
  }, [drillDownInfo, drillDownSearch])

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
          <Button
            className="gap-2"
            onClick={() => {
              setEditingEmp(null)
              setIsSheetOpen(true)
            }}
          >
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
        <StatCard
          title="Total de Colaboradores"
          value={stats.total}
          icon={Users}
          trend="Ativos"
          onClick={() => handleOpenDrillDown('Total de Colaboradores', lists.all, 'emp')}
        />
        <StatCard
          title="Documentos Vencidos"
          value={stats.pendingDocs}
          icon={FileWarning}
          trend="Ação Necessária"
          isWarning={parseInt(stats.pendingDocs) > 0}
          onClick={() =>
            handleOpenDrillDown('Colaboradores com Documentos Vencidos', lists.expired, 'docs')
          }
        />
        <StatCard
          title="Turnos Ativos Hoje"
          value={stats.activeShifts}
          icon={Briefcase}
          trend="Normal"
          onClick={() => handleOpenDrillDown('Turnos Ativos Hoje', lists.active, 'emp')}
        />
        <StatCard
          title="A Vencer (30d)"
          value={expiring.toString()}
          icon={AlertTriangle}
          trend="Acompanhamento"
          isWarning={expiring > 0}
          onClick={() =>
            handleOpenDrillDown('Colaboradores com Documentos a Vencer', lists.expiring, 'docs')
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-subtle hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Conformidade de Documentos</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center pb-2">
            <CompliancePieChart data={pieData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-subtle hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Horas Trabalhadas na Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <HoursBarChart data={barData} />
          </CardContent>
        </Card>
      </div>

      <EmployeeFormSheet
        open={isSheetOpen}
        setOpen={setIsSheetOpen}
        company={company}
        empresaId={empresaId}
        employeeToEdit={editingEmp}
        onSave={() => loadStats()}
      />

      <Dialog open={!!drillDownInfo} onOpenChange={(open) => !open && setDrillDownInfo(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b shrink-0 space-y-4">
            <DialogTitle>{drillDownInfo?.title}</DialogTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar colaborador..."
                value={drillDownSearch}
                onChange={(e) => setDrillDownSearch(e.target.value)}
                className="pl-9 bg-muted/50"
              />
            </div>
          </DialogHeader>
          <div className="p-6 pt-2 overflow-y-auto flex-1 space-y-3">
            {filteredDrillDown.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-muted/10 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => {
                  setDrillDownInfo(null)
                  setEditingEmp(item)
                  setIsSheetOpen(true)
                }}
              >
                <div>
                  <p className="font-semibold text-primary">{item.nome_completo}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cargo: {item.cargo?.nome || item.cargo_nome_snapshot || 'Não definido'}
                  </p>
                  {(item.dados_dinamicos?.razao_social || item.email) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.dados_dinamicos?.razao_social
                        ? `Razão Social: ${item.dados_dinamicos.razao_social}`
                        : `E-mail: ${item.email}`}
                    </p>
                  )}
                </div>
                {drillDownInfo?.type === 'docs' && (
                  <div className="text-sm text-right shrink-0">
                    {item.expiredDocs > 0 && (
                      <span className="text-red-600 block font-semibold px-2 py-1 bg-red-50 rounded-md border border-red-100">
                        {item.expiredDocs} documento(s) vencido(s)
                      </span>
                    )}
                    {item.expiringDocs > 0 && (
                      <span className="text-orange-600 block font-semibold px-2 py-1 bg-orange-50 rounded-md border border-orange-100 mt-2">
                        {item.expiringDocs} documento(s) a vencer
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
            {filteredDrillDown.length === 0 && (
              <div className="text-center py-10 px-4 rounded-xl border border-dashed bg-muted/10 mt-4">
                <p className="text-muted-foreground text-sm font-medium">
                  Nenhum colaborador encontrado com os filtros aplicados.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  isWarning = false,
  onClick,
}: {
  title: string
  value: string
  icon: any
  trend: string
  isWarning?: boolean
  onClick?: () => void
}) {
  return (
    <Card
      className={`shadow-subtle transition-all duration-300 ${isWarning ? 'border-accent/50 bg-accent/5' : ''} ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md' : 'hover:-translate-y-1'}`}
      onClick={onClick}
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
