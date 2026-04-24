"use client"

import Link from "next/link"

interface FooterProps {
  storeName?: string
}

export default function Footer({ storeName = "Zaritaar" }: FooterProps) {
  const displayName = storeName === "My Store" ? "Zaritaar" : storeName;

  return (
    <footer className="bg-black border-t border-gray-900 py-16 px-6 mt-auto">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-serif text-white tracking-wide">{displayName}</span>
            </Link>
            <p className="text-gray-400 leading-relaxed max-w-xs text-xs font-medium">
              Meticulously handcrafted in our ateliers. Heritage redefined for the modern connoisseur.
            </p>
          </div>

          {/* Explore */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Explore</h4>
            <nav className="flex flex-col gap-4">
              <Link href="/shop" className="text-xs font-medium text-gray-400 hover:text-white transition-colors tracking-wide">Collections</Link>
              <Link href="/checkout" className="text-xs font-medium text-gray-400 hover:text-white transition-colors tracking-wide">Shopping Bag</Link>
            </nav>
          </div>

          {/* Customer Care */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Customer Care</h4>
            <nav className="flex flex-col gap-4">
              <Link href="/shipping-returns" className="text-xs font-medium text-gray-400 hover:text-white transition-colors tracking-wide">Shipping & Returns</Link>
              <Link href="/track-order" className="text-xs font-medium text-gray-400 hover:text-white transition-colors tracking-wide">Track Order</Link>
              <Link href="/privacy-policy" className="text-xs font-medium text-gray-400 hover:text-white transition-colors tracking-wide">Privacy Policy</Link>
            </nav>
          </div>

          {/* The Atelier */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">The Atelier</h4>
            <p className="text-xs font-medium text-gray-400 leading-relaxed tracking-wide">
              Global operations handled from our central design laboratory in Pakistan.
            </p>
            <div className="pt-2">
               <a href="mailto:contact@zaritaar.com" className="text-xs font-bold text-white hover:text-gray-300 transition-colors uppercase tracking-widest border-b border-gray-700 pb-1">
                 contact@zaritaar.com
               </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} {displayName.toUpperCase()}. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
             <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Instagram</span>
             <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Facebook</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
