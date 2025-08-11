'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Monitor, Eye, EyeOff } from 'lucide-react'
import { AuthDiagnostics } from '@/components/auth-diagnostics'
import { AuthErrorDialog } from '@/components/auth-error-dialog'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const { signIn, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (!authLoading && user) {
      console.log('👤 User already logged in, redirecting to dashboard')
      router.replace('/dashboard')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setAuthError('')

    try {
      console.log('🔐 Attempting login for:', email)
      await signIn(email, password)
      
      toast({
        title: '✅ Bienvenido',
        description: 'Has iniciado sesión correctamente',
      })
      
      console.log('✅ Login successful, redirecting to dashboard')
      router.push('/dashboard')
      
    } catch (error: any) {
      console.error('Login error:', error)
      setAuthError(error.message || 'Error desconocido al iniciar sesión')
      setShowErrorDialog(true)
    } finally {
      setLoading(false)
    }
  }

  const fillDemoCredentials = (role: 'admin' | 'manager' | 'user') => {
    const credentials = {
      admin: { email: 'admin@empresa.com', password: 'admin123' },
      manager: { email: 'manager@empresa.com', password: 'manager123' },
      user: { email: 'user@empresa.com', password: 'user123' }
    }
    
    setEmail(credentials[role].email)
    setPassword(credentials[role].password)
  }

  // Mostrar loading si está verificando autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // Si ya está logueado, mostrar mensaje de redirección
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ya estás conectado, redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Monitor className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Sistema de Gestión de Inventario Tecnológico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Credenciales de Prueba</CardTitle>
            <CardDescription>
              Haz clic en cualquier botón para llenar automáticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => fillDemoCredentials('admin')}
                type="button"
                disabled={loading}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Administrador (admin@empresa.com)</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => fillDemoCredentials('manager')}
                type="button"
                disabled={loading}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Gerente (manager@empresa.com)</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => fillDemoCredentials('user')}
                type="button"
                disabled={loading}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Usuario (user@empresa.com)</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <AuthDiagnostics />

        <AuthErrorDialog 
          open={showErrorDialog}
          onOpenChange={setShowErrorDialog}
          error={authError}
        />
      </div>
    </div>
  )
}
