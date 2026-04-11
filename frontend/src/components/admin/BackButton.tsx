"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface BackButtonProps {
  href: string
  label: string
}

export function BackButton({ href, label }: BackButtonProps) {
  return (
    <Link 
      href={href} 
      className="inline-flex items-center gap-2 px-3 py-1.5 -ml-3 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 group mb-4"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
      {label}
    </Link>
  )
}
