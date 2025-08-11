'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (error) {
          console.error('Error getting session:', error)
          setUser(null)
        } else {
          console.log('📋 Initial session:', session?.user?.email || 'no user')
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    getInitialSession()

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      console.log('🔐 Auth event:', event, session?.user?.email || 'no user')
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Attempting sign in for:', email)
    
    try {
      // Primero verificar si el usuario existe en nuestra tabla
      const { data: userExists } = await supabase
        .from('users')
        .select('email, name')
        .eq('email', email)
        .single()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Supabase auth error:', error)
        
        // Mapear errores específicos a mensajes más claros
        let errorMessage = 'Error de autenticación'
        
        switch (error.message) {
          case 'Invalid login credentials':
            if (!userExists) {
              errorMessage = `❌ **Usuario no encontrado**\n\nNo existe una cuenta registrada con el email: **${email}**\n\n**Usuarios disponibles para prueba:**\n• admin@empresa.com\n• manager@empresa.com\n• user@empresa.com`
            } else {
              errorMessage = `🔐 **Contraseña incorrecta**\n\nEl email **${email}** existe, pero la contraseña no es correcta.\n\n**Para usuarios de prueba:**\n• admin@empresa.com → admin123\n• manager@empresa.com → manager123\n• user@empresa.com → user123`
            }
            break
          case 'Email not confirmed':
            errorMessage = `📧 **Email no confirmado**\n\nDebes confirmar tu email antes de iniciar sesión.\n\nRevisa tu bandeja de entrada y haz clic en el enlace de confirmación.`
            break
          case 'Too many requests':
            errorMessage = `⏰ **Demasiados intentos**\n\nHas realizado muchos intentos de inicio de sesión.\n\nEspera **5 minutos** antes de intentar nuevamente.`
            break
          case 'User not found':
            errorMessage = `👤 **Usuario no encontrado**\n\nNo existe una cuenta con el email: **${email}**\n\n**¿Es tu primera vez?** Contacta al administrador para crear tu cuenta.`
            break
          case 'Signup not allowed for this instance':
            errorMessage = `🚫 **Registro deshabilitado**\n\nEl registro de nuevos usuarios está deshabilitado.\n\nContacta al administrador del sistema.`
            break
          default:
            errorMessage = `⚠️ **Error de conexión**\n\n${error.message}\n\nSi el problema persiste, contacta al soporte técnico.`
        }
        
        const customError = new Error(errorMessage)
        customError.name = 'AuthError'
        throw customError
      }

      if (!data.user) {
        throw new Error('❌ **Error del servidor**\n\nNo se pudo obtener la información del usuario.\n\nIntenta nuevamente en unos momentos.')
      }

      console.log('✅ Sign in successful:', data.user.email)
      
      // Esperar un poco para que se propague la sesión
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return data
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    console.log('🚪 Starting logout...')
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase logout error:', error)
      }

      setUser(null)
      
      // Limpiar storage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }

      console.log('✅ Logout completed')
      window.location.href = '/login'
      
    } catch (error) {
      console.error('Logout error:', error)
      setUser(null)
      window.location.href = '/login'
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
