"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, ShoppingBag, MessageCircle, Zap, ArrowRight, Ruler, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet"

interface AddToCartBtnProps {
  product: any
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

  // Find matching variant
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
  // For visual testing and "colored" buttons, we won't disable them even if stock is 0
  const currentStock = selectedVariant?.stock ?? product.stock ?? 100

  const handleAddToCart = (silent = false) => {
    if (!selectedVariant && Object.keys(options).length > 0) {
      toast.error("Please select all options")
      return false
    }

    if (!silent) setAdding(true)
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]')
    
    const newItem = {
      productId: product.id,
      variantId: selectedVariant?.id || null,
      title: product.title,
      price: currentPrice,
      selections,
      quantity: quantity,
      imageUrl: selectedVariant?.imageUrl || product.imageUrl
    }
    
    localStorage.setItem('cart', JSON.stringify([...currentCart, newItem]))
    
    window.dispatchEvent(new Event('cartUpdated'))
    if (!silent) {
       toast.success("Successfully added to bag")
       setTimeout(() => setAdding(false), 1500)
    }
    return true
  }

  const handleBuyNow = () => {
    if (handleAddToCart(true)) {
      router.push('/cart')
    }
  }

  const handleWhatsAppOrder = () => {
    const selectionText = Object.entries(selections)
      .map(([key, val]) => `*${key}*: ${val}`)
      .join(", ");
    
    const message = encodeURIComponent(
      `Hi, I'd like to order this:\n\n` +
      `*Product*: ${product.title}\n` +
      `${selectionText ? `*Options*: ${selectionText}\n` : ""}` +
      `*Qty*: ${quantity}\n` +
      `*Total*: Rs. ${(currentPrice * quantity).toLocaleString()}\n\n` +
      `Is this available?`
    );

    const cleanNumber = (whatsappNumber || "").replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Attribute Selectors - Minimal Registry Style */}
      {Object.entries(options).map(([attrName, values]) => (
        <div key={attrName} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">{attrName} — <span className="text-gray-400 font-medium">{selections[attrName]}</span></h3>
            {attrName.toLowerCase() === "size" && (
               <Sheet>
                 <SheetTrigger 
                   render={
                     <button className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 hover:text-black transition-all border-b border-gray-200 hover:border-black cursor-pointer">
                        Size Guide
                     </button>
                   }
                 />
                 <SheetContent side="right" className="w-[90vw] sm:w-[540px] p-0 border-l border-gray-100">
                    <div className="h-full flex flex-col bg-white">
                      <SheetHeader className="p-8 border-b border-gray-100">
                        <SheetTitle className="text-xl font-serif">Standard Size Guide</SheetTitle>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Measurements in Inches</p>
                      </SheetHeader>
                      <div className="flex-1 overflow-y-auto p-8">
                        <div className="space-y-8">
                          {(() => {
                            try {
                              const chartData = product?.sizeChart ? JSON.parse(product.sizeChart) : []
                              if (Array.isArray(chartData) && chartData.length > 0) {
                                return (
                                  <div className="space-y-6">
                                    {chartData.map((url: string, index: number) => (
                                      <div key={index} className="relative aspect-[3/4] w-full border border-gray-100 rounded-3xl overflow-hidden bg-gray-50 group">
                                         <img 
                                           src={url} 
                                           alt={`Size Chart ${index + 1}`} 
                                           className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]" 
                                         />
                                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all pointer-events-none" />
                                      </div>
                                    ))}
                                    <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest leading-loose">
                                       Tip: Tap an image to view full scale
                                    </p>
                                  </div>
                                )
                              }
                              return (
                                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                                   <Ruler className="w-12 h-12 text-gray-100" />
                                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No size chart available</p>
                                </div>
                              )
                            } catch (e) {
                              return <p className="text-xs text-red-500">Error loading size chart</p>
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                 </SheetContent>
               </Sheet>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            {values.map(val => {
              const isColor = attrName.toLowerCase() === "color" || attrName.toLowerCase() === "colour"
              return (
                <button
                  key={val}
                  onClick={() => setSelections({...selections, [attrName]: val})}
                  className={cn(
                    "transition-all duration-300 relative flex items-center justify-center",
                    isColor 
                      ? "w-8 h-8 rounded-full border-2 p-0.5" 
                      : "min-w-[40px] px-2 py-1 text-[11px] font-bold uppercase tracking-widest border-b-2 hover:border-black",
                    selections[attrName] === val 
                      ? (isColor ? "border-black scale-110" : "border-black text-black") 
                      : (isColor ? "border-gray-200 opacity-80" : "border-transparent text-gray-400 hover:text-black")
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
              )
            })}
          </div>
        </div>
      ))}

      {/* Actions Block */}
      <div className="space-y-4 pt-6">
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => handleAddToCart()} 
            disabled={adding}
            className="w-full h-14 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-black active:scale-[0.98] flex items-center justify-center gap-3 rounded-lg shadow-lg shadow-slate-100"
          >
             {adding ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
             {adding ? "Added to Bag" : "Add to Bag"}
          </button>

          <button 
            onClick={handleBuyNow}
            className="w-full h-14 bg-white text-slate-900 border border-slate-200 font-bold text-[10px] uppercase tracking-[0.2em] transition-all hover:border-slate-900 hover:bg-slate-50 active:scale-[0.98] flex items-center justify-center rounded-lg"
          >
             Shop Instantly
          </button>
        </div>

        {/* WhatsApp Inquiry - Bordered Action Button */}
        <div className="pt-2">
          <button 
            onClick={handleWhatsAppOrder}
            className="w-full h-14 border border-emerald-100 bg-emerald-50/10 text-emerald-700 font-bold text-[9px] uppercase tracking-[0.2em] transition-all hover:bg-emerald-50 active:scale-[0.98] flex items-center justify-center gap-2 rounded-lg"
          >
             <MessageCircle className="w-4 h-4 text-emerald-500" />
             Inquiry via WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}

