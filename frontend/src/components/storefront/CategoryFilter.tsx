"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { ChevronDown, SlidersHorizontal, ArrowDownAZ, X } from "lucide-react"

export default function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [isOpen, setIsOpen] = useState(false)
  const currentSort = searchParams.get("sort") || "newest"
  
  // Basic Price Range State
  const [minPrice, setMinPrice] = useState(searchParams.get("min") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "")

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handlePriceApply = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice) params.set("min", minPrice)
    else params.delete("min")
    
    if (maxPrice) params.set("max", maxPrice)
    else params.delete("max")
    
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <>
      <div className="lg:hidden flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 text-sm font-bold text-black border border-black px-4 py-2 rounded-lg"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filter & Sort
        </button>
      </div>

      <div className={`fixed inset-0 z-50 bg-white/80 backdrop-blur-sm transition-all duration-300 lg:static lg:bg-transparent lg:backdrop-blur-none lg:z-auto ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible lg:opacity-100 lg:visible'}`}>
        <div className={`absolute left-0 top-0 bottom-0 w-[300px] bg-white lg:bg-transparent border-r border-gray-100 lg:border-none shadow-2xl lg:shadow-none lg:w-full lg:static transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-6 lg:p-0 flex flex-col h-full">
            
            <div className="flex items-center justify-between pb-6 border-b border-gray-100 lg:hidden">
              <span className="text-sm font-black uppercase tracking-widest text-gray-900">FILTERS</span>
              <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 text-gray-400 hover:text-black transition-colors">
                 <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-2 lg:pt-0 pb-6 pr-2 lg:pr-8">
              
              {/* Category Filter Section block */}
              <div className="mb-10">
                <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-5 pb-2 border-b border-black inline-block">Sort By</h3>
                <div className="flex flex-col gap-4">
                  {[
                    { val: "newest", label: "Newest Arrivals" },
                    { val: "price_asc", label: "Price: Low to High" },
                    { val: "price_desc", label: "Price: High to Low" }
                  ].map((option) => (
                    <label key={option.val} className="flex items-center gap-3 cursor-pointer group">
                       <div className="relative flex items-center justify-center w-4 h-4">
                         <input 
                           type="radio" 
                           name="sort" 
                           className="peer sr-only" 
                           checked={currentSort === option.val}
                           onChange={() => updateFilters("sort", option.val)}
                         />
                         <div className="w-4 h-4 rounded-full border border-gray-300 peer-checked:border-black transition-colors group-hover:border-gray-400" />
                         <div className="w-2 h-2 rounded-full bg-black absolute scale-0 peer-checked:scale-100 transition-transform duration-200" />
                       </div>
                       <span className={`text-[13px] font-medium transition-colors ${currentSort === option.val ? 'text-black font-semibold' : 'text-gray-500 group-hover:text-gray-900'}`}>
                         {option.label}
                       </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter Section block */}
              <div className="mb-10">
                <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-5 pb-2 border-b border-black inline-block">Price Range</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1">
                    <div className="relative flex items-center">
                      <span className="absolute left-0 pl-3 text-xs font-semibold text-gray-500">Rs.</span>
                      <input 
                        type="number" 
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Min" 
                        className="w-full h-10 pl-10 pr-3 bg-transparent border-b border-gray-300 rounded-none text-sm text-gray-900 outline-none focus:border-black transition-colors placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <span className="text-gray-300 font-light">-</span>
                  <div className="flex-1">
                    <div className="relative flex items-center">
                      <span className="absolute left-0 pl-3 text-xs font-semibold text-gray-500">Rs.</span>
                      <input 
                        type="number" 
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Max" 
                        className="w-full h-10 pl-10 pr-3 bg-transparent border-b border-gray-300 rounded-none text-sm text-gray-900 outline-none focus:border-black transition-colors placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handlePriceApply}
                  className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-[11px] font-bold uppercase tracking-[0.2em] transition-colors rounded-xl shadow-lg shadow-black/10"
                >
                  Apply Selection
                </button>
              </div>

              {/* Status Filter Section block */}
               <div>
                <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-5 pb-2 border-b border-gray-200 inline-block">Availability</h3>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-4 h-4">
                    <input 
                      type="checkbox" 
                      className="peer sr-only" 
                      checked={searchParams.get("inStock") === "true"}
                      onChange={(e) => updateFilters("inStock", e.target.checked ? "true" : "")}
                    />
                    <div className="w-4 h-4 border border-gray-300 rounded-sm peer-checked:bg-black peer-checked:border-black transition-colors group-hover:border-black" />
                    <svg className="w-3 h-3 text-white absolute scale-0 peer-checked:scale-100 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-[13px] font-medium text-gray-500 group-hover:text-gray-900 transition-colors">In Stock Only</span>
                </label>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
