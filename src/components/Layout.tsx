import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Clock,
  FileText,
  Settings,
  LogOut,
  Building2,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { AppContextType, Company } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [company, setCompany] = useState<Company>('Primer Pisos')

  const handleLogout = () => {
    signOut()
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Empresas', href: '/empresas', icon: Building2 },
    { name: 'Colaboradores', href: '/colaboradores', icon: Users },
    { name: 'Cargos', href: '/cargos', icon: Briefcase },
    { name: 'Ponto', href: '/ponto', icon: Clock },
    { name: 'Documentos', href: '/documentos', icon: FileText },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ]

  const contextValue: AppContextType = {
    company,
    setCompany,
  }

  return (
    <div className="flex h-screen bg-muted/20">
      <aside className="w-64 bg-background border-r flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-lg font-bold text-primary">Sistema RH</h1>
        </div>

        <div className="p-4 border-b">
          <Select value={company} onValueChange={(value) => setCompany(value as Company)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Primer Pisos">Primer Pisos</SelectItem>
              <SelectItem value="Piso Plano">Piso Plano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href))
            return (
              <Link key={item.name} to={item.href}>
                <span
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet context={contextValue} />
        </div>
      </main>
    </div>
  )
}

export default Layout
