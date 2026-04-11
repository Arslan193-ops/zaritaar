import { getUsers, getRoles } from "./actions"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Plus, UserPlus, Shield, Trash2, Mail, Calendar } from "lucide-react"
import Link from "next/link"
import { UserDeleteButton } from "./components"
import { BackButton } from "@/components/admin/BackButton"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const isSuperHost = session.user.role?.name === "SUPER_HOST"
  const users = await getUsers()

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <BackButton href="/admin" label="Back to Dashboard" />
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Users & Access</h2>
           <p className="text-sm text-slate-500 mt-1">Manage administrative accounts and roles.</p>
        </div>
        
        {isSuperHost && (
          <Link href="/admin/users/new">
            <button className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 text-sm">
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </Link>
        )}
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
             <div className="flex flex-col sm:flex-row items-center p-6 gap-6">
                {/* User Reference Asset & Identity */}
                <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-lg border border-slate-200 flex-shrink-0">
                    {user.name?.[0] || user.email[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-sm font-semibold text-slate-900 truncate flex items-center gap-3">
                      {user.name || "Unnamed User"}
                      {user.id === session.user.id && (
                        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">You</span>
                      )}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                         <Mail className="w-3.5 h-3.5" />
                         {user.email}
                      </span>
                      <span className="hidden sm:flex items-center gap-1.5">
                         <Calendar className="w-3.5 h-3.5" />
                         Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Permissions Archetype */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                   <div className="flex flex-col sm:items-end">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {user.role?.name || "No Role"}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        {user.role?.permissions === '["*"]' ? "Full Access" : "Restricted Access"}
                      </p>
                   </div>

                   {/* Destructive Control */}
                   <div className="flex items-center justify-center">
                     {isSuperHost && user.id !== session.user.id && (
                        <div className="sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <UserDeleteButton userId={user.id} />
                        </div>
                     )}
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}

