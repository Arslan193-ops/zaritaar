"use client"

import { X, AlertTriangle, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  isDangerous?: boolean
  loading?: boolean
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Delete Permanently",
  isDangerous = true,
  loading = false
}: DeleteModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={loading ? undefined : onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-slate-100">
        <div className="p-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-3xl bg-red-50 text-red-500">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              {title}
            </h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-[280px] mx-auto opacity-80">
              {description}
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-10">
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`w-full py-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg ${
                isDangerous 
                ? "bg-red-600 text-white hover:bg-red-700 shadow-red-200" 
                : "bg-slate-900 text-white hover:bg-slate-800"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmText === "Delete Permanently" ? "Permanently Erase" : confirmText
              )}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full py-4 rounded-2xl text-[11px] font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-30"
            >
              Cancel / Safe Retreat
            </button>
          </div>
        </div>

        {/* Decorative progress bar if loading */}
        {loading && (
          <div className="absolute bottom-0 left-0 h-1 bg-red-600 animate-pulse w-full" />
        )}
      </div>
    </div>,
    document.body
  )
}
