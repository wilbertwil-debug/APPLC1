'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { LogOut, Loader2 } from 'lucide-react'

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  onClick?: () => void
}

export function LogoutButton({ 
  variant = 'ghost', 
  size = 'default',
  className = '',
  onClick
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const { signOut } = useAuth()
  const { toast } = useToast()

  const handleSignOut = async () => {
    if (loading) return
    
    setLoading(true)
    
    try {
      console.log('🔴 Logout button clicked')
      
      toast({
        title: 'Cerrando sesión...',
        description: 'Por favor espera',
      })
      
      await signOut()
      
      if (onClick) {
        onClick()
      }
      
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: 'Error',
        description: 'Error al cerrar sesión, pero se limpiará localmente',
        variant: 'destructive',
      })
      
      // Forzar logout de todas formas
      window.location.replace('/login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
      disabled={loading}
      onClick={handleSignOut}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      {loading ? 'Cerrando...' : 'Cerrar Sesión'}
    </Button>
  )
}
