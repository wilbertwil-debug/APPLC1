"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface SignaturePadProps {
  onSignatureChange: (signature: string) => void
  initialSignature?: string
}

export function SignaturePad({ onSignatureChange, initialSignature }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (!container) return

      const containerWidth = container.clientWidth - 32 // Account for padding
      const aspectRatio = 2 // 2:1 aspect ratio

      canvas.width = Math.min(containerWidth, 400)
      canvas.height = canvas.width / aspectRatio

      // Set drawing styles
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = Math.max(2, canvas.width / 200) // Scale line width
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      // Load initial signature if provided
      if (initialSignature) {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          setHasSignature(true)
        }
        img.src = initialSignature
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => window.removeEventListener("resize", resizeCanvas)
  }, [initialSignature])

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()

    if ("touches" in e) {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0]
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault() // Prevent scrolling on touch
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const coords = getCoordinates(e)
    setIsDrawing(true)
    ctx.beginPath()
    ctx.moveTo(coords.x, coords.y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault() // Prevent scrolling on touch
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const coords = getCoordinates(e)
    ctx.lineTo(coords.x, coords.y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)

    const canvas = canvasRef.current
    if (!canvas) return

    const signature = canvas.toDataURL()
    onSignatureChange(signature)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    onSignatureChange("")
  }

  return (
    <div className="space-y-2">
      <Card className="p-4">
        <div className="text-sm text-gray-600 mb-2 text-center">
          Dibuja tu firma en el área de abajo {window.innerWidth <= 768 ? "(usa tu dedo)" : "(usa el mouse)"}:
        </div>
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="border-2 border-gray-300 rounded-lg cursor-crosshair bg-white touch-none max-w-full"
            style={{
              touchAction: "none",
              minHeight: "120px",
            }}
            // Mouse events
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
          />
        </div>
        <div className="flex justify-center mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSignature}
            disabled={!hasSignature}
            className="min-h-[44px] px-6 bg-transparent" // Larger touch target for mobile
          >
            Limpiar Firma
          </Button>
        </div>
      </Card>
    </div>
  )
}
