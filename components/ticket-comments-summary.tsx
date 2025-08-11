'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Clock, User } from 'lucide-react'

interface TicketCommentsSummaryProps {
  ticketId: string
  className?: string
}

interface CommentSummary {
  total: number
  lastComment: {
    author_name: string
    created_at: string
    is_internal: boolean
  } | null
}

export function TicketCommentsSummary({ ticketId, className = '' }: TicketCommentsSummaryProps) {
  const [summary, setSummary] = useState<CommentSummary>({ total: 0, lastComment: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
  }, [ticketId])

  const fetchSummary = async () => {
    try {
      // Obtener total de comentarios
      const { count } = await supabase
        .from('ticket_comments')
        .select('*', { count: 'exact', head: true })
        .eq('ticket_id', ticketId)

      // Obtener último comentario
      const { data: lastComment } = await supabase
        .from('ticket_comments')
        .select(`
          created_at,
          is_internal,
          author:employees(name)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      setSummary({
        total: count || 0,
        lastComment: lastComment ? {
          author_name: lastComment.author?.name || 'Usuario desconocido',
          created_at: lastComment.created_at,
          is_internal: lastComment.is_internal
        } : null
      })
    } catch (error) {
      console.error('Error fetching comment summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Hace un momento'
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-xs text-gray-400 ${className}`}>
        <MessageSquare className="h-3 w-3" />
        <span>Cargando...</span>
      </div>
    )
  }

  if (summary.total === 0) {
    return (
      <div className={`flex items-center gap-2 text-xs text-gray-400 ${className}`}>
        <MessageSquare className="h-3 w-3" />
        <span>Sin comentarios</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-between text-xs ${className}`}>
      <div className="flex items-center gap-2">
        <MessageSquare className="h-3 w-3 text-blue-500" />
        <Badge variant="outline" className="text-xs px-1 py-0">
          {summary.total} comentario{summary.total !== 1 ? 's' : ''}
        </Badge>
      </div>
      {summary.lastComment && (
        <div className="flex items-center gap-1 text-gray-500">
          <User className="h-3 w-3" />
          <span className="truncate max-w-20">{summary.lastComment.author_name}</span>
          <Clock className="h-3 w-3 ml-1" />
          <span>{formatTimeAgo(summary.lastComment.created_at)}</span>
          {summary.lastComment.is_internal && (
            <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs px-1 py-0 ml-1">
              Interno
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
