"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("⚠️ Supabase is not configured")
      setError("Supabase no está configurado. Verifica las variables de entorno en tu proyecto Vercel.")
      setLoading(false)
      return
    }

    const supabase = createClient()
    if (!supabase) {
      setError("No se pudo inicializar Supabase")
      setLoading(false)
      return
    }

    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        console.log("🔍 Getting initial session...")
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (sessionError) {
          console.error("Error getting session:", sessionError)
          setError("Error de conexión con Supabase. Verifica tu configuración.")
          setUser(null)
        } else {
          console.log("📋 Initial session:", session?.user?.email || "no user")
          setUser(session?.user ?? null)
          setError(null)
        }
      } catch (error: any) {
        console.error("Error in getInitialSession:", error)
        if (mounted) {
          setError("Error de conexión con Supabase. Verifica tu configuración.")
          setUser(null)
        }
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

      console.log("🔐 Auth event:", event, session?.user?.email || "no user")
      setUser(session?.user ?? null)
      setLoading(false)
      setError(null)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log("[v0] Attempting sign in for:", email)

    try {
      const supabase = createClient()
      if (!supabase) {
        throw new Error("Supabase no está configurado correctamente")
      }

      console.log("[v0] Supabase client created successfully")
      console.log("[v0] Supabase URL check: attempting connection...")

      const { data, error } = await supabase.auth
        .signInWithPassword({
          email,
          password,
        })
        .catch((networkError: any) => {
          console.error("[v0] Network error during authentication:", {
            message: networkError.message,
            code: networkError.code,
            statusText: networkError.statusText,
          })
          return { data: null, error: networkError }
        })

      console.log("[v0] Sign in response received", { hasData: !!data, hasError: !!error })

      if (error) {
        console.error("[v0] Supabase auth error:", error.message)

        let errorMessage = "Error de autenticación"

        if (error.message.includes("Failed to fetch") || error.message.includes("fetch")) {
          errorMessage = `⚠️ **Error de conexión**\n\nNo se puede conectar con el servidor de autenticación.\n\nVerifica:\n1. Tu conexión a internet\n2. Que las variables de entorno estén configuradas\n3. Que tu Supabase project esté activo\n\nSi el problema persiste, contacta al soporte técnico.`
        } else {
          switch (error.message) {
            case "Invalid login credentials":
              errorMessage = `🔐 **Contraseña incorrecta o usuario no encontrado**\n\nVerifica que el email y la contraseña sean correctos.`
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

      console.log("[v0] Sign in successful:", data.user.email)

      // Esperar un poco para que se propague la sesión
      await new Promise((resolve) => setTimeout(resolve, 500))

      return data
    } catch (error) {
      console.error("[v0] Sign in error:", error)
      throw error
    }
  }

  const signOut = async () => {
    console.log("🚪 Starting logout...")

    try {
      const supabase = createClient()
      if (!supabase) {
        throw new Error("Supabase no está configurado")
      }

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
          <p className="text-gray-600 mb-4 whitespace-pre-wrap">{error}</p>
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
