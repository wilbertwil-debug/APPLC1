import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { PermissionsProvider } from '@/contexts/permissions-context'
import { Toaster } from '@/components/ui/toaster'
import { AuthDebug } from '@/components/auth-debug'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema de Gestión de Inventario',
  description: 'Sistema completo de gestión de inventario tecnológico',
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <PermissionsProvider>
            {children}
            <Toaster />
            <AuthDebug />
          </PermissionsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
