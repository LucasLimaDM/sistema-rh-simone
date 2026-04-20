import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
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
  Bell,
  Briefcase,
  CalendarDays,
  LayoutDashboard,
  Settings,
  Users,
  LogOut,
  Building2,
  Clock,
} from 'lucide-react'
import { Company, AppContextType } from '@/lib/types'
import { mockEmployees } from '@/lib/mock'

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Colaboradores', url: '/colaboradores', icon: Users },
  { title: 'Controle de Ponto', url: '/ponto', icon: Clock },
  { title: 'Gestão de Escalas', url: '/escalas', icon: CalendarDays },
  { title: 'Usuários', url: '/usuarios', icon: Settings },
]

export default function Layout() {
  const [company, setCompany] = useState<Company>('Primer Pisos')
  const location = useLocation()

  const expiringDocs = mockEmployees.filter(
    (e) => e.status === 'expiring' || e.status === 'expired',
  )

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
                  <span className="text-sm font-semibold leading-none">Admin</span>
                  <span className="text-xs text-muted-foreground">Coordenador RH</span>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
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
