"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { BaseProduct } from "@/lib/storefront-actions"
import ProductCard from "./ProductCard"
import { Square, Grid2X2 } from "lucide-react"

interface ProductGridProps {
  products: BaseProduct[]
  hasSidebar?: boolean
}

export default function ProductGrid({ products, hasSidebar = false }: ProductGridProps) {
  const searchParams = useSearchParams()
  const [view, setView] = useState<"1" | "2">((searchParams.get("view") as "1" | "2") || "2")

  const handleViewChange = (newView: "1" | "2") => {
    setView(newView)
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", newView)
    window.history.replaceState(null, "", `?${params.toString()}`)
  }

  // Determine grid columns based on view type and whether a sidebar is taking up screen width
  const gridClasses = view === "1" 
    ? (hasSidebar ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')
    : (hasSidebar ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5')

  return (
    <div>
      <div className="flex items-center justify-end mb-2">
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl">
          <button
            onClick={() => handleViewChange("1")}
            className={`p-2 transition-all rounded-lg ${view === "1" ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
            title="Single/Wide View"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleViewChange("2")}
            className={`p-2 transition-all rounded-lg ${view === "2" ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
            title="Dense Grid View"
          >
            <Grid2X2 className="w-4 h-4" />
          </button>
        </div>
      </div>


      <div className={`grid gap-3 md:gap-8 transition-all duration-500 ${gridClasses}`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} view={view as "1" | "2"} />
        ))}
      </div>
    </div>
  )
}
