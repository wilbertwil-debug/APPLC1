'use client'

import { usePermissions, UserPermissions } from '@/contexts/permissions-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Lock } from 'lucide-react'

interface PermissionGuardProps {
  children: React.ReactNode
  module: keyof UserPermissions
  action?: string
  fallback?: React.ReactNode
}

export function PermissionGuard({ 
  children, 
  module, 
  action, 
  fallback 
}: PermissionGuardProps) {
  const { hasPermission, loading } = usePermissions()

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        <span>Verificando permisos...</span>
      </div>
    )
  }

  const hasAccess = action ? hasPermission(module, action) : hasPermission(module)

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>No tienes permisos para acceder a esta funcionalidad.</span>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}
