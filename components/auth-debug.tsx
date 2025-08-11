'use client'

import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthDebug() {
  const { user, loading } = useAuth()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <Card className="fixed bottom-4 right-4 w-64 z-50 bg-yellow-50 border-yellow-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Auth Debug</CardTitle>
      </CardHeader>
      <CardContent className="text-xs">
        <div className="space-y-1">
          <div>Loading: {loading ? 'true' : 'false'}</div>
          <div>User: {user ? user.email : 'null'}</div>
          <div>Path: {typeof window !== 'undefined' ? window.location.pathname : 'SSR'}</div>
        </div>
      </CardContent>
    </Card>
  )
}
