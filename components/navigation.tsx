"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { usePermissions } from "@/contexts/permissions-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Menu,
  Home,
  Monitor,
  Users,
  UserCheck,
  Settings,
  MapPin,
  Ticket,
  Bot,
  Shield,
  BarChart3,
  FolderOpen,
} from "lucide-react"
import { LogoutButton } from "@/components/logout-button"

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home, permission: "dashboard" as const },
  { name: "Equipos", href: "/equipment", icon: Monitor, permission: "equipment" as const },
  { name: "Empleados", href: "/employees", icon: Users, permission: "employees" as const },
  { name: "Usuarios", href: "/users", icon: UserCheck, permission: "users" as const },
  { name: "Tipos de Equipos", href: "/equipment-types", icon: Settings, permission: "equipmentTypes" as const },
  { name: "Estaciones de Servicio", href: "/service-stations", icon: MapPin, permission: "serviceStations" as const },
  { name: "Tickets", href: "/tickets", icon: Ticket, permission: "tickets" as const },
  { name: "Reportes", href: "/reports", icon: BarChart3, permission: "tickets" as const },
  { name: "Enlaces Drive", href: "/drive-links", icon: FolderOpen, permission: "dashboard" as const },
  { name: "Asistente IA", href: "/ai-assistant", icon: Bot, permission: "aiAssistant" as const },
]

export function Navigation() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { canAccessModule, permissions, loading } = usePermissions()

  // Filtrar elementos de navegación según permisos
  const allowedNavigation = navigationItems.filter((item) => canAccessModule(item.permission))

  const NavItems = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {loading ? (
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          Cargando permisos...
        </div>
      ) : (
        <>
          {allowedNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary font-thin bg-sky-700 text-white ${
                  isActive ? "bg-muted text-primary" : "text-muted-foreground"
                }`}
                onClick={() => isMobile && setOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}

          {/* Mostrar información de permisos solo para admins */}
          {permissions?.canAccessAdminPanel && (
            <Link
              href="/permissions"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary bg-blue-800 ${
                pathname === "/permissions" ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
              onClick={() => isMobile && setOpen(false)}
            >
              <Shield className="h-4 w-4" />
              Permisos
              <Badge variant="outline" className="text-xs">
                Admin
              </Badge>
            </Link>
          )}
        </>
      )}

      <LogoutButton
        variant="ghost"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm justify-start text-muted-foreground hover:text-primary w-full"
        showConfirmDialog={true}
        onClick={() => isMobile && setOpen(false)}
      />
    </>
  )

  return (
    <>
      {/* Mobile Navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden bg-transparent">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col gap-2 py-4">
            <h2 className="mb-4 px-3 text-lg font-semibold">Sistema de Inventario</h2>
            <NavItems isMobile={true} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <h2 className="text-lg font-semibold text-gray-900">Sistema de Inventario</h2>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1 bg-blue-300 font-bold">
              <NavItems isMobile={false} />
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}
