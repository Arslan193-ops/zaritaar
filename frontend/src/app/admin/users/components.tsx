"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteUser } from "./actions"
import { toast } from "sonner"

export function UserDeleteButton({ userId }: { userId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const handleDelete = async () => {
    if (!confirm) {
      setConfirm(true)
      setTimeout(() => setConfirm(false), 3000)
      return
    }

    setIsDeleting(true)
    try {
      await deleteUser(userId)
      toast.success("User profile successfully removed.")
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.")
    } finally {
      setIsDeleting(false)
      setConfirm(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      onClick={handleDelete}
      disabled={isDeleting}
      className={`h-9 px-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm ${
        confirm 
          ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
          : "text-slate-400 hover:text-red-600 hover:bg-red-50"
      }`}
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
      {confirm ? "Confirm" : "Delete"}
    </Button>
  )
}

