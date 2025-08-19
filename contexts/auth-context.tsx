"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Verificar configuración de Supabase primero
    const checkSupabaseConfig = () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("❌ Supabase not configured")
        setError("Supabase no está configurado. Verifica las variables de entorno.")
        setLoading(false)
        return false
      }
      return true
    }

    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        if (!checkSupabaseConfig()) return

        console.log("🔍 Getting initial session...")
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error("Error getting session:", error)
          if (error.message.includes("NetworkError") || error.message.includes("fetch")) {
            setError("Error de conexión con Supabase. Verifica tu conexión a internet y la configuración.")
          } else {
            setError(`Error de autenticación: ${error.message}`)
          }
          setUser(null)
        } else {
          console.log("📋 Initial session:", session?.user?.email || "no user")
          setUser(session?.user ?? null)
          setError(null)
        }
      } catch (error: any) {
        console.error("Error in getInitialSession:", error)
        if (mounted) {
          if (error.name === "TypeError" && error.message.includes("NetworkError")) {
            setError("Error de red: No se puede conectar con Supabase. Verifica la configuración y tu conexión.")
          } else {
            setError(`Error inesperado: ${error.message}`)
          }
          setUser(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    getInitialSession()

    if (checkSupabaseConfig()) {
      // Escuchar cambios de autenticación
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return

        console.log("🔐 Auth event:", event, session?.user?.email || "no user")
        setUser(session?.user ?? null)
        setLoading(false)
        setError(null)
      })

      return () => {
        mounted = false
        subscription.unsubscribe()
      }
    }

    return () => {
      mounted = false
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log("🔑 Attempting sign in for:", email)

    try {
      // Primero verificar si el usuario existe en nuestra tabla
      const { data: userExists } = await supabase.from("users").select("email, name").eq("email", email).single()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Supabase auth error:", error)

        // Mapear errores específicos a mensajes más claros
        let errorMessage = "Error de autenticación"

        switch (error.message) {
          case "Invalid login credentials":
            if (!userExists) {
              errorMessage = `❌ **Usuario no encontrado**\n\nNo existe una cuenta registrada con el email: **${email}**\n\n**Usuarios disponibles para prueba:**\n• admin@empresa.com\n• manager@empresa.com\n• user@empresa.com`
            } else {
              errorMessage = `🔐 **Contraseña incorrecta**\n\nEl email **${email}** existe, pero la contraseña no es correcta.\n\n**Para usuarios de prueba:**\n• admin@empresa.com → admin123\n• manager@empresa.com → manager123\n• user@empresa.com → user123`
            }
            break
          case "Email not confirmed":
            errorMessage = `📧 **Email no confirmado**\n\nDebes confirmar tu email antes de iniciar sesión.\n\nRevisa tu bandeja de entrada y haz clic en el enlace de confirmación.`
            break
          case "Too many requests":
            errorMessage = `⏰ **Demasiados intentos**\n\nHas realizado muchos intentos de inicio de sesión.\n\nEspera **5 minutos** antes de intentar nuevamente.`
            break
          case "User not found":
            errorMessage = `👤 **Usuario no encontrado**\n\nNo existe una cuenta con el email: **${email}**\n\n**¿Es tu primera vez?** Contacta al administrador para crear tu cuenta.`
            break
          case "Signup not allowed for this instance":
            errorMessage = `🚫 **Registro deshabilitado**\n\nEl registro de nuevos usuarios está deshabilitado.\n\nContacta al administrador del sistema.`
            break
          default:
            errorMessage = `⚠️ **Error de conexión**\n\n${error.message}\n\nSi el problema persiste, contacta al soporte técnico.`
        }

        const customError = new Error(errorMessage)
        customError.name = "AuthError"
        throw customError
      }

      if (!data.user) {
        throw new Error(
          "❌ **Error del servidor**\n\nNo se pudo obtener la información del usuario.\n\nIntenta nuevamente en unos momentos.",
        )
      }

      console.log("✅ Sign in successful:", data.user.email)

      // Esperar un poco para que se propague la sesión
      await new Promise((resolve) => setTimeout(resolve, 500))

      return data
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const signOut = async () => {
    console.log("🚪 Starting logout...")

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Supabase logout error:", error)
      }

      setUser(null)

      // Limpiar storage
      if (typeof window !== "undefined") {
        localStorage.clear()
        sessionStorage.clear()
      }

      console.log("✅ Logout completed")
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout error:", error)
      setUser(null)
      window.location.href = "/login"
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error de Configuración</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-sm text-gray-500">
            <p className="mb-2">Para configurar Supabase:</p>
            <ol className="text-left list-decimal list-inside space-y-1">
              <li>Ve a Project Settings en Vercel</li>
              <li>Agrega las variables de entorno:</li>
              <ul className="ml-4 list-disc list-inside">
                <li>NEXT_PUBLIC_SUPABASE_URL</li>
                <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              </ul>
              <li>Redeploy la aplicación</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut, error }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
