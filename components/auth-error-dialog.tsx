'use client'

import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface AuthErrorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  error: string
}

export function AuthErrorDialog({ open, onOpenChange, error }: AuthErrorDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">Error de Autenticación</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {error}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            Entendido
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
