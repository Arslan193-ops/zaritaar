"use client"

import { useState } from "react"
import { updateProfile } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Mail, Lock, CheckCircle2, Loader2, ShieldCheck, KeyRound, AlertCircle } from "lucide-react"

export default function ProfileForm({
  user
}: {
  user: { name: string, email: string, roleName: string }
}) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    confirmPassword: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please re-check.")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess(false)

    try {
      const res = await updateProfile({
        name: formData.name,
        email: formData.email,
        password: formData.password || undefined
      })
      if (res.success) {
        setSuccess(true)
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }))
        // Sidebar will update automatically due to revalidatePath
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-12 gap-10">
      {/* Main Settings Card */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
              <p className="text-sm text-slate-500 mt-1">Update your display name and login email.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
              <ShieldCheck className="w-4 h-4 text-slate-900" />
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{user.roleName}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {success && (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 flex items-center gap-3 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-5 h-5" />
                <p className="text-sm font-semibold">Changes saved successfully!</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-3 animate-in zoom-in duration-300">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                  <Input
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="h-11 pl-10 bg-white border-slate-200 rounded-lg text-sm font-medium focus-visible:ring-slate-900 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="h-11 pl-10 bg-white border-slate-200 rounded-lg text-sm font-medium focus-visible:ring-slate-900 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 my-2"></div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">New Password</label>
                  <div className="relative group">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                    <Input
                      type="password"
                      placeholder="••••••••••"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="h-11 pl-10 bg-white border-slate-200 rounded-lg text-sm font-medium focus-visible:ring-slate-900 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm Update</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="h-11 pl-10 bg-white border-slate-200 rounded-lg text-sm font-medium focus-visible:ring-slate-900 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-start pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-slate-900 hover:bg-slate-800 text-white h-10 px-6 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile Details"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Info Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-lg space-y-6">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-lg">Identity & Access</h4>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed">
              You are currently logged in as an administrator. Your role defines the actions you can perform across the system.
            </p>
          </div>

          <div className="h-px bg-slate-800 w-full" />

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Current Role:</span>
              <span className="font-bold text-slate-100">{user.roleName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Status:</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-emerald-400">Active Session</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Quick Tip</p>
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            Need to change your permissions? Contact your system super administrator to request a role update.
          </p>
        </div>
      </div>
    </div>
  )
}
