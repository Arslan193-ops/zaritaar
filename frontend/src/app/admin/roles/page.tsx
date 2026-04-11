import { getRoles } from "./actions"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Shield, Plus, Key } from "lucide-react"
import Link from "next/link"
import { RoleDeleteButton } from "./components"

export const dynamic = "force-dynamic"

export default async function RolesPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const isSuperHost = session.user.role?.name === "SUPER_HOST"
  const roles = await getRoles()

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Access Control</h2>
          <p className="text-sm text-slate-500 mt-1">Define roles and manage permission sets.</p>
        </div>
        
        {isSuperHost && (
          <Link href="/admin/roles/new">
            <button className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              New Role
            </button>
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => {
          const perms = JSON.parse(role.permissions || "[]")
          const isFullAccess = perms.includes("*")
          
          return (
            <div key={role.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col overflow-hidden">
                 <div className="p-6 space-y-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                       <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center border border-slate-200">
                          <Shield className="w-5 h-5" />
                       </div>
                       <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                          {role._count.users} Users
                       </span>
                    </div>

                    <div>
                       <h3 className="text-lg font-semibold text-slate-900 tracking-tight">{role.name}</h3>
                       <p className="text-sm text-slate-500 mt-1">
                          {isFullAccess ? "System Superuser" : `${perms.length} Active Permissions`}
                       </p>
                    </div>

                    <div className="space-y-2 flex-1">
                       {perms.slice(0, 3).map((p: string, i: number) => (
                         <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-md">
                            <Key className="w-3 h-3 text-slate-400" />
                            {p === "*" ? "Root Access" : p}
                         </div>
                       ))}
                       {perms.length > 3 && (
                         <p className="text-xs font-medium text-slate-500 mt-2 px-1">
                           + {perms.length - 3} more
                         </p>
                       )}
                    </div>

                    <div className="pt-4 mt-auto border-t border-slate-100 flex items-center gap-3">
                       {isSuperHost && (
                         <Link href={`/admin/roles/${role.id}`} className="flex-1">
                            <button className="w-full h-9 rounded-md font-medium text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                               Edit Role
                            </button>
                         </Link>
                       )}
                       {isSuperHost && role._count.users === 0 && (
                          <RoleDeleteButton roleId={role.id} />
                       )}
                    </div>
                 </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

