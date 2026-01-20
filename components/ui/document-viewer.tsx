"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"

type DocumentViewerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  url?: string
  type?: string
  filename?: string
}

export function DocumentViewer({ open, onOpenChange, url, type, filename }: DocumentViewerProps) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false)
    }
    if (open) document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  if (!open || !url) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={() => onOpenChange(false)} />

      <div className="relative w-full max-w-4xl mx-4 bg-white rounded-lg shadow-lg p-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold">{filename}</p>
            <p className="text-sm text-gray-500">{type === "DIET" ? "PDF - Dieta" : type === "ROUTINE" ? "PDF - Rutina" : type === "REPORT" ? "Imagen - Informe" : "Documento"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
            <a href={url} target="_blank" rel="noreferrer" className="inline-block">
              <Button>Abrir en nueva pestaña</Button>
            </a>
          </div>
        </div>

        <div className="w-full h-[70vh] overflow-auto">
          {type === "REPORT" ? (
            <img src={url} alt={filename} className="mx-auto max-h-[70vh] object-contain" />
          ) : (
            <iframe src={url} className="w-full h-[70vh] border" title={filename} />
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default DocumentViewer
