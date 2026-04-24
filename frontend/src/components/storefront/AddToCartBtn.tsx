"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, ShoppingBag, MessageCircle, Ruler, Info, X, Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { DetailedProduct } from "@/lib/storefront-actions"
import { urlForImage } from "@/lib/sanity-image"

interface AddToCartBtnProps {
  product: DetailedProduct
  options: Record<string, string[]>
  whatsappNumber: string
}

export function AddToCartBtn({ product, options, whatsappNumber }: AddToCartBtnProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    Object.entries(options).forEach(([key, values]) => {
      if (values.length > 0) initial[key] = values[0]
    })
    return initial
  })
  
  const [adding, setAdding] = useState(false)

  const selectedVariant = (product.variants || []).find((v: any) => {
    if (!v.attributes) return false
    try {
      const vAttrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes
      return Object.entries(selections).every(([key, value]) => vAttrs[key] === value)
    } catch (e) {
      return false
    }
  })

  const currentPrice = selectedVariant?.price || product.basePrice
  const currentStock = selectedVariant?.stock ?? product.stock ?? 0

  const handleAddToCart = (silent = false) => {
    if (!selectedVariant && Object.keys(options).length > 0) {
      toast.error("Please select all required options.")
      return false
    }

    if (!silent) setAdding(true)
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]')
    
    const existingIndex = currentCart.findIndex((item: any) => 
      item.productId === product.id && 
      item.variantId === (selectedVariant?.id || null) &&
      JSON.stringify(item.selections) === JSON.stringify(selections)
    )

    if (existingIndex >= 0) {
      currentCart[existingIndex].quantity += quantity
    } else {
      const newItem = {
        productId: product.id,
        variantId: selectedVariant?.id || null,
        title: product.title,
        price: currentPrice,
        selections,
        quantity: quantity,
        imageUrl: selectedVariant?.imageUrl || (product.image ? urlForImage(product.image, 400) : "")
      }
      currentCart.push(newItem)
    }
    
    localStorage.setItem('cart', JSON.stringify(currentCart))
    window.dispatchEvent(new Event('cartUpdated'))
    
    if (!silent) {
       toast.success("Item added to your bag.")
       setTimeout(() => setAdding(false), 1500)
    }
    return true
  }

  const handleWhatsAppOrder = () => {
    const selectionText = Object.entries(selections)
      .map(([key, val]) => `*${key}*: ${val}`)
      .join(", ");
    
    const message = encodeURIComponent(
      `Hi ZARITAAR, I'd like to order this:\n\n` +
      `*Product*: ${product.title}\n` +
      `${selectionText ? `*Options*: ${selectionText}\n` : ""}` +
      `*Qty*: ${quantity}\n` +
      `*Total*: Rs. ${(currentPrice * quantity).toLocaleString()}\n\n` +
      `Is this available?`
    );

    const cleanNumber = (whatsappNumber || "").replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
  }

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  const [zoomedChartUrl, setZoomedChartUrl] = useState<string | null>(null)

  return (
    <div className="space-y-10">
      
      {/* Chart Lightbox */}
      <AnimatePresence>
        {zoomedChartUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-white/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-10"
          >
            <button 
              onClick={() => setZoomedChartUrl(null)}
              className="absolute top-6 right-6 sm:top-10 sm:right-10 w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 text-gray-900 hover:bg-black hover:text-white transition-all z-50"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full h-full max-w-6xl"
            >
              <img 
                src={zoomedChartUrl} 
                alt="Enlarged Chart" 
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 sm:p-10 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                 <div>
                   <h2 className="text-2xl sm:text-3xl font-serif text-gray-900">Measurement Guide</h2>
                   <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mt-1">Refining Your Perfect Fit</p>
                 </div>
                 <button 
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 text-gray-900 hover:bg-black hover:text-white transition-all"
                 >
                   <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-10 no-scrollbar">
                {(() => {
                  if (!product.sizeChart) return (
                    <div className="py-20 text-center space-y-6">
                       <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                         <Info className="w-8 h-8 text-gray-200" />
                       </div>
                       <div className="space-y-2">
                         <p className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Documentation Pending</p>
                         <p className="text-[10px] text-gray-400 font-medium max-w-[200px] mx-auto leading-relaxed">
                            A detailed chart for this specific boutique item is being finalized.
                         </p>
                       </div>
                    </div>
                  )
                  
                  try {
                    const chartData = JSON.parse(product.sizeChart)
                    
                    if (Array.isArray(chartData)) {
                      return (
                        <div className="space-y-8">
                          {chartData.map((url: string, i: number) => (
                            <div 
                              key={i} 
                              className="group relative cursor-zoom-in"
                              onClick={() => setZoomedChartUrl(url)}
                            >
                              <img 
                                src={url} 
                                alt="Size Chart" 
                                className="w-full h-auto rounded-2xl border border-gray-100 shadow-sm transition-transform duration-700 group-hover:scale-[1.01]" 
                              />
                              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-900 shadow-lg">
                                  <Maximize2 className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    }
                    
                    if (chartData && typeof chartData === 'object' && chartData.headers) {
                      return (
                        <div className="overflow-x-auto rounded-2xl border border-gray-100">
                          <table className="w-full text-[11px] border-collapse bg-white">
                            <thead>
                              <tr className="bg-gray-50">
                                {chartData.headers.map((h: any, i: number) => (
                                  <th key={i} className="py-6 px-6 text-left font-black uppercase tracking-widest text-gray-900">{h.text}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {chartData.rows.map((row: any, ri: number) => (
                                <tr key={ri} className="hover:bg-gray-50/50 transition-colors">
                                  {row.map((cell: any, ci: number) => (
                                    <td key={ci} className="py-6 px-6 text-gray-500 font-medium">{cell.text}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    }
                    return null
                  } catch (e) {
                    return <p className="text-[10px] text-red-400">Error loading data</p>
                  }
                })()}
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-center">
                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center">
                    All measurements are in inches unless otherwise specified.
                 </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-4">
        {product.freeShipping && (
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1.5 border border-emerald-100">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Free Shipping
          </span>
        )}
        {currentStock > 0 && currentStock < 10 && (
          <p className="text-[11px] font-bold text-orange-600 italic">
            Only {currentStock} left in stock - order soon!
          </p>
        )}
      </div>


      {Object.entries(options).map(([attrName, values]) => {
        const isColor = attrName.toLowerCase() === "color" || attrName.toLowerCase() === "colour" || attrName.toLowerCase() === "finish"
        
        return (
          <div key={attrName} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">
                {attrName}: <span className={cn("ml-1 font-medium", isColor ? "text-[#D4AF37]" : "text-gray-400")}>{selections[attrName]}</span>
              </h3>
              
              {attrName.toLowerCase() === "size" && (
                <button 
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-black transition-all group"
                >
                   <Ruler className="w-3.5 h-3.5" />
                   <span className="border-b border-gray-200 group-hover:border-black">Size Guide</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {values.map(val => (
                <button
                  key={val}
                  onClick={() => setSelections({...selections, [attrName]: val})}
                  className={cn(
                    "transition-all duration-300 flex items-center justify-center relative",
                    isColor 
                      ? "w-9 h-9 rounded-full border-2 p-1" 
                      : "min-w-[50px] h-10 px-4 text-[11px] font-bold border transition-colors",
                    selections[attrName] === val 
                      ? (isColor ? "border-[#D4AF37] scale-110" : "border-black bg-black text-white") 
                      : (isColor ? "border-gray-100 opacity-60" : "border-gray-200 text-gray-400 hover:border-gray-400 hover:text-black")
                  )}
                >
                  {isColor ? (
                    <div 
                      className="w-full h-full rounded-full border border-black/5" 
                      style={{ backgroundColor: val.toLowerCase().replace(" ", "") }}
                      title={val}
                    />
                  ) : (
                    val
                  )}
                </button>
              ))}
            </div>
          </div>
        )
      })}


      <div className="space-y-4 pt-6">
        <button 
          onClick={() => handleAddToCart()} 
          disabled={adding || currentStock === 0}
          className={cn(
            "w-full h-14 font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 rounded",
            currentStock === 0 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
              : "bg-black text-white hover:bg-gray-900 active:scale-[0.98]"
          )}
        >
           {adding ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
           {currentStock === 0 ? "Out of Stock" : (adding ? "Added to Bag" : "Add to Bag")}
        </button>

        <button 
          onClick={() => {
            const success = handleAddToCart(true)
            if (success) router.push("/checkout")
          }} 
          disabled={currentStock === 0}
          className={cn(
            "w-full h-14 font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 rounded border-2 border-black hover:bg-black hover:text-white",
            currentStock === 0 
              ? "opacity-20 cursor-not-allowed" 
              : "text-black bg-transparent"
          )}
        >
           Buy Now
        </button>

        <button 
          onClick={handleWhatsAppOrder}
          className="w-full h-14 border border-emerald-100 bg-emerald-50/20 text-emerald-800 font-black text-[9px] uppercase tracking-[0.2em] transition-all hover:bg-emerald-50 active:scale-[0.98] flex items-center justify-center gap-2 rounded"
        >
           <MessageCircle className="w-4 h-4 text-emerald-500" />
           Inquiry via WhatsApp
        </button>
      </div>
    </div>
  )
}
