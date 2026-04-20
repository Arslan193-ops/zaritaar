"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"

interface FooterProps {
  storeName?: string
}

export default function Footer({ storeName = "My Store" }: FooterProps) {
  return (
    <footer className="bg-black border-t border-gray-900 py-24 pb-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white flex items-center justify-center rounded-xl">
                <ShoppingBag className="w-5 h-5 text-black" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white uppercase">{storeName}</span>
            </Link>
            <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-xs uppercase tracking-widest text-[10px]">
              Excellence in handcrafted fashion. Designed for the technical curator.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Store Navigation</h4>
            <nav className="flex flex-col gap-4">
              <Link href="/" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">New Arrivals</Link>
              <Link href="/shop" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Collections</Link>
              <Link href="/cart" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Shopping Bag</Link>
            </nav>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Protocols</h4>
            <nav className="flex flex-col gap-4">
              <Link href="/" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Shipping Logic</Link>
              <Link href="/" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Returns Policy</Link>
              <Link href="/" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Privacy Protocol</Link>
            </nav>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Contact Dispatch</h4>
            <p className="text-xs font-medium text-gray-500 leading-relaxed uppercase tracking-widest text-[10px]">
              Global operations handled from our central design laboratory.
            </p>
            <div className="flex items-center gap-4">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
               <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em] leading-none">Operations Live</span>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} {storeName.toUpperCase()}. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  )
}
