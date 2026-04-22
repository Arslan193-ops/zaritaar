"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, ShoppingBag, MessageCircle, Ruler, Info } from "lucide-react"
import { cn } from "@/lib/utils"
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
      imageUrl: selectedVariant?.imageUrl || (product.image ? urlForImage(product.image, 400) : "")
    }
    
    localStorage.setItem('cart', JSON.stringify([...currentCart, newItem]))
    window.dispatchEvent(new Event('cartUpdated'))
    
    if (!silent) {
       toast.success("Successfully added to bag")
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

  return (
    <div className="space-y-10">

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
                <Sheet>
                  <SheetTrigger 
                    render={
                      <button className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-black transition-all group">
                         <Ruler className="w-3.5 h-3.5" />
                         <span className="border-b border-gray-200 group-hover:border-black">Size Guide</span>
                      </button>
                    }
                  />
                  <SheetContent side="right" className="w-[90vw] sm:w-[500px] p-0 border-l border-gray-100">
                    <div className="h-full flex flex-col bg-white">
                      <SheetHeader className="p-8 border-b border-gray-100">
                        <SheetTitle className="text-xl font-serif">Measurement Guide</SheetTitle>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Standard Fit (Inches)</p>
                      </SheetHeader>
                      <div className="flex-1 overflow-y-auto p-8">
                        {(() => {
                          if (!product.sizeChart) return (
                            <div className="py-20 text-center space-y-4">
                               <Info className="w-8 h-8 text-gray-100 mx-auto" />
                               <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No chart provided</p>
                            </div>
                          )
                          
                          try {
                            const chartData = JSON.parse(product.sizeChart)
                            

                            if (Array.isArray(chartData)) {
                              return (
                                <div className="space-y-4">
                                  {chartData.map((url: string, i: number) => (
                                    <img key={i} src={url} alt="Size Chart" className="w-full rounded-xl border border-gray-100" />
                                  ))}
                                </div>
                              )
                            }
                            

                            if (chartData && typeof chartData === 'object' && chartData.headers) {
                              return (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-[11px] border-collapse">
                                    <thead>
                                      <tr className="border-b border-gray-100">
                                        {chartData.headers.map((h: any, i: number) => (
                                          <th key={i} className="py-4 px-2 text-left font-black uppercase tracking-widest text-gray-900">{h.text}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {chartData.rows.map((row: any, ri: number) => (
                                        <tr key={ri} className="border-b border-gray-50">
                                          {row.map((cell: any, ci: number) => (
                                            <td key={ci} className="py-4 px-2 text-gray-500 font-medium">{cell.text}</td>
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
                            console.error("Size Chart Parse Error:", e)
                            return <p className="text-[10px] text-red-400">Error loading chart data</p>
                          }
                        })()}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
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
