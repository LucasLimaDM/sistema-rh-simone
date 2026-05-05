import { useState, useEffect, useCallback, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AppContextType } from '@/lib/types'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Users,
  FileText,
  Briefcase,
  Plus,
  Download,
  Search,
  Building2,
  AlertCircle,
} from 'lucide-react'
import { CompliancePieChart, HoursBarChart } from '@/components/dashboard/dashboard-charts'
import { EmployeeFormSheet } from '@/components/employees/employee-form-sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

export default function Index() {
  const { company } = useOutletContext<AppContextType>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [stats, setStats] = useState({
    total: '0',
    totalDocs: '0',
    activeShifts: '0',
    activeCompanies: '0',
  })
  const [pieData, setPieData] = useState<any[]>([])
  const [barData, setBarData] = useState<any[]>([])

  const [empresaId, setEmpresaId] = useState<string>('')
  const [lists, setLists] = useState({
    all: [] as any[],
    docs: [] as any[],
    active: [] as any[],
    companies: [] as any[],
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
    setIsLoading(true)
    setError(null)

    try {
      const fetchWithTimeout = <T,>(promise: Promise<T>): Promise<T> => {
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            reject(new Error('TIMEOUT'))
          }, 10000)
          promise
            .then((res) => {
              clearTimeout(timer)
              resolve(res)
            })
            .catch((err) => {
              clearTimeout(timer)
              reject(err)
            })
        })
      }

      const companies = await fetchWithTimeout(pb.collection('companies').getFullList())
      const currentCompany = companies.find((c) => c.name === company)
      const activeCompaniesCount = companies.filter((c) => c.active).length

      let allEmps: any[] = []
      let companyDocs: any[] = []
      let companyScales: any[] = []

      if (currentCompany) {
        setEmpresaId(currentCompany.id)
        allEmps = await fetchWithTimeout(
          pb.collection('collaborators').getFullList({
            filter: `company_id = '${currentCompany.id}'`,
            expand: 'role_id',
          }),
        )

        if (allEmps.length > 0) {
          const empIds = allEmps.map((e) => e.id)

          const [allDocs, allScales] = await fetchWithTimeout(
            Promise.all([
              pb.collection('documents').getFullList(),
              pb.collection('work_scales').getFullList(),
            ]),
          )

          companyDocs = allDocs.filter((d) => empIds.includes(d.collaborator_id))

          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 6)
          weekAgo.setHours(0, 0, 0, 0)

          companyScales = allScales.filter((s) => {
            if (!empIds.includes(s.collaborator_id)) return false
            const sDate = new Date(s.date)
            return sDate >= weekAgo
          })
        }
      }

      const todayStr = new Date().toISOString().split('T')[0]
      const todayScales = companyScales.filter((s) => s.date.startsWith(todayStr) && !s.is_day_off)

      setStats({
        total: allEmps.length.toString(),
        totalDocs: companyDocs.length.toString(),
        activeShifts: todayScales.length.toString(),
        activeCompanies: activeCompaniesCount.toString(),
      })

      setLists({
        all: allEmps,
        docs: companyDocs,
        active: todayScales.map((s) => {
          const emp = allEmps.find((e) => e.id === s.collaborator_id)
          return { ...s, collaborator: emp }
        }),
        companies: companies.filter((c) => c.active),
      })

      const typeCounts = { Contract: 0, ID: 0, Other: 0 }
      companyDocs.forEach((d) => {
        if (d.type === 'Contract') typeCounts.Contract++
        else if (d.type === 'ID') typeCounts.ID++
        else typeCounts.Other++
      })

      setPieData([
        { name: 'Contratos', value: typeCounts.Contract, fill: 'hsl(var(--chart-1))' },
        { name: 'Documentos (ID)', value: typeCounts.ID, fill: 'hsl(var(--chart-2))' },
        { name: 'Outros', value: typeCounts.Other, fill: 'hsl(var(--chart-3))' },
      ])

      const daysMap: Record<string, number> = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        daysMap[d.toISOString().split('T')[0]] = 0
      }

      companyScales.forEach((s) => {
        const dStr = s.date.split(' ')[0]
        if (daysMap[dStr] !== undefined && !s.is_day_off) {
          daysMap[dStr] += Number(s.hours) || 0
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
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err)
      setError('Erro ao carregar dados. Tente recarregar a página.')

      // Maintain empty layout rendering
      setStats({
        total: '0',
        totalDocs: '0',
        activeShifts: '0',
        activeCompanies: '0',
      })
      setLists({ all: [], docs: [], active: [], companies: [] })
      setPieData([])
      setBarData([])
    } finally {
      setIsLoading(false)
    }
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

    return drillDownInfo.list.filter((item) => {
      if (drillDownInfo.type === 'emp') {
        return (
          item.name?.toLowerCase().includes(s) ||
          item.cpf?.includes(s) ||
          item.email?.toLowerCase().includes(s) ||
          item.expand?.role_id?.title?.toLowerCase().includes(s)
        )
      }
      if (drillDownInfo.type === 'scale') {
        const empName = item.collaborator?.name?.toLowerCase() || ''
        return empName.includes(s) || item.project_name?.toLowerCase().includes(s)
      }
      if (drillDownInfo.type === 'docs') {
        const empName =
          lists.all.find((e) => e.id === item.collaborator_id)?.name?.toLowerCase() || ''
        return (
          item.name?.toLowerCase().includes(s) ||
          item.type?.toLowerCase().includes(s) ||
          empName.includes(s)
        )
      }
      if (drillDownInfo.type === 'company') {
        return item.name?.toLowerCase().includes(s) || item.cnpj?.includes(s)
      }
      return false
    })
  }, [drillDownInfo, drillDownSearch, lists.all])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Geral</h1>
          <p className="text-muted-foreground mt-1">Visão geral da operação para {company}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" disabled={isLoading || !!error}>
            <Download className="h-4 w-4" /> Relatório Rápido
          </Button>
          <Button
            className="gap-2"
            disabled={isLoading || !!error}
            onClick={() => {
              setEditingEmp(null)
              setIsSheetOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> Novo Colaborador
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl border border-destructive/20 flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Colaboradores"
          value={stats.total}
          icon={Users}
          trend="Ativos"
          isLoading={isLoading}
          onClick={
            !isLoading && !error
              ? () => handleOpenDrillDown('Total de Colaboradores', lists.all, 'emp')
              : undefined
          }
        />
        <StatCard
          title="Total de Documentos"
          value={stats.totalDocs}
          icon={FileText}
          trend="Cadastrados"
          isLoading={isLoading}
          onClick={
            !isLoading && !error
              ? () => handleOpenDrillDown('Total de Documentos', lists.docs, 'docs')
              : undefined
          }
        />
        <StatCard
          title="Turnos Ativos Hoje"
          value={stats.activeShifts}
          icon={Briefcase}
          trend="Normal"
          isLoading={isLoading}
          onClick={
            !isLoading && !error
              ? () => handleOpenDrillDown('Turnos Ativos Hoje', lists.active, 'scale')
              : undefined
          }
        />
        <StatCard
          title="Empresas Ativas"
          value={stats.activeCompanies}
          icon={Building2}
          trend="Visão Geral"
          isLoading={isLoading}
          onClick={
            !isLoading && !error
              ? () => handleOpenDrillDown('Empresas Ativas', lists.companies, 'company')
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-subtle hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Distribuição de Documentos</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center pb-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-[250px] w-full">
                <Skeleton className="h-[200px] w-[200px] rounded-full" />
              </div>
            ) : lists.docs.length > 0 ? (
              <CompliancePieChart data={pieData} />
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                Nenhum dado encontrado
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-subtle hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Horas Trabalhadas na Semana</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-end justify-between h-[250px] w-full gap-4 pt-10 px-4 pb-8">
                {[40, 70, 45, 90, 60, 30, 50].map((h, i) => (
                  <Skeleton key={i} className="w-full rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            ) : barData.length > 0 && barData.some((d) => d.hours > 0) ? (
              <HoursBarChart data={barData} />
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                Nenhum dado encontrado
              </div>
            )}
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
                placeholder="Buscar..."
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
                className={`p-4 bg-muted/10 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  drillDownInfo?.type === 'emp' || drillDownInfo?.type === 'scale'
                    ? 'cursor-pointer hover:bg-muted/40'
                    : ''
                }`}
                onClick={() => {
                  if (drillDownInfo?.type === 'emp' || drillDownInfo?.type === 'scale') {
                    setDrillDownInfo(null)
                    setEditingEmp(item.collaborator || item)
                    setIsSheetOpen(true)
                  }
                }}
              >
                <div>
                  <p className="font-semibold text-primary">
                    {drillDownInfo?.type === 'company'
                      ? item.name
                      : drillDownInfo?.type === 'docs'
                        ? item.name
                        : item.name || item.collaborator?.name || 'Não definido'}
                  </p>

                  {drillDownInfo?.type === 'emp' && (
                    <>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Cargo: {item.expand?.role_id?.title || 'Não definido'}
                      </p>
                      {item.email && (
                        <p className="text-xs text-muted-foreground mt-0.5">E-mail: {item.email}</p>
                      )}
                    </>
                  )}

                  {drillDownInfo?.type === 'scale' && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Horário: {item.start_time} - {item.end_time} | {item.hours}h
                    </p>
                  )}

                  {drillDownInfo?.type === 'docs' && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tipo: {item.type} | Colaborador:{' '}
                      {lists.all.find((e) => e.id === item.collaborator_id)?.name || 'Desconhecido'}
                    </p>
                  )}

                  {drillDownInfo?.type === 'company' && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      CNPJ: {item.cnpj || 'Não informado'}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {filteredDrillDown.length === 0 && (
              <div className="text-center py-10 px-4 rounded-xl border border-dashed bg-muted/10 mt-4">
                <p className="text-muted-foreground text-sm font-medium">
                  Nenhum item encontrado com os filtros aplicados.
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
  isLoading = false,
}: {
  title: string
  value: string
  icon: any
  trend: string
  isWarning?: boolean
  onClick?: () => void
  isLoading?: boolean
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
          {isLoading ? (
            <Skeleton className="h-9 w-16 mb-1" />
          ) : (
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          )}
          <p className="text-sm font-medium text-muted-foreground mt-1">{title}</p>
        </div>
        <div className="mt-4 flex items-center text-xs font-medium">
          {isLoading ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            <span className={isWarning ? 'text-accent' : 'text-primary'}>{trend}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
