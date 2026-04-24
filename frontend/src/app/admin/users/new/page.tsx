"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getRoles, createAdminUser } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, UserCircle, Mail, Lock, Shield } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { BackButton } from "@/components/admin/BackButton"
import { Loader2, Plus } from "lucide-react"

export default function NewUserPage() {
  const [roles, setRoles] = useState<any[]>([])
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    roleId: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    getRoles().then(setRoles)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createAdminUser({
        email: formData.email,
        name: formData.name,
        passwordHash: formData.password,
        roleId: formData.roleId
      })
      toast.success("New user profile created.")
      router.push("/admin/users")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <BackButton href="/admin/users" label="Back to Users" />
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Add New User</h2>
        <p className="text-sm text-slate-500 mt-1">Register a new administrative account.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
               <UserCircle className="w-4 h-4 text-slate-400" />
               Full Name
            </label>
            <Input 
              required 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. John Doe" 
              className="h-10 border-slate-200 bg-white px-3 focus-visible:ring-slate-900 focus-visible:border-slate-900"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
               <Mail className="w-4 h-4 text-slate-400" />
               Email Address
            </label>
            <Input 
              required 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com" 
              className="h-10 border-slate-200 bg-white px-3 focus-visible:ring-slate-900 focus-visible:border-slate-900"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
               <Lock className="w-4 h-4 text-slate-400" />
               Password
            </label>
            <Input 
              required 
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Set secure password" 
              className="h-10 border-slate-200 bg-white px-3 focus-visible:ring-slate-900 focus-visible:border-slate-900"
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
               <Shield className="w-4 h-4 text-slate-400" />
               Assign Role
            </label>
            <div className="grid gap-3">
               {roles.map((role) => (
                 <label 
                    key={role.id}
                    className={`p-4 rounded-lg border cursor-pointer flex items-center transition-all ${
                      formData.roleId === role.id 
                        ? "bg-slate-50 border-slate-900 ring-1 ring-slate-900" 
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => setFormData({ ...formData, roleId: role.id })}
                 >
                   <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="roleId" 
                        checked={formData.roleId === role.id} 
                        readOnly
                        className="w-4 h-4 text-slate-900 border-slate-300 focus:ring-slate-900"
                      />
                      <div>
                        <p className="font-medium text-slate-900">{role.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                           {role.permissions === '["*"]' ? "Full access system-wide." : "Granular restricted access."}
                        </p>
                      </div>
                   </div>
                 </label>
               ))}
            </div>
          </div>

          <div className="pt-4">
            <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-slate-900 hover:bg-black text-white px-8 h-11 text-sm font-bold shadow-lg shadow-slate-200/50 rounded-lg transition-all active:scale-[0.98] min-w-[140px] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating User...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create User</span>
                  </>
                )}
             </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
