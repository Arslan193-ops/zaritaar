"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { ChevronDown, SlidersHorizontal, ArrowDownAZ, X, RotateCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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

  const clearAll = () => {
    setMinPrice("")
    setMaxPrice("")
    router.push(window.location.pathname, { scroll: false })
    setIsOpen(false)
  }

  return (
    <>
      <div className="lg:hidden flex items-center justify-between mb-2">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-gray-900 border border-gray-100 bg-white px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" /> Filter & Sort
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md lg:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[160] shadow-2xl flex flex-col lg:hidden"
            >
              <div className="p-8 flex flex-col h-full">
                <div className="flex items-center justify-between mb-10 pb-4 border-b border-gray-50">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Selection</span>
                     <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-300">Refine Collection</span>
                   </div>
                   <button onClick={() => setIsOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-900">
                     <X className="w-5 h-5" />
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-12 pb-10">
                   {/* SORT SECTION */}
                   <section>
                      <h3 className="text-sm font-serif text-gray-900 mb-6 flex items-center justify-between">
                         Sort by <span className="w-8 h-[1px] bg-[#D4AF37]/30" />
                      </h3>
                      <div className="space-y-4">
                        {[
                          { val: "newest", label: "Newest Arrivals" },
                          { val: "price_asc", label: "Price: Low to High" },
                          { val: "price_desc", label: "Price: High to Low" }
                        ].map((option) => (
                          <button 
                            key={option.val}
                            onClick={() => updateFilters("sort", option.val)}
                            className={`w-full flex items-center justify-between py-2 transition-all ${currentSort === option.val ? 'text-black font-bold' : 'text-gray-400 font-medium'}`}
                          >
                             <span className="text-xs uppercase tracking-widest">{option.label}</span>
                             {currentSort === option.val && <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />}
                          </button>
                        ))}
                      </div>
                   </section>

                   {/* PRICE SECTION */}
                   <section>
                      <h3 className="text-sm font-serif text-gray-900 mb-6 flex items-center justify-between">
                         Price Range <span className="w-8 h-[1px] bg-[#D4AF37]/30" />
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                         <div className="space-y-2">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Min Price</span>
                            <div className="relative">
                               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">Rs.</span>
                               <input 
                                 type="number" 
                                 value={minPrice}
                                 onChange={(e) => setMinPrice(e.target.value)}
                                 className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 text-xs font-bold focus:ring-1 focus:ring-[#D4AF37] transition-all"
                               />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Max Price</span>
                            <div className="relative">
                               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">Rs.</span>
                               <input 
                                 type="number" 
                                 value={maxPrice}
                                 onChange={(e) => setMaxPrice(e.target.value)}
                                 className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 text-xs font-bold focus:ring-1 focus:ring-[#D4AF37] transition-all"
                               />
                            </div>
                         </div>
                      </div>
                      <button 
                        onClick={handlePriceApply}
                        className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-black/10"
                      >
                        Apply Parameters
                      </button>
                   </section>

                   {/* AVAILABILITY SECTION */}
                   <section>
                      <h3 className="text-sm font-serif text-gray-900 mb-6 flex items-center justify-between">
                         Inventory <span className="w-8 h-[1px] bg-[#D4AF37]/30" />
                      </h3>
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer group">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">In Stock Only</span>
                         <input 
                            type="checkbox" 
                            className="w-5 h-5 accent-black rounded-lg" 
                            checked={searchParams.get("inStock") === "true"}
                            onChange={(e) => updateFilters("inStock", e.target.checked ? "true" : "")}
                          />
                      </label>
                   </section>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                   <button 
                    onClick={clearAll}
                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-600"
                   >
                     <RotateCcw className="w-3.5 h-3.5" /> Reset All
                   </button>
                   <button 
                    onClick={() => setIsOpen(false)}
                    className="bg-black text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest"
                   >
                     Show Results
                   </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:flex flex-col gap-10">
          <section>
            <h3 className="text-sm font-serif text-gray-900 mb-6 pb-2 border-b border-gray-100">Sort By</h3>
            <div className="flex flex-col gap-4">
              {[
                { val: "newest", label: "Newest Arrivals" },
                { val: "price_asc", label: "Price: Low to High" },
                { val: "price_desc", label: "Price: High to Low" }
              ].map((option) => (
                <button 
                  key={option.val}
                  onClick={() => updateFilters("sort", option.val)}
                  className={`text-left text-xs uppercase tracking-widest transition-all ${currentSort === option.val ? 'text-black font-black translate-x-2' : 'text-gray-400 font-medium hover:text-gray-900 hover:translate-x-1'}`}
                >
                   {option.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-serif text-gray-900 mb-6 pb-2 border-b border-gray-100">Price Range</h3>
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                 <div className="relative flex-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-300 uppercase">Rs.</span>
                    <input 
                      type="number" 
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min" 
                      className="w-full bg-gray-50 border-none rounded-lg py-2.5 pl-8 text-[11px] font-bold focus:ring-1 focus:ring-[#D4AF37]"
                    />
                 </div>
                 <div className="relative flex-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-300 uppercase">Rs.</span>
                    <input 
                      type="number" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max" 
                      className="w-full bg-gray-50 border-none rounded-lg py-2.5 pl-8 text-[11px] font-bold focus:ring-1 focus:ring-[#D4AF37]"
                    />
                 </div>
               </div>
               <button 
                onClick={handlePriceApply}
                className="w-full py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-neutral-800 transition-all shadow-lg shadow-black/5"
               >
                 Update View
               </button>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-serif text-gray-900 mb-6 pb-2 border-b border-gray-100">Availability</h3>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-black" 
                checked={searchParams.get("inStock") === "true"}
                onChange={(e) => updateFilters("inStock", e.target.checked ? "true" : "")}
              />
              <span className="text-xs uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">In Stock Only</span>
            </label>
          </section>

          <button 
            onClick={clearAll}
            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-300 hover:text-red-500 transition-colors pt-10"
          >
            <RotateCcw className="w-3 h-3" /> Reset Filters
          </button>
      </div>
    </>
  )
}
