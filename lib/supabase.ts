import { createClient } from '@supabase/supabase-js'

// Obtener las variables de entorno (solo las que empiezan con NEXT_PUBLIC_ están disponibles en el cliente)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validar que las variables estén configuradas
if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Función para verificar si Supabase está configurado
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          updated_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          department: string | null
          position: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          department?: string | null
          position?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          department?: string | null
          position?: string | null
          updated_at?: string
        }
      }
      equipment_types: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
        }
      }
      service_stations: {
        Row: {
          id: string
          name: string
          location: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          description?: string | null
        }
      }
      equipment: {
        Row: {
          id: string
          name: string
          model: string | null
          brand: string | null
          serial_number: string | null
          equipment_type_id: string | null
          assigned_to: string | null
          service_station_id: string | null
          status: string
          purchase_date: string | null
          warranty_expiry: string | null
          specifications: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          model?: string | null
          brand?: string | null
          serial_number?: string | null
          equipment_type_id?: string | null
          assigned_to?: string | null
          service_station_id?: string | null
          status?: string
          purchase_date?: string | null
          warranty_expiry?: string | null
          specifications?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          model?: string | null
          brand?: string | null
          serial_number?: string | null
          equipment_type_id?: string | null
          assigned_to?: string | null
          service_station_id?: string | null
          status?: string
          purchase_date?: string | null
          warranty_expiry?: string | null
          specifications?: any | null
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          title: string
          description: string
          priority: string
          status: string
          created_by: string | null
          assigned_to: string | null
          equipment_id: string | null
          service_station_id: string | null
          created_at: string
          updated_at: string
          closed_at: string | null
          observations: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          priority?: string
          status?: string
          created_by?: string | null
          assigned_to?: string | null
          equipment_id?: string | null
          service_station_id?: string | null
          created_at?: string
          updated_at?: string
          closed_at?: string | null
          observations?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          priority?: string
          status?: string
          assigned_to?: string | null
          equipment_id?: string | null
          service_station_id?: string | null
          updated_at?: string
          closed_at?: string | null
          observations?: string | null
        }
      }
      ticket_comments: {
        Row: {
          id: string
          ticket_id: string
          author_id: string | null
          comment: string
          comment_type: string
          is_internal: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          author_id?: string | null
          comment: string
          comment_type?: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          author_id?: string | null
          comment?: string
          comment_type?: string
          is_internal?: boolean
          updated_at?: string
        }
      }
    }
  }
}
