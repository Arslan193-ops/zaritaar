"use client"

import { useState } from "react"
import { registerHost } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")
    
    const result = await registerHost(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push("/admin")
      router.refresh()
    }
  }

  const registrationDisabled = process.env.NEXT_PUBLIC_ALLOW_REGISTRATION === "false" || false;

  if (registrationDisabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md border-amber-100 shadow-xl">
           <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-100 text-amber-600 animate-pulse">
                <span className="text-2xl">🔒</span>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">Registration Locked</CardTitle>
              <CardDescription className="text-slate-500 font-medium">
                Administrative sign-up is currently disabled for this store. Please contact the system owner if you require access.
              </CardDescription>
           </CardHeader>
           <CardContent className="pb-8">
              <Link href="/login" className="block">
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 rounded-xl shadow-md">
                  Return to Sign In
                </Button>
              </Link>
           </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Register Host</CardTitle>
          <CardDescription>Create your super-admin account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-100 font-medium">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input 
                type="text" 
                name="name" 
                placeholder="John Doe" 
                required 
                className="h-11 rounded-lg border-slate-200 focus:ring-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                name="email" 
                placeholder="admin@example.com" 
                required 
                className="h-11 rounded-lg border-slate-200 focus:ring-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input 
                type="password" 
                name="password" 
                placeholder="••••••••" 
                required 
                minLength={6}
                className="h-11 rounded-lg border-slate-200 focus:ring-slate-900"
              />
            </div>
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11 rounded-lg font-bold shadow-sm transition-all" type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Register"}
            </Button>
            <div className="text-center text-sm text-gray-500 mt-4 font-medium">
              Already have an account? <Link href="/login" className="text-slate-900 hover:underline font-bold">Sign in</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
