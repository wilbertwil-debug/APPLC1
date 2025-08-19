"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Calendar, FileText, Filter, Printer, Users } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { usePermissions } from "@/contexts/permissions-context"
import Link from "next/link"

interface ReportData {
  userTickets?: Array<{
    user_name: string
    email: string
    total_tickets: number
    open_tickets: number
    closed_tickets: number
  }>
  closedTickets?: Array<{
    id: string
    title: string
    created_by_name: string
    assigned_to_name: string
    created_at: string
    updated_at: string
    resolution_notes: string
  }>
  generalReport?: Array<{
    ticket_number: string
    title: string
    created_by_name: string
    assigned_to_name: string
    created_at: string
    updated_at: string
    days_elapsed: number
    resolution_notes: string
    status: string
  }>
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reportData, setReportData] = useState<ReportData>({})
  const [loading, setLoading] = useState(false)
  const { canAccessModule } = usePermissions()

  // Verificar permisos
  if (!canAccessModule("tickets")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No tienes permisos para acceder a los reportes.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const reportTypes = [
    { value: "user-tickets", label: "Usuario con más tickets", icon: Users },
    { value: "closed-month", label: "Tickets cerrados del mes", icon: Calendar },
    { value: "general", label: "Reporte general", icon: FileText },
  ]

  const generateReport = async () => {
    if (!selectedReport || !startDate || !endDate) return

    setLoading(true)
    try {
      switch (selectedReport) {
        case "user-tickets":
          await generateUserTicketsReport()
          break
        case "closed-month":
          await generateClosedTicketsReport()
          break
        case "general":
          await generateGeneralReport()
          break
      }
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateUserTicketsReport = async () => {
    const { data, error } = await supabase
      .from("tickets")
      .select(`
        created_by,
        status,
        employees!tickets_created_by_fkey(name, email)
      `)
      .gte("created_at", startDate)
      .lte("created_at", endDate + "T23:59:59")

    if (error) throw error

    const userStats = data?.reduce((acc: any, ticket: any) => {
      const userId = ticket.created_by
      const userName = ticket.employees?.name || "Usuario desconocido"
      const userEmail = ticket.employees?.email || ""

      if (!acc[userId]) {
        acc[userId] = {
          user_name: userName,
          email: userEmail,
          total_tickets: 0,
          open_tickets: 0,
          closed_tickets: 0,
        }
      }

      acc[userId].total_tickets++
      if (ticket.status === "closed") {
        acc[userId].closed_tickets++
      } else {
        acc[userId].open_tickets++
      }

      return acc
    }, {})

    const sortedUsers = Object.values(userStats || {}).sort((a: any, b: any) => b.total_tickets - a.total_tickets)

    setReportData({ userTickets: sortedUsers })
  }

  const generateClosedTicketsReport = async () => {
    const { data, error } = await supabase
      .from("tickets")
      .select(`
        id,
        title,
        created_at,
        updated_at,
        observations,
        created_by_employee:employees!tickets_created_by_fkey(name),
        assigned_to_employee:employees!tickets_assigned_to_fkey(name)
      `)
      .eq("status", "closed")
      .gte("updated_at", startDate)
      .lte("updated_at", endDate + "T23:59:59")
      .order("updated_at", { ascending: false })

    if (error) throw error

    const ticketIds = data?.map((ticket) => ticket.id) || []
    const lastComments: any = {}

    if (ticketIds.length > 0) {
      const { data: commentsData } = await supabase
        .from("ticket_comments")
        .select("ticket_id, comment, created_at")
        .in("ticket_id", ticketIds)
        .order("created_at", { ascending: false })

      // Agrupar comentarios por ticket_id y tomar el último
      commentsData?.forEach((comment) => {
        if (!lastComments[comment.ticket_id]) {
          lastComments[comment.ticket_id] = comment.comment
        }
      })
    }

    const formattedData = data?.map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      created_by_name: ticket.created_by_employee?.name || "N/A",
      assigned_to_name: ticket.assigned_to_employee?.name || "N/A",
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      resolution_notes:
        [ticket.observations || "", lastComments[ticket.id] ? `Último comentario: ${lastComments[ticket.id]}` : ""]
          .filter(Boolean)
          .join(" | ") || "Sin conclusión",
    }))

    setReportData({ closedTickets: formattedData })
  }

  const generateGeneralReport = async () => {
    const { data, error } = await supabase
      .from("tickets")
      .select(`
        id,
        title,
        status,
        created_at,
        updated_at,
        observations,
        created_by_employee:employees!tickets_created_by_fkey(name),
        assigned_to_employee:employees!tickets_assigned_to_fkey(name)
      `)
      .gte("created_at", startDate)
      .lte("created_at", endDate + "T23:59:59")
      .order("created_at", { ascending: false })

    if (error) throw error

    const ticketIds = data?.map((ticket) => ticket.id) || []
    const lastComments: any = {}

    if (ticketIds.length > 0) {
      const { data: commentsData } = await supabase
        .from("ticket_comments")
        .select("ticket_id, comment, created_at")
        .in("ticket_id", ticketIds)
        .order("created_at", { ascending: false })

      // Agrupar comentarios por ticket_id y tomar el último
      commentsData?.forEach((comment) => {
        if (!lastComments[comment.ticket_id]) {
          lastComments[comment.ticket_id] = comment.comment
        }
      })
    }

    const formattedData = data?.map((ticket) => {
      const createdDate = new Date(ticket.created_at)
      const updatedDate = new Date(ticket.updated_at)
      const daysElapsed = Math.ceil((updatedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

      return {
        ticket_number: `TK-${ticket.id.slice(-6).toUpperCase()}`,
        title: ticket.title,
        created_by_name: ticket.created_by_employee?.name || "N/A",
        assigned_to_name: ticket.assigned_to_employee?.name || "N/A",
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
        days_elapsed: daysElapsed,
        resolution_notes:
          [ticket.observations || "", lastComments[ticket.id] ? `Último comentario: ${lastComments[ticket.id]}` : ""]
            .filter(Boolean)
            .join(" | ") || "Sin conclusión",
        status: ticket.status,
      }
    })

    setReportData({ generalReport: formattedData })
  }

  const exportToPrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    let content = `
      <html>
        <head>
          <title>Reporte - ${reportTypes.find((r) => r.value === selectedReport)?.label}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .header { margin-bottom: 20px; }
            .date-range { color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportTypes.find((r) => r.value === selectedReport)?.label}</h1>
            <p class="date-range">Período: ${startDate} al ${endDate}</p>
            <p class="date-range">Generado el: ${new Date().toLocaleString()}</p>
          </div>
    `

    if (selectedReport === "user-tickets" && reportData.userTickets) {
      content += `
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Total Tickets</th>
              <th>Tickets Abiertos</th>
              <th>Tickets Cerrados</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.userTickets
              .map(
                (user) => `
              <tr>
                <td>${user.user_name}</td>
                <td>${user.email}</td>
                <td>${user.total_tickets}</td>
                <td>${user.open_tickets}</td>
                <td>${user.closed_tickets}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      `
    } else if (selectedReport === "general" && reportData.generalReport) {
      content += `
        <table>
          <thead>
            <tr>
              <th>Número Ticket</th>
              <th>Título</th>
              <th>Creado por</th>
              <th>Asignado a</th>
              <th>Fecha Inicio</th>
              <th>Fecha Solución</th>
              <th>Días Transcurridos</th>
              <th>Estado</th>
              <th>Observacion</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.generalReport
              .map(
                (ticket) => `
              <tr>
                <td>${ticket.ticket_number}</td>
                <td>${ticket.title}</td>
                <td>${ticket.created_by_name}</td>
                <td>${ticket.assigned_to_name}</td>
                <td>${new Date(ticket.created_at).toLocaleDateString()}</td>
                <td>${new Date(ticket.updated_at).toLocaleDateString()}</td>
                <td>${ticket.days_elapsed}</td>
                <td>${ticket.status}</td>
                <td>${ticket.resolution_notes}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      `
    }

    content += `
        </body>
      </html>
    `

    printWindow.document.write(content)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Reportes</h1>
            <p className="text-muted-foreground">Genera reportes detallados del sistema</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Configuración del Reporte
          </CardTitle>
          <CardDescription>Selecciona el tipo de reporte y el rango de fechas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Tipo de Reporte</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar reporte" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((report) => {
                    const Icon = report.icon
                    return (
                      <SelectItem key={report.value} value={report.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {report.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Fecha Inicio</Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">Fecha Fin</Label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={generateReport}
              disabled={!selectedReport || !startDate || !endDate || loading}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              {loading ? "Generando..." : "Generar Reporte"}
            </Button>

            {Object.keys(reportData).length > 0 && (
              <Button variant="outline" onClick={exportToPrint} className="flex items-center gap-2 bg-transparent">
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mostrar resultados */}
      {reportData.userTickets && (
        <Card>
          <CardHeader>
            <CardTitle>Usuarios con más Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {reportData.userTickets.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.user_name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">Total: {user.total_tickets}</Badge>
                      <Badge variant="destructive">Abiertos: {user.open_tickets}</Badge>
                      <Badge variant="default">Cerrados: {user.closed_tickets}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {reportData.closedTickets && (
        <Card>
          <CardHeader>
            <CardTitle>Tickets Cerrados</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {reportData.closedTickets.map((ticket, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {ticket.ticket_number} - {ticket.title}
                      </h4>
                      <Badge variant={ticket.status === "closed" ? "default" : "destructive"}>{ticket.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <p>
                        <strong>Creado por:</strong> {ticket.created_by_name}
                      </p>
                      <p>
                        <strong>Asignado a:</strong> {ticket.assigned_to_name}
                      </p>
                      <p>
                        <strong>Días transcurridos:</strong> {ticket.days_elapsed}
                      </p>
                      <p>
                        <strong>Fecha inicio:</strong> {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm">
                      <strong>Conclusión:</strong> {ticket.resolution_notes}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {reportData.generalReport && (
        <Card>
          <CardHeader>
            <CardTitle>Reporte General de Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {reportData.generalReport.map((ticket, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {ticket.ticket_number} - {ticket.title}
                      </h4>
                      <Badge variant={ticket.status === "closed" ? "default" : "destructive"}>{ticket.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <p>
                        <strong>Creado por:</strong> {ticket.created_by_name}
                      </p>
                      <p>
                        <strong>Asignado a:</strong> {ticket.assigned_to_name}
                      </p>
                      <p>
                        <strong>Días transcurridos:</strong> {ticket.days_elapsed}
                      </p>
                      <p>
                        <strong>Fecha inicio:</strong> {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm">
                      <strong>Conclusión:</strong> {ticket.resolution_notes}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
