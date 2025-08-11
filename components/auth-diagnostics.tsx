'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Database, RefreshCw } from 'lucide-react'

export function AuthDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    const results: any = {
      supabaseConnection: false,
      authUsers: 0,
      publicUsers: 0,
      errors: []
    }

    try {
      // Test Supabase connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true })

      if (connectionError) {
        results.errors.push(`Connection error: ${connectionError.message}`)
      } else {
        results.supabaseConnection = true
        results.publicUsers = connectionTest || 0
      }

      // Test auth users (this might fail due to RLS)
      try {
        const { data: authTest } = await supabase.auth.admin.listUsers()
        results.authUsers = authTest?.users?.length || 0
      } catch (error) {
        results.errors.push('Cannot access auth.users (normal for client-side)')
      }

      // Test specific user existence
      const testEmails = ['admin@empresa.com', 'manager@empresa.com', 'user@empresa.com']
      for (const email of testEmails) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('email, name, role')
            .eq('email', email)
            .single()

          if (error) {
            results.errors.push(`User ${email} not found in public.users: ${error.message}`)
          } else {
            results[`user_${email.split('@')[0]}`] = data
          }
        } catch (error) {
          results.errors.push(`Error checking ${email}: ${error}`)
        }
      }

    } catch (error) {
      results.errors.push(`General error: ${error}`)
    }

    setDiagnostics(results)
    setLoading(false)
  }

  const testLogin = async (email: string, password: string) => {
    try {
      console.log(`Testing login for ${email}...`)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error(`Login test failed for ${email}:`, error)
        alert(`Login failed for ${email}: ${error.message}`)
      } else {
        console.log(`Login successful for ${email}`)
        alert(`Login successful for ${email}!`)
        // Sign out immediately
        await supabase.auth.signOut()
      }
    } catch (error) {
      console.error(`Login test error for ${email}:`, error)
      alert(`Login test error for ${email}: ${error}`)
    }
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Diagnósticos de Autenticación
        </CardTitle>
        <CardDescription>
          Herramientas de desarrollo para diagnosticar problemas de auth
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={runDiagnostics} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Ejecutando...
              </>
            ) : (
              'Ejecutar Diagnósticos'
            )}
          </Button>

          {diagnostics && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  {diagnostics.supabaseConnection ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Conexión Supabase</span>
                </div>
                <Badge variant="outline">
                  {diagnostics.publicUsers} usuarios públicos
                </Badge>
              </div>

              {diagnostics.errors.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Errores encontrados</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside text-sm mt-2">
                      {diagnostics.errors.map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">Test de Login</h4>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testLogin('admin@empresa.com', 'admin123')}
                  >
                    Test Admin
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testLogin('manager@empresa.com', 'manager123')}
                  >
                    Test Manager
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testLogin('user@empresa.com', 'user123')}
                  >
                    Test User
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
