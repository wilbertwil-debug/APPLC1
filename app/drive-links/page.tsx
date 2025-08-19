"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { usePermissions } from "@/contexts/permissions-context"
import {
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  FolderOpen,
  FileText,
  Settings,
  GraduationCap,
  ArrowLeft,
} from "lucide-react"

interface DriveLink {
  id: string
  title: string
  description: string | null
  drive_url: string
  category: string
  is_active: boolean
  created_at: string
  created_by: string | null
}

const categoryIcons = {
  documentos: FileText,
  manuales: FolderOpen,
  formatos: Settings,
  capacitacion: GraduationCap,
  general: FolderOpen,
}

const categoryColors = {
  documentos: "bg-blue-100 text-blue-800",
  manuales: "bg-green-100 text-green-800",
  formatos: "bg-purple-100 text-purple-800",
  capacitacion: "bg-orange-100 text-orange-800",
  general: "bg-gray-100 text-gray-800",
}

export default function DriveLinksPage() {
  const [driveLinks, setDriveLinks] = useState<DriveLink[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<DriveLink | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    drive_url: "",
    category: "general",
  })

  const { hasPermission } = usePermissions()
  const canManage = hasPermission("users", "create") // Using admin-level permission as proxy

  useEffect(() => {
    fetchDriveLinks()
  }, [])

  const fetchDriveLinks = async () => {
    try {
      setLoading(true)
      console.log("Fetching drive links...")
      const { data, error } = await supabase
        .from("drive_links")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }
      console.log("Drive links fetched:", data)
      setDriveLinks(data || [])
    } catch (error: any) {
      console.error("Error fetching drive links:", error)
      toast({
        title: "Error",
        description: error.message?.includes("relation")
          ? "La tabla drive_links no existe. Ejecuta el script SQL primero."
          : `Error al cargar enlaces: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canManage) {
      toast({
        title: "Sin permisos",
        description: "No tienes permisos para gestionar enlaces de Drive",
        variant: "destructive",
      })
      return
    }

    try {
      if (!formData.title.trim() || !formData.drive_url.trim()) {
        toast({
          title: "Error de validación",
          description: "El título y la URL son obligatorios",
          variant: "destructive",
        })
        return
      }

      console.log("Saving drive link:", formData)

      if (editingLink) {
        const { error } = await supabase
          .from("drive_links")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingLink.id)

        if (error) {
          console.error("Update error:", error)
          throw error
        }
        toast({
          title: "Éxito",
          description: "Enlace de Drive actualizado correctamente",
        })
      } else {
        const { error } = await supabase.from("drive_links").insert([
          {
            ...formData,
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ])

        if (error) {
          console.error("Insert error:", error)
          throw error
        }
        toast({
          title: "Éxito",
          description: "Enlace de Drive creado correctamente",
        })
      }

      resetForm()
      setDialogOpen(false)
      fetchDriveLinks()
    } catch (error: any) {
      console.error("Error saving drive link:", error)
      toast({
        title: "Error al guardar",
        description: error.message?.includes("relation")
          ? "La tabla drive_links no existe. Ejecuta el script SQL: scripts/12-create-drive-links-table.sql"
          : `Error: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (link: DriveLink) => {
    setEditingLink(link)
    setFormData({
      title: link.title,
      description: link.description || "",
      drive_url: link.drive_url,
      category: link.category,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!canManage) return

    if (!confirm("¿Estás seguro de que deseas eliminar este enlace?")) return

    try {
      const { error } = await supabase.from("drive_links").update({ is_active: false }).eq("id", id)

      if (error) throw error

      toast({
        title: "Éxito",
        description: "Enlace eliminado correctamente",
      })
      fetchDriveLinks()
    } catch (error) {
      console.error("Error deleting drive link:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el enlace",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      drive_url: "",
      category: "general",
    })
    setEditingLink(null)
  }

  const openDriveLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando enlaces de Drive...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al Dashboard</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enlaces de Drive</h1>
            <p className="text-gray-600 mt-2">Accede a carpetas compartidas de Google Drive</p>
          </div>
        </div>
        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Enlace
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingLink ? "Editar Enlace" : "Nuevo Enlace de Drive"}</DialogTitle>
                <DialogDescription>
                  {editingLink
                    ? "Modifica la información del enlace"
                    : "Agrega un nuevo enlace a una carpeta de Google Drive"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Nombre del enlace"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción del contenido de la carpeta"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="drive_url">URL de Google Drive</Label>
                  <Input
                    id="drive_url"
                    value={formData.drive_url}
                    onChange={(e) => setFormData({ ...formData, drive_url: e.target.value })}
                    placeholder="https://drive.google.com/drive/folders/..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="documentos">Documentos</SelectItem>
                      <SelectItem value="manuales">Manuales</SelectItem>
                      <SelectItem value="formatos">Formatos</SelectItem>
                      <SelectItem value="capacitacion">Capacitación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingLink ? "Actualizar" : "Crear"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {driveLinks.map((link) => {
          const IconComponent = categoryIcons[link.category as keyof typeof categoryIcons] || FolderOpen
          const colorClass = categoryColors[link.category as keyof typeof categoryColors] || categoryColors.general

          return (
            <Card key={link.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                  </div>
                  <Badge className={colorClass}>{link.category}</Badge>
                </div>
                {link.description && <CardDescription className="text-sm">{link.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Button onClick={() => openDriveLink(link.drive_url)} className="flex-1 mr-2">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir Drive
                  </Button>
                  {canManage && (
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(link)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(link.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {driveLinks.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay enlaces de Drive</h3>
          <p className="text-gray-600 mb-4">
            {canManage
              ? "Agrega el primer enlace a una carpeta de Google Drive"
              : "No hay enlaces disponibles en este momento"}
          </p>
        </div>
      )}
    </div>
  )
}
