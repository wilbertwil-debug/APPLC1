'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    console.log('🛡️ ProtectedRoute check:', { user: user?.email, loading })
    
    if (!loading && !user) {
      console.log('🔒 No user found, will redirect to login')
      setShouldRedirect(true)
      
      // Usar setTimeout para evitar problemas de hidratación
      setTimeout(() => {
        router.replace('/login')
      }, 100)
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!user || shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  console.log('✅ ProtectedRoute allowing access for:', user.email)
  return <>{children}</>
}
