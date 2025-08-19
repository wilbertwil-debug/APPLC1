"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, FileText, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface EmployeeFile {
  id: string
  file_name: string
  file_type: string
  file_size: number
  upload_date: string
  description: string
}

interface EmployeeFilesDialogProps {
  isOpen: boolean
  onClose: () => void
  employeeId: string
  employeeName: string
}

export function EmployeeFilesDialog({ isOpen, onClose, employeeId, employeeName }: EmployeeFilesDialogProps) {
  const [files, setFiles] = useState<EmployeeFile[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState("")

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchFiles()
    }
  }, [isOpen, employeeId])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("employee_files")
        .select("*")
        .eq("employee_id", employeeId)
        .order("upload_date", { ascending: false })

      if (error) throw error
      setFiles(data || [])
    } catch (error: any) {
      console.error("Error fetching files:", error)

      if (error.message?.includes("employee_files") || error.code === "42P01") {
        toast({
          title: "Tabla no encontrada",
          description:
            "Necesitas ejecutar el script '07-create-employee-files-table.sql' en Supabase para crear la tabla de expedientes",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los expedientes",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "El archivo es demasiado grande (máximo 10MB)",
          variant: "destructive",
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setUploading(true)

      // Convertir archivo a base64 para almacenamiento simulado
      const reader = new FileReader()
      reader.onload = async (e) => {
        const fileData = e.target?.result as string

        // Guardar información del archivo en la base de datos
        const { error } = await supabase.from("employee_files").insert({
          employee_id: employeeId,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          description: description || "Expediente del empleado",
        })

        if (error) {
          if (error.message?.includes("employee_files") || error.code === "42P01") {
            throw new Error("Tabla no encontrada. Ejecuta el script '07-create-employee-files-table.sql' en Supabase.")
          }
          throw error
        }

        // Guardar archivo en localStorage para simulación
        const fileKey = `employee_file_${employeeId}_${Date.now()}`
        localStorage.setItem(
          fileKey,
          JSON.stringify({
            name: selectedFile.name,
            type: selectedFile.type,
            data: fileData,
            employeeId,
            employeeName,
          }),
        )

        toast({
          title: "Éxito",
          description: "Expediente subido correctamente",
        })

        setSelectedFile(null)
        setDescription("")
        fetchFiles()
      }

      reader.readAsDataURL(selectedFile)
    } catch (error: any) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo subir el expediente",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = (file: EmployeeFile) => {
    // Buscar archivo en localStorage
    const keys = Object.keys(localStorage).filter(
      (key) => key.startsWith(`employee_file_${employeeId}`) && localStorage.getItem(key)?.includes(file.file_name),
    )

    if (keys.length > 0) {
      const fileData = JSON.parse(localStorage.getItem(keys[0]) || "{}")

      // Crear enlace de descarga
      const link = document.createElement("a")
      link.href = fileData.data
      link.download = file.file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Descarga iniciada",
        description: `Descargando ${file.file_name}`,
      })
    } else {
      toast({
        title: "Error",
        description: "Archivo no encontrado en el almacenamiento local",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (fileId: string) => {
    try {
      const { error } = await supabase.from("employee_files").delete().eq("id", fileId)

      if (error) throw error

      toast({
        title: "Éxito",
        description: "Expediente eliminado correctamente",
      })

      fetchFiles()
    } catch (error) {
      console.error("Error deleting file:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el expediente",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Expediente de {employeeName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sección de subida */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subir Nuevo Documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file">Seleccionar Archivo</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Formatos permitidos: PDF, DOC, DOCX, JPG, PNG, TXT (máximo 10MB)
                </p>
              </div>

              <div>
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe el contenido del documento..."
                  rows={2}
                />
              </div>

              <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Subiendo..." : "Subir Documento"}
              </Button>
            </CardContent>
          </Card>

          {/* Lista de archivos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documentos del Expediente</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-4">Cargando expedientes...</p>
              ) : files.length === 0 ? (
                <p className="text-center py-4 text-gray-500">No hay documentos en el expediente</p>
              ) : (
                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{file.file_name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline">{formatFileSize(file.file_size)}</Badge>
                            <span>•</span>
                            <span>{new Date(file.upload_date).toLocaleDateString()}</span>
                          </div>
                          {file.description && <p className="text-sm text-gray-600 mt-1">{file.description}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(file)}
                          title="Descargar archivo"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(file.id)}
                          title="Eliminar archivo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
