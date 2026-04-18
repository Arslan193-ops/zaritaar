"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { CdnImage } from "@/components/storefront/CdnImage"
import { useRenderGuard } from "@/lib/debug-utils"
import { LayoutGrid, Square, Grid2X2 } from "lucide-react"
import { urlFor } from "@/lib/sanity"

interface ProductGridProps {
  products: any[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  useRenderGuard("ProductGrid", 30)
  // 1 = single view (one per row), 2 = double view (two per row)
  const [cols, setCols] = useState<1 | 2>(1)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("product-view-cols")
    if (saved === "2") setCols(2)
    setMounted(true)
  }, [])

  const handleToggle = (num: 1 | 2) => {
    setCols(num)
    localStorage.setItem("product-view-cols", num.toString())
  }

  if (!mounted) return (
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((p, idx) => (
          <div key={p?._id || p?.id || `skeleton-${idx}`} className="aspect-[4/5] bg-gray-50 animate-pulse rounded-2xl" />
        ))}
     </div>
  )

  return (
    <div className="space-y-8">
      {/* View Toggle Controls */}
      <div className="flex items-center justify-end gap-1 border-b border-gray-100 pb-4">
        <button 
          onClick={() => handleToggle(1)}
          className={`p-2 transition-all rounded-lg ${cols === 1 ? 'bg-black text-white shadow-lg' : 'text-gray-300 hover:text-black'}`}
          title="Single View"
        >
          <Square className="w-4 h-4" />
        </button>
        <button 
          onClick={() => handleToggle(2)}
          className={`p-2 transition-all rounded-lg ${cols === 2 ? 'bg-black text-white shadow-lg' : 'text-gray-300 hover:text-black'}`}
          title="Grid View"
        >
          <Grid2X2 className="w-4 h-4" />
        </button>
      </div>

      {/* Dynamic Product Grid */}
      <div className={`grid gap-4 md:gap-8 transition-all duration-500 ${
        cols === 1 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
      }`}>
        {products.map((product: any) => (
          <Link 
            key={product._id || product.id} 
            href={`/product/${product._id || product.id}`} 
            className="group block p-3 sm:p-4 bg-white border border-gray-200 rounded-[2rem] transition-all duration-500 hover:shadow-2xl hover:border-gray-300 shadow-sm"
          >
            <div className="aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-50 transition-all duration-500 group-hover:scale-[1.02]">
              {product.images?.[0] || product.imageUrl ? (
              <CdnImage 
                src={
                  product.images?.[0]?.url || 
                  (typeof product.images?.[0] === 'string' ? product.images[0] : null) ||
                  product.imageUrl ||
                  (product.images?.[0] ? urlFor(product.images[0]).width(cols === 1 ? 720 : 400).url() : '')
                } 
                alt={product.title}
                fill
                sizes={cols === 1 ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" : "(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 20vw"}
                loading="lazy"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              ) : (
              <Image 
                src="/placeholder.svg"
                alt=""
                fill
                className="object-cover"
              />
              )}
              <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                <span className="bg-black text-white px-2 py-0.5 sm:px-3 sm:py-1 text-[8px] sm:text-[10px] font-bold tracking-wider uppercase shadow-sm">
                  {product.category?.name || 'Limited'}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 mt-4 px-1 text-center">
              <h3 className={`font-bold text-gray-900 group-hover:text-black transition-colors truncate w-full ${cols === 2 ? 'text-[11px] sm:text-sm' : 'text-sm'}`}>
                {product.title}
              </h3>
              <div className="flex items-center justify-center gap-3 text-[9px] sm:text-xs">
                {cols === 1 && <span className="text-gray-400 font-medium tracking-widest hidden sm:inline">REG {(product._id || product.id || "00").substring(0, 4)}</span>}
                <span className={`font-black text-gray-900 ${cols === 2 ? 'text-[11px] sm:text-sm' : 'text-sm'}`}>
                  Rs. {(product.basePrice || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
