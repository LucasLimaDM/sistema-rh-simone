import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { AppContextType } from '@/lib/types'
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import {
  LogOut,
  Settings,
  Users,
  Building2,
  Clock,
  FileText,
  LayoutDashboard,
  Briefcase,
  FileSignature,
  ChevronDown,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { InitialSetupModal } from '@/components/layout/initial-setup-modal'

export default function Layout() {
  const { user, signOut } = useAuth()
  const [company, setCompany] = useState<string>('')
  const [showInitialSetup, setShowInitialSetup] = useState(false)
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<any[]>([])
  const location = useLocation()

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!user) return
      try {
        const result = await pb.collection('companies').getFullList({
          filter: `user_id = '${user.id}'`,
          sort: 'created',
        })
        setCompanies(result)
        if (result.length === 0) {
          setShowInitialSetup(true)
        } else {
          setCompany(result[0].name)
          setShowInitialSetup(false)
        }
      } catch (err) {
        console.error('Error fetching companies', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCompanies()
  }, [user])

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>
  }

  const navItems = [
    { title: 'Dashboard', path: '/', icon: LayoutDashboard },
    { title: 'Empresas', path: '/empresas', icon: Building2 },
    { title: 'Colaboradores', path: '/colaboradores', icon: Users },
    { title: 'Cargos', path: '/cargos', icon: Briefcase },
    { title: 'Ponto', path: '/ponto', icon: Clock },
    { title: 'Escalas', path: '/escalas', icon: Clock },
    { title: 'Modelos', path: '/modelos', icon: FileSignature },
    { title: 'Documentos', path: '/documentos', icon: FileText },
  ]
  if (user?.role === 'Admin') {
    navItems.push({ title: 'Configurações', path: '/configuracoes', icon: Settings })
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1 rounded-md">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">Sistema RH</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="px-2 py-4 gap-1">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.path}
                  tooltip={item.title}
                >
                  <Link to={item.path}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={user?.avatar ? pb.files.getURL(user, user.avatar) : ''} />
                  <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-xs overflow-hidden">
                  <span className="font-medium truncate w-full">{user?.name}</span>
                  <span className="text-muted-foreground truncate w-full">{user?.email}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b px-4 lg:px-6">
          <SidebarTrigger />
          <div className="flex-1" />
          {companies.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  <span className="max-w-[150px] truncate">{company || 'Selecionar Empresa'}</span>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Trocar Empresa</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {companies.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onClick={() => setCompany(c.name)}
                    className="cursor-pointer"
                  >
                    {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-muted/20">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet context={{ company, setCompany } as AppContextType} />
          </div>
        </main>
      </SidebarInset>

      {showInitialSetup && (
        <InitialSetupModal
          open={showInitialSetup}
          onComplete={(newCompany) => {
            setCompany(newCompany)
            setShowInitialSetup(false)
            window.location.reload()
          }}
        />
      )}
    </SidebarProvider>
  )
}
