import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bell,
  Briefcase,
  CalendarDays,
  LayoutDashboard,
  Settings,
  Users,
  LogOut,
  Building2,
  Clock,
  FileText,
  Files,
} from 'lucide-react'
import { Company, AppContextType } from '@/lib/types'
const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Empresas', url: '/empresas', icon: Building2 },
  { title: 'Colaboradores', url: '/colaboradores', icon: Users },
  { title: 'Cargos', url: '/cargos', icon: Briefcase },
  { title: 'Controle de Ponto', url: '/ponto', icon: Clock },
  { title: 'Gestão de Escalas', url: '/escalas', icon: CalendarDays },
  { title: 'Modelos', url: '/modelos', icon: FileText },
  { title: 'Documentos', url: '/documentos', icon: Files },
  { title: 'Gestão de Equipes', url: '/equipes', icon: Users },
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
]

export default function Layout() {
  const [company, setCompany] = useState<Company>('Primer Pisos')
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [expiringDocs, setExpiringDocs] = useState<any[]>([])

  useEffect(() => {
    if (user?.email) {
      supabase
        .from('hr_profiles')
        .select('*')
        .eq('email', user.email)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setProfile(data)
          } else {
            supabase
              .from('usuario_sistema')
              .select('*, name:nome_completo, role:tipo_usuario')
              .eq('email', user.email)
              .maybeSingle()
              .then(({ data: sysData }) => {
                if (sysData) setProfile(sysData)
              })
          }
        })
    } else if (user) {
      supabase
        .from('usuario_sistema')
        .select('*, name:nome_completo, role:tipo_usuario')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setProfile(data)
        })
    }
  }, [user])

  useEffect(() => {
    const fetchDocs = async () => {
      const { data } = await supabase
        .from('employee_documents')
        .select('*, employees!inner(name, company)')
        .eq('employees.company', company)
        .lt('expiry_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())

      if (data) {
        const formatted = data.map((d: any) => {
          const isExpired = new Date(d.expiry_date) < new Date()
          return {
            id: d.id,
            name: d.employees.name,
            type: d.document_type,
            status: isExpired ? 'expired' : 'expiring',
          }
        })
        setExpiringDocs(formatted)
      }
    }
    fetchDocs()
  }, [company])

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-sans text-foreground">
        <Sidebar variant="inset" className="border-r border-border">
          <SidebarHeader className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2 px-2">
              <img
                src="https://www.dropbox.com/scl/fi/uif2udurshp3vgx495fv9/Logo-Primer-Pisos-leve.jpg?rlkey=l0e8y7sr580cmgg798b0aafiq&raw=1"
                alt="Primer Pisos Logo"
                className="h-10 w-auto rounded-md object-contain"
              />
              <span className="text-xl font-bold tracking-tight text-primary">Primer Pisos</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        tooltip={item.title}
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 w-full overflow-hidden">
          <header className="h-16 flex items-center justify-between px-6 border-b bg-card shadow-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="hidden md:flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <Select value={company} onValueChange={(v) => setCompany(v as Company)}>
                  <SelectTrigger className="w-[180px] border-none shadow-none font-semibold text-base focus:ring-0">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Primer Pisos">Primer Pisos</SelectItem>
                    <SelectItem value="Piso Plano">Piso Plano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-muted-foreground hover:text-primary"
                  >
                    <Bell className="h-5 w-5" />
                    {expiringDocs.length > 0 && (
                      <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-accent rounded-full ring-2 ring-card" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="p-4 border-b">
                    <h4 className="font-semibold">Notificações</h4>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-2">
                    {expiringDocs.length > 0 ? (
                      expiringDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3 text-sm border-b last:border-0 hover:bg-muted rounded-md transition-colors"
                        >
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-muted-foreground">
                            Documento {doc.status === 'expired' ? 'vencido' : 'a vencer'}!
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-sm text-muted-foreground p-4">Tudo em dia!</p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-3 border-l pl-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-semibold leading-none">
                    {profile?.name || user?.user_metadata?.name || 'Usuário'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {profile?.role || 'Acesso Limitado'}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 border-2 border-primary/20 cursor-pointer">
                      {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} /> : null}
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {(profile?.name || user?.user_metadata?.name || 'U')
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer"
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-in-up">
            <Outlet context={{ company, setCompany } as AppContextType} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
