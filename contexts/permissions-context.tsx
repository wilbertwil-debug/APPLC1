'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'

export interface Permission {
  module: string
  action: 'read' | 'create' | 'update' | 'delete'
  allowed: boolean
}

export interface UserPermissions {
  // Módulos principales
  dashboard: {
    read: boolean
  }
  equipment: {
    read: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  employees: {
    read: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  users: {
    read: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  tickets: {
    read: boolean
    create: boolean
    update: boolean
    delete: boolean
    viewInternal: boolean
    addComments: boolean
  }
  equipmentTypes: {
    read: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  serviceStations: {
    read: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  aiAssistant: {
    read: boolean
  }
  // Permisos especiales
  canAccessAdminPanel: boolean
}

interface PermissionsContextType {
  permissions: UserPermissions | null
  loading: boolean
  hasPermission: (module: keyof UserPermissions, action?: string) => boolean
  canAccessModule: (module: keyof UserPermissions) => boolean
  refreshPermissions: () => Promise<void>
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

// Permisos por defecto según el rol
const getDefaultPermissions = (role: string): UserPermissions => {
  const basePermissions: UserPermissions = {
    dashboard: { read: false },
    equipment: { read: false, create: false, update: false, delete: false },
    employees: { read: false, create: false, update: false, delete: false },
    users: { read: false, create: false, update: false, delete: false },
    tickets: { read: false, create: false, update: false, delete: false, viewInternal: false, addComments: false },
    equipmentTypes: { read: false, create: false, update: false, delete: false },
    serviceStations: { read: false, create: false, update: false, delete: false },
    aiAssistant: { read: false },
    canAccessAdminPanel: false,
  }

  switch (role) {
    case 'admin':
      return {
        dashboard: { read: true },
        equipment: { read: true, create: true, update: true, delete: true },
        employees: { read: true, create: true, update: true, delete: true },
        users: { read: true, create: true, update: true, delete: true },
        tickets: { read: true, create: true, update: true, delete: true, viewInternal: true, addComments: true },
        equipmentTypes: { read: true, create: true, update: true, delete: true },
        serviceStations: { read: true, create: true, update: true, delete: true },
        aiAssistant: { read: true },
        canAccessAdminPanel: true,
      }

    case 'manager':
      return {
        dashboard: { read: true },
        equipment: { read: true, create: true, update: true, delete: false },
        employees: { read: true, create: true, update: true, delete: false },
        users: { read: true, create: false, update: false, delete: false },
        tickets: { read: true, create: true, update: true, delete: false, viewInternal: true, addComments: true },
        equipmentTypes: { read: true, create: true, update: true, delete: false },
        serviceStations: { read: true, create: true, update: true, delete: false },
        aiAssistant: { read: true },
        canAccessAdminPanel: false,
      }

    case 'user':
    default:
      return {
        dashboard: { read: true },
        equipment: { read: false, create: false, update: false, delete: false },
        employees: { read: false, create: false, update: false, delete: false },
        users: { read: false, create: false, update: false, delete: false },
        tickets: { read: true, create: true, update: false, delete: false, viewInternal: false, addComments: true },
        equipmentTypes: { read: false, create: false, update: false, delete: false },
        serviceStations: { read: false, create: false, update: false, delete: false },
        aiAssistant: { read: true },
        canAccessAdminPanel: false,
      }
  }
}

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserRole = async () => {
    if (!user) {
      setPermissions(null)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        // Si no se encuentra el usuario, usar permisos de usuario básico
        setPermissions(getDefaultPermissions('user'))
      } else {
        const userRole = data?.role || 'user'
        setPermissions(getDefaultPermissions(userRole))
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error)
      setPermissions(getDefaultPermissions('user'))
    } finally {
      setLoading(false)
    }
  }

  const refreshPermissions = async () => {
    setLoading(true)
    await fetchUserRole()
  }

  useEffect(() => {
    if (!authLoading) {
      fetchUserRole()
    }
  }, [user, authLoading])

  const hasPermission = (module: keyof UserPermissions, action?: string): boolean => {
    if (!permissions) return false

    const modulePermissions = permissions[module]
    if (!modulePermissions) return false

    if (!action) {
      // Si no se especifica acción, verificar si tiene algún permiso en el módulo
      return Object.values(modulePermissions).some(permission => permission === true)
    }

    // Verificar permiso específico
    return (modulePermissions as any)[action] === true
  }

  const canAccessModule = (module: keyof UserPermissions): boolean => {
    if (!permissions) return false

    // Para módulos simples como dashboard y aiAssistant
    if (typeof permissions[module] === 'object' && 'read' in permissions[module]) {
      return (permissions[module] as any).read === true
    }

    // Para otros módulos, verificar si tiene al menos permiso de lectura
    return hasPermission(module, 'read')
  }

  return (
    <PermissionsContext.Provider value={{
      permissions,
      loading,
      hasPermission,
      canAccessModule,
      refreshPermissions
    }}>
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }
  return context
}
