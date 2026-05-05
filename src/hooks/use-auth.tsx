import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  role: string | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRole = async (u: User | null) => {
      if (!u) {
        setRole(null)
        return
      }
      let foundRole = null
      const { data: hrProfile } = await supabase
        .from('hr_profiles')
        .select('*')
        .eq('email', u.email)
        .maybeSingle()
      if (hrProfile) {
        foundRole = hrProfile.role
      } else {
        const { data: sysUser } = await supabase
          .from('usuario_sistema')
          .select('tipo_usuario')
          .eq('email', u.email)
          .maybeSingle()
        if (sysUser) foundRole = sysUser.tipo_usuario
      }
      setRole(foundRole || 'Usuario')
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchRole(session.user)
      } else {
        setRole(null)
      }
      setLoading(false)
    })

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchRole(session.user)
      } else {
        setRole(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    // Clear any stale session before attempting to sign in to prevent session conflicts
    await supabase.auth.signOut()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, session, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
