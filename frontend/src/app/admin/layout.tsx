import { Sidebar } from "@/components/admin/Sidebar"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { User } from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar */}
      <Sidebar permissions={session.user.role?.permissions || "[]"} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center px-8 justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Branding or Page Info could go here */}
          </div>
          
          <div className="flex items-center gap-6">
             <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />
             <Link href="/admin/profile" className="flex items-center gap-3 group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900 leading-tight capitalize">{session.user.name}</p>
                  <p className="text-xs font-medium text-slate-500 leading-tight">Admin Access</p>
                </div>
                <div className="w-9 h-9 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center shadow-sm border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <User className="w-4 h-4" />
                </div>
             </Link>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-10 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
