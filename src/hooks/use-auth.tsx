import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import type { AuthModel } from 'pocketbase'

interface AuthContextType {
  user: AuthModel | null
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
  const [user, setUser] = useState<AuthModel | null>(pb.authStore.record)
  const [role, setRole] = useState<string | null>(pb.authStore.record?.role || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(pb.authStore.record)
    setRole(pb.authStore.record?.role || null)
    setLoading(false)

    const unsubscribe = pb.authStore.onChange((token, record) => {
      setUser(record)
      setRole(record?.role || null)
    }, true)

    return () => {
      unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      pb.authStore.clear()
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      pb.authStore.clear()
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  return (
    <AuthContext.Provider value={{ user, role, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
