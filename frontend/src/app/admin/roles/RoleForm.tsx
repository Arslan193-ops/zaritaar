"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { upsertRole } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Shield, Key, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { PERMISSIONS } from "@/lib/permissions"
import { toast } from "sonner"
import { BackButton } from "@/components/admin/BackButton"

export default function RoleForm({ role }: { role?: any }) {
  const [name, setName] = useState(role?.name || "")
  const [permissions, setPermissions] = useState<string[]>(
    role?.permissions ? JSON.parse(role.permissions) : []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const togglePermission = (perm: string) => {
    setPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await upsertRole(role?.id || null, { name, permissions })
      toast.success(role ? "Role updated successfully" : "Role created successfully")
      router.push("/admin/roles")
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
        <BackButton href="/admin/roles" label="Back to Roles" />
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{role ? "Update Role" : "Create Role"}</h2>
        <p className="text-sm text-slate-500 mt-1">Configure access levels and specific capabilities.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
           {/* Role Name */}
           <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Role Name</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  required 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Content Manager"
                  className="pl-10 h-11 border-slate-200 bg-white focus-visible:ring-slate-900 focus-visible:border-slate-900"
                />
              </div>
           </div>

           {/* Permissions Grid Structure */}
           <div className="space-y-4">
              <label className="text-sm font-medium text-slate-700 block mb-2">Abilities & Permissions <span className="text-xs text-slate-400 font-normal ml-2">(Granular Control Matrix)</span></label>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <th className="py-4 px-6 font-semibold">Module</th>
                        <th className="py-4 px-6 text-center">View</th>
                        <th className="py-4 px-6 text-center">Create</th>
                        <th className="py-4 px-6 text-center">Edit</th>
                        <th className="py-4 px-6 text-center">Delete</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {[
                       { label: "Dashboard",  prefix: "dashboard:" },
                       { label: "Products",   prefix: "products:" },
                       { label: "Categories", prefix: "categories:" },
                       { label: "Orders",     prefix: "orders:" },
                       { label: "Users",      prefix: "users:" },
                       { label: "Roles",      prefix: "roles:" },
                       { label: "Ads Settings", prefix: "ads:" },
                       { label: "Settings",   prefix: "settings:" },
                     ].map((module) => (
                       <tr key={module.prefix} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 text-sm font-medium text-slate-900 border-r border-slate-100/50 flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-slate-500"></div>
                             {module.label}
                          </td>
                          {['view', 'create', 'edit', 'delete'].map(action => {
                            const pKey = `${module.prefix}${action}`
                            
                            // 1. Dashboard only has "View"
                            const isDashboard = module.prefix === "dashboard:";
                            if (isDashboard && action !== "view") {
                               return <td key={pKey} className="py-4 px-6 text-center bg-slate-50/50 border-x border-slate-100/50"></td>
                            }

                            // 2. Settings only has View/Edit (no create/delete in this context usually)
                            const isSettings = module.prefix === "settings:";
                            if (isSettings && (action === "create" || action === "delete")) {
                               return <td key={pKey} className="py-4 px-6 text-center bg-slate-50/50 border-x border-slate-100/50"></td>
                            }

                            // 3. Orders usually doesn't have internal creation
                            const isOrders = module.prefix === "orders:";
                            if (isOrders && action === "create") {
                               return <td key={pKey} className="py-4 px-6 text-center bg-slate-50/50 border-x border-slate-100/50"></td>
                            }

                            // 4. Ads only has View/Edit
                            const isAds = module.prefix === "ads:";
                            if (isAds && (action === "create" || action === "delete")) {
                               return <td key={pKey} className="py-4 px-6 text-center bg-slate-50/50 border-x border-slate-100/50"></td>
                            }

                            // Valid checkbox spot
                            return (
                               <td key={pKey} className="py-4 px-6 text-center border-x border-slate-100/50">
                                  <button
                                     type="button"
                                     onClick={() => togglePermission(pKey)}
                                     className={`w-6 h-6 rounded flex items-center justify-center mx-auto transition-all ${
                                        permissions.includes(pKey) || permissions.includes("*")
                                          ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900 ring-offset-1" 
                                          : "bg-white border-2 border-slate-200 hover:border-slate-400"
                                     }`}
                                     disabled={permissions.includes("*")}
                                  >
                                     {(permissions.includes(pKey) || permissions.includes("*")) && <CheckCircle2 className="w-4 h-4" />}
                                  </button>
                               </td>
                            )
                          })}
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>

              {/* Super Admin Toggle */}
              <div className="pt-4 max-w-sm">
                 <button 
                    type="button"
                    onClick={() => togglePermission("*")}
                    className={`w-full p-4 rounded-xl border text-left transition-all group flex items-start gap-4 ${
                      permissions.includes("*") 
                        ? "bg-red-50 border-red-600 ring-1 ring-red-600" 
                        : "bg-white border-slate-200 hover:border-red-200 hover:bg-red-50/50"
                    }`}
                 >
                    <div className={`mt-0.5 w-8 h-8 rounded-lg flex shrink-0 items-center justify-center ${
                        permissions.includes("*") ? "bg-red-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-red-100 group-hover:text-red-500"
                    }`}>
                       <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm mb-1 ${
                         permissions.includes("*") ? "text-red-800" : "text-slate-900"
                      }`}>Super Administrator</p>
                      <p className={`text-xs leading-relaxed ${permissions.includes("*") ? "text-red-600/90" : "text-slate-500"}`}>
                        Grants absolute root access globally. Overrides all granular matrix checks above.
                      </p>
                    </div>
                 </button>
              </div>
           </div>

           <div className="pt-4 border-t border-slate-100">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-slate-900 hover:bg-black text-white px-8 h-11 text-sm font-bold shadow-lg shadow-slate-200/50 rounded-lg transition-all active:scale-[0.98] min-w-[140px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  role ? "Update Role" : "Create Role"
                )}
              </Button>
           </div>
        </form>
      </div>
    </div>
  )
}

