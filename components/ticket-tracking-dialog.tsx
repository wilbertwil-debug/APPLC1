"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import {
  MessageSquare,
  User,
  Clock,
  Eye,
  EyeOff,
  Send,
  Plus,
  AlertTriangle,
  Database,
  Lock,
  X,
  RefreshCw,
} from "lucide-react"

interface TicketComment {
  id: string
  ticket_id: string
  author_id: string | null
  comment: string
  comment_type: string
  is_internal: boolean
  created_at: string
  updated_at: string
  author?: { name: string }
}

interface Employee {
  id: string
  name: string
}

interface TicketTrackingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticketId: string
  ticketTitle: string
  canAddComments?: boolean
  canViewInternal?: boolean
}

export function TicketTrackingDialog({
  open,
  onOpenChange,
  ticketId,
  ticketTitle,
  canAddComments = true,
  canViewInternal = true,
}: TicketTrackingDialogProps) {
  const [comments, setComments] = useState<TicketComment[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showInternal, setShowInternal] = useState(true)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [commentType, setCommentType] = useState("comment")
  const [isInternal, setIsInternal] = useState(false)
  const [authorId, setAuthorId] = useState("")
  const [tableExists, setTableExists] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ticketStatus, setTicketStatus] = useState<string>("")
  const [isTicketClosed, setIsTicketClosed] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && ticketId) {
      fetchData()
    }
  }, [open, ticketId])

  const checkTableExists = async () => {
    try {
      const { data, error } = await supabase.from("ticket_comments").select("id").limit(1)

      if (error) {
        console.error("Table check error:", error)
        if (error.code === "PGRST116" || error.message.includes("does not exist")) {
          setTableExists(false)
          setError(
            "La tabla ticket_comments no existe. Ejecuta el script: 05-create-ticket-comments-table-improved.sql",
          )
          return false
        }
        console.warn("Warning during table check:", error.message)
      }

      setTableExists(true)
      setError(null)
      return true
    } catch (error) {
      console.error("Error checking table:", error)
      setTableExists(false)
      setError("Error al verificar la base de datos.")
      return false
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const tableExistsCheck = await checkTableExists()
      if (!tableExistsCheck) {
        setLoading(false)
        return
      }

      const [commentsRes, employeesRes, ticketRes] = await Promise.all([
        supabase
          .from("ticket_comments")
          .select(`
            *,
            author:employees!ticket_comments_author_id_fkey(name)
          `)
          .eq("ticket_id", ticketId)
          .order("created_at", { ascending: true }),
        supabase.from("employees").select("id, name").order("name"),
        supabase.from("tickets").select("status").eq("id", ticketId).single(),
      ])

      if (commentsRes.error) {
        console.error("Comments fetch error:", commentsRes.error)
        if (commentsRes.error.message.includes("does not exist")) {
          setTableExists(false)
          setError(
            "La tabla de comentarios no existe. Ejecuta el script SQL: 05-create-ticket-comments-table-improved.sql",
          )
        } else {
          setError(`Error al cargar comentarios: ${commentsRes.error.message}`)
        }
      } else {
        setComments(commentsRes.data || [])
      }

      if (employeesRes.error) {
        console.error("Employees fetch error:", employeesRes.error)
        setError(`Error al cargar empleados: ${employeesRes.error.message}`)
      } else {
        setEmployees(employeesRes.data || [])
      }

      if (ticketRes.error) {
        console.error("Ticket fetch error:", ticketRes.error)
        setError(`Error al cargar estado del ticket: ${ticketRes.error.message}`)
      } else {
        const status = ticketRes.data?.status || ""
        setTicketStatus(status)
        setIsTicketClosed(status.toLowerCase() === "cerrado" || status.toLowerCase() === "closed")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Error inesperado al cargar los datos.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !authorId || !tableExists || isTicketClosed) return

    setSubmitting(true)
    setError(null)

    try {
      const { error } = await supabase.from("ticket_comments").insert([
        {
          ticket_id: ticketId,
          author_id: authorId,
          comment: newComment.trim(),
          comment_type: commentType,
          is_internal: isInternal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (error) {
        console.error("Insert error:", error)
        if (error.message.includes("does not exist")) {
          setTableExists(false)
          setError("La tabla de comentarios no existe. Ejecuta el script SQL para crearla.")
        } else {
          setError(`Error al guardar comentario: ${error.message}`)
        }
        return
      }

      setNewComment("")
      setCommentType("comment")
      setIsInternal(false)
      setShowCommentForm(false)
      await fetchData()

      toast({
        title: "Comentario agregado",
        description: "El comentario se ha guardado correctamente",
      })
    } catch (error) {
      console.error("Error saving comment:", error)
      setError("Error inesperado al guardar el comentario.")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case "status_change":
        return "bg-blue-100 text-blue-800"
      case "assignment":
        return "bg-purple-100 text-purple-800"
      case "resolution":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCommentTypeText = (type: string) => {
    switch (type) {
      case "status_change":
        return "Cambio de Estado"
      case "assignment":
        return "Asignación"
      case "resolution":
        return "Resolución"
      default:
        return "Comentario"
    }
  }

  const filteredComments = canViewInternal
    ? showInternal
      ? comments
      : comments.filter((comment) => !comment.is_internal)
    : comments.filter((comment) => !comment.is_internal)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] md:w-full h-[95vh] md:h-[90vh] flex flex-col p-3 md:p-6">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
            <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden md:inline">Seguimiento del Ticket</span>
            <span className="md:hidden">Seguimiento</span>
            {ticketStatus && (
              <Badge variant={isTicketClosed ? "destructive" : "default"} className="ml-2 text-xs">
                {isTicketClosed && <Lock className="h-3 w-3 mr-1" />}
                {ticketStatus}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="line-clamp-2 text-xs md:text-sm">{ticketTitle}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-3 md:gap-4 min-h-0 overflow-hidden">
          {/* Error Alert */}
          {error && (
            <Alert className="border-red-200 bg-red-50 flex-shrink-0">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-xs md:text-sm">
                <div className="space-y-3">
                  <p className="font-medium">Error:</p>
                  <p>{error}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={fetchData} disabled={loading}>
                      Reintentar
                    </Button>
                    {!tableExists && (
                      <Button size="sm" variant="outline" onClick={() => window.open("https://supabase.com", "_blank")}>
                        Ir a Supabase
                      </Button>
                    )}
                  </div>
                  {!tableExists && (
                    <div className="mt-3 p-3 bg-white rounded border text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="h-4 w-4" />
                        <span className="font-medium">Script SQL requerido:</span>
                      </div>
                      <code className="text-xs bg-gray-100 p-2 rounded block">
                        05-create-ticket-comments-table-improved.sql
                      </code>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {isTicketClosed && (
            <Alert className="border-orange-200 bg-orange-50 flex-shrink-0">
              <Lock className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 text-xs md:text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ticket Cerrado</p>
                    <p className="text-sm">
                      Este ticket está cerrado. No se pueden agregar más comentarios, pero puedes visualizar el
                      historial completo.
                    </p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {tableExists && (
            <div className="flex items-center justify-between flex-shrink-0 gap-2">
              <div className="flex items-center gap-2">
                {canViewInternal && (
                  <Button
                    variant={showInternal ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowInternal(!showInternal)}
                    className="h-8 md:h-9"
                  >
                    {showInternal ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    <span className="hidden md:inline ml-2">{showInternal ? "Mostrar todos" : "Solo públicos"}</span>
                  </Button>
                )}
                <Badge variant="outline" className="text-xs">
                  <span className="hidden md:inline">{filteredComments.length} comentarios</span>
                  <span className="md:hidden">{filteredComments.length}</span>
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {canAddComments && !isTicketClosed && (
                  <Button
                    variant={showCommentForm ? "secondary" : "default"}
                    size="sm"
                    onClick={() => setShowCommentForm(!showCommentForm)}
                    className="h-8 md:h-9"
                  >
                    {showCommentForm ? (
                      <>
                        <X className="h-4 w-4" />
                        <span className="hidden md:inline ml-2">Cancelar</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span className="hidden md:inline ml-2">Agregar comentario</span>
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchData}
                  disabled={loading}
                  className="h-8 md:h-9 bg-transparent"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  <span className="hidden md:inline ml-2">Actualizar</span>
                </Button>
              </div>
            </div>
          )}

          {tableExists && canAddComments && !isTicketClosed && showCommentForm && (
            <div className="flex-shrink-0 border rounded-lg bg-gray-50/50">
              <div className="p-3 md:p-4">
                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="author" className="text-xs md:text-sm">
                        Autor *
                      </Label>
                      <Select value={authorId} onValueChange={setAuthorId}>
                        <SelectTrigger className="h-9 text-xs md:text-sm">
                          <SelectValue placeholder="Seleccionar autor" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id} className="text-xs md:text-sm">
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-xs md:text-sm">
                        Tipo
                      </Label>
                      <Select value={commentType} onValueChange={setCommentType}>
                        <SelectTrigger className="h-9 text-xs md:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comment" className="text-xs md:text-sm">
                            Comentario
                          </SelectItem>
                          <SelectItem value="status_change" className="text-xs md:text-sm">
                            Cambio de Estado
                          </SelectItem>
                          <SelectItem value="assignment" className="text-xs md:text-sm">
                            Asignación
                          </SelectItem>
                          <SelectItem value="resolution" className="text-xs md:text-sm">
                            Resolución
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visibility" className="text-xs md:text-sm">
                        Visibilidad
                      </Label>
                      <Select
                        value={isInternal ? "internal" : "public"}
                        onValueChange={(value) => setIsInternal(value === "internal")}
                      >
                        <SelectTrigger className="h-9 text-xs md:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public" className="text-xs md:text-sm">
                            Público
                          </SelectItem>
                          {canViewInternal && (
                            <SelectItem value="internal" className="text-xs md:text-sm">
                              Interno
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment" className="text-xs md:text-sm">
                      Comentario *
                    </Label>
                    <Textarea
                      id="comment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escribe tu comentario aquí..."
                      rows={3}
                      required
                      className="text-xs md:text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCommentForm(false)}
                      size="sm"
                      className="h-8 md:h-9"
                    >
                      <X className="h-4 w-4" />
                      <span className="hidden md:inline ml-2">Cancelar</span>
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || !newComment.trim() || !authorId}
                      size="sm"
                      className="h-8 md:h-9"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span className="hidden md:inline ml-2">Guardando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span className="hidden md:inline ml-2">Agregar Comentario</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {tableExists && (
            <div className="flex-1 min-h-0 border rounded-lg overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                      <p className="text-gray-500 text-xs md:text-sm">Cargando comentarios...</p>
                    </div>
                  ) : filteredComments.length === 0 ? (
                    <div className="text-center py-8 md:py-12">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                      </div>
                      <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No hay comentarios</h3>
                      <p className="text-gray-500 text-xs md:text-sm mb-4">
                        Este ticket aún no tiene comentarios o seguimiento.
                      </p>
                      {!isTicketClosed && (
                        <p className="text-gray-400 text-xs">
                          Haz clic en "Agregar comentario" para iniciar el seguimiento.
                        </p>
                      )}
                    </div>
                  ) : (
                    filteredComments.map((comment, index) => (
                      <Card
                        key={comment.id}
                        className={`${comment.is_internal ? "border-orange-200 bg-orange-50" : "border-gray-200"}`}
                      >
                        <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                                </div>
                                <span className="font-medium text-gray-900 text-xs md:text-sm">
                                  {comment.author?.name || "Usuario desconocido"}
                                </span>
                              </div>
                              <Badge className={`${getCommentTypeColor(comment.comment_type)} text-xs`}>
                                {getCommentTypeText(comment.comment_type)}
                              </Badge>
                              {comment.is_internal && (
                                <Badge
                                  variant="outline"
                                  className="text-orange-600 border-orange-300 bg-orange-50 text-xs"
                                >
                                  <EyeOff className="h-3 w-3 mr-1" />
                                  Interno
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {formatDate(comment.created_at)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 p-3 md:p-6 md:pt-0">
                          <div className="prose prose-sm max-w-none">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed m-0 text-xs md:text-sm">
                              {comment.comment}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
