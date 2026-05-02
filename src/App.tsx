import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import Companies from './pages/Companies'
import Employees from './pages/Employees'
import TimeTracking from './pages/TimeTracking'
import Roles from './pages/Roles'
import WorkScales from './pages/WorkScales'
import Templates from './pages/Templates'
import Documents from './pages/Documents'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import FirstAccess from './pages/FirstAccess'
import { AuthProvider, useAuth } from './hooks/use-auth'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center">Carregando...</div>
  if (!user) return <Navigate to="/login" />
  return <>{children}</>
}

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center">Carregando...</div>
  if (!user) return <Navigate to="/login" />
  if (user.role !== 'Admin') return <Navigate to="/" />
  return <>{children}</>
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/primeiro-acesso" element={<FirstAccess />} />
    <Route
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route path="/" element={<Index />} />
      <Route path="/empresas" element={<Companies />} />
      <Route path="/colaboradores" element={<Employees />} />
      <Route path="/cargos" element={<Roles />} />
      <Route path="/ponto" element={<TimeTracking />} />
      <Route path="/escalas" element={<WorkScales />} />
      <Route path="/modelos" element={<Templates />} />
      <Route path="/documentos" element={<Documents />} />
      <Route
        path="/configuracoes"
        element={
          <AdminRoute>
            <Settings />
          </AdminRoute>
        }
      />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
)

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
