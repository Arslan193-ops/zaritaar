import { getSession } from "@/lib/auth"
import ProfileForm from "./ProfileForm"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const session = await getSession()

  if (!session || !session.user) {
    redirect("/login")
  }

  const userForForm = {
    name: session.user.name || "Administrator",
    email: session.user.email,
    roleName: session.user.role?.name || "Super Host"
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Personal profile and security credentials.</p>
      </div>

      <ProfileForm user={userForForm} />
    </div>
  )
}

