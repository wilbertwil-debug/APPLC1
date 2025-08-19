"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, X, Send, Bot, Users } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  created_at: string
  sender: { id: string; name: string; email: string }
  receiver: { id: string; name: string; email: string }
}

interface Employee {
  id: string
  name: string
  email: string
}

export function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("ai")

  // AI Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Internal Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [selectedContact, setSelectedContact] = useState<string>("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)
  const [isChatLoading, setIsChatLoading] = useState(false)

  const { user } = useAuth()

  useEffect(() => {
    if (user?.email) {
      loadEmployees()
      loadCurrentEmployee()
    }
  }, [user])

  useEffect(() => {
    if (selectedContact && currentEmployee) {
      loadChatMessages()
    }
  }, [selectedContact, currentEmployee])

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("id, name, email")
        .neq("email", user?.email)
        .order("name")

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error("Error loading employees:", error)
    }
  }

  const loadCurrentEmployee = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("id, name, email")
        .eq("email", user?.email)
        .maybeSingle()

      if (error) {
        console.error("Error loading current employee:", error)
        return
      }

      if (!data) {
        console.log("Usuario no encontrado en la tabla employees")
        return
      }

      setCurrentEmployee(data)
    } catch (error) {
      console.error("Error loading current employee:", error)
    }
  }

  const loadChatMessages = async () => {
    if (!currentEmployee || !selectedContact) return

    try {
      console.log("Loading messages for:", currentEmployee.id, "and", selectedContact)

      const response = await fetch(`/api/internal-chat?userId=${currentEmployee.id}&contactId=${selectedContact}`)
      const data = await response.json()

      console.log("Response:", response.status, data)

      if (response.ok) {
        setChatMessages(data.messages || [])
        console.log("Messages loaded:", data.messages?.length || 0)
      } else {
        console.error("Error loading messages:", data.error)
        if (data.error.includes("table") || data.error.includes("relation")) {
          alert(
            "❌ Error: La tabla internal_chat_messages no existe.\n\n📋 Solución:\n1. Ve a Supabase Dashboard\n2. Abre SQL Editor\n3. Ejecuta el script: scripts/13-create-internal-chat-table.sql",
          )
        } else {
          alert(`❌ Error cargando mensajes: ${data.error}`)
        }
      }
    } catch (error) {
      console.error("Error loading chat messages:", error)
      alert("❌ Error de conexión al cargar mensajes")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          context: "sistema_gestion_inventario",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.response || data.message }])
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !selectedContact || !currentEmployee || isChatLoading) return

    const messageText = chatInput.trim()
    setChatInput("")
    setIsChatLoading(true)

    const selectedContactData = employees.find((emp) => emp.id === selectedContact)
    const selectedContactName = selectedContactData?.name || "Usuario"

    console.log("Sending message:", {
      senderId: currentEmployee.id,
      receiverId: selectedContact,
      message: messageText,
    })

    try {
      const tempMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        sender_id: currentEmployee.id,
        receiver_id: selectedContact,
        message: messageText,
        created_at: new Date().toISOString(),
        sender: { id: currentEmployee.id, name: currentEmployee.name, email: currentEmployee.email },
        receiver: { id: selectedContact, name: selectedContactName, email: selectedContactData?.email || "" },
      }
      setChatMessages((prev) => [...prev, tempMessage])

      const response = await fetch("/api/internal-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: currentEmployee.id,
          receiverId: selectedContact,
          message: messageText,
        }),
      })

      const data = await response.json()
      console.log("Send response:", response.status, data)

      if (response.ok) {
        setChatMessages((prev) => {
          const filtered = prev.filter((msg) => !msg.id.startsWith("temp-"))
          return [...filtered, data.message]
        })
        console.log("Message sent successfully")
      } else {
        setChatMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp-")))
        console.error("Chat error:", data.error)

        if (data.error.includes("table") || data.error.includes("relation")) {
          alert(
            "❌ Error: La tabla de chat interno no existe.\n\n📋 Solución:\n1. Ve a Supabase Dashboard\n2. Abre SQL Editor\n3. Ejecuta el script: scripts/13-create-internal-chat-table.sql",
          )
        } else if (data.error.includes("not found")) {
          alert(
            "❌ Error: Tu usuario no está registrado como empleado.\n\n📋 Solución:\n1. Ve a la página de Empleados\n2. Agrega tu email como empleado",
          )
        } else {
          alert(`❌ Error enviando mensaje: ${data.error}`)
        }
      }
    } catch (error) {
      setChatMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp-")))
      console.error("Error sending message:", error)
      alert("❌ Error de conexión al enviar mensaje")
    } finally {
      setIsChatLoading(false)
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const clearChat = () => {
    setMessages([])
  }

  const clearInternalChat = () => {
    setChatMessages([])
    setSelectedContact("")
  }

  const selectedContactName = employees.find((emp) => emp.id === selectedContact)?.name || "Seleccionar contacto"

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-80 h-96 shadow-lg border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {activeTab === "ai" ? (
                <>
                  <Bot className="h-4 w-4" />
                  Asistente IA
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  Chat Interno
                </>
              )}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={activeTab === "ai" ? clearChat : clearInternalChat}
                className="h-6 w-6 p-0"
              >
                <span className="text-xs">🗑️</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleChat} className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-80">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-2 mx-3 mt-2">
                <TabsTrigger value="ai" className="text-xs">
                  IA Assistant
                </TabsTrigger>
                <TabsTrigger value="chat" className="text-xs">
                  Chat Interno
                </TabsTrigger>
              </TabsList>

              {/* AI Assistant Tab */}
              <TabsContent value="ai" className="flex flex-col flex-1 mt-2">
                <ScrollArea className="flex-1 p-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>¡Hola! Soy tu asistente IA.</p>
                      <p>¿En qué puedo ayudarte hoy?</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                              message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-current rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-current rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
                <form onSubmit={handleSubmit} className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Escribe tu mensaje..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button type="submit" size="sm" disabled={isLoading || !input.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Internal Chat Tab */}
              <TabsContent value="chat" className="flex flex-col flex-1 mt-2">
                <div className="px-3 pb-2">
                  <Select value={selectedContact} onValueChange={setSelectedContact}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar contacto" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <ScrollArea className="flex-1 p-3">
                  {!selectedContact ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Selecciona un contacto</p>
                      <p>para comenzar a chatear</p>
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No hay mensajes con</p>
                      <p>{selectedContactName}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === currentEmployee?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                              message.sender_id === currentEmployee?.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <div className="font-medium text-xs mb-1">
                              {message.sender_id === currentEmployee?.id ? "Tú" : message.sender.name}
                            </div>
                            {message.message}
                            <div className="text-xs opacity-70 mt-1">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {selectedContact && (
                  <form onSubmit={handleChatSubmit} className="p-3 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={`Mensaje para ${selectedContactName}...`}
                        disabled={isChatLoading}
                        className="flex-1"
                      />
                      <Button type="submit" size="sm" disabled={isChatLoading || !chatInput.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={toggleChat}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-primary/90 bg-green-600"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}
