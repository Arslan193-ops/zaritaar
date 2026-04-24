"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteRole } from "./actions"
import { toast } from "sonner"

export function RoleDeleteButton({ roleId }: { roleId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this role?")) return

    setIsDeleting(true)
    try {
      await deleteRole(roleId)
      toast.success("Role successfully removed.")
    } catch (err: any) {
      toast.error(err.message || "An error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
      className="h-9 w-9 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </Button>
  )
}

