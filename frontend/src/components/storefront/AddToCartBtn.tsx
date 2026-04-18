"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, ShoppingBag, MessageCircle, Zap, ArrowRight, Ruler, X } from "lucide-react"
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
    <div className="space-y-6 sm:space-y-8 md:space-y-10">
      {/* Attribute Selectors - Minimal Square Style */}
      {Object.entries(options).map(([attrName, values]) => (
        <div key={attrName} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{attrName}</h3>
            {attrName.toLowerCase() === "size" && (
               <Sheet>
                 <SheetTrigger 
                   render={
                     <button className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 hover:text-black transition-all border-b border-gray-200 hover:border-black cursor-pointer">
                        <Ruler className="w-3 h-3" /> Size Guide
                     </button>
                   }
                 />
                 <SheetContent side="right" className="w-[90vw] sm:w-[540px] p-0 border-l border-gray-100">
                    <div className="h-full flex flex-col bg-white">
                      <SheetHeader className="p-8 border-b border-gray-100">
                        <SheetTitle className="text-xl font-black uppercase tracking-tight">Standard Size Guide</SheetTitle>
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

                          <div className="bg-gray-50 p-6 rounded-3xl space-y-4">
                             <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-900">How to Measure?</h4>
                             <div className="space-y-3">
                                <div>
                                   <p className="text-[10px] font-bold uppercase text-gray-900">Chest</p>
                                   <p className="text-xs text-gray-500 leading-relaxed">Measure under your arms, around the fullest part of your chest.</p>
                                </div>
                                <div>
                                   <p className="text-[10px] font-bold uppercase text-gray-900">Waist</p>
                                   <p className="text-xs text-gray-500 leading-relaxed">Measure around your natural waistline, keeping the tape a bit loose.</p>
                                </div>
                             </div>
                          </div>

                          <div className="bg-emerald-50/50 p-6 rounded-3xl space-y-4 border border-emerald-100/50 mt-6">
                             <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-800">Still Unsure?</h4>
                             <p className="text-[10px] text-emerald-700/80 leading-relaxed font-medium">
                               Our experts are available to guide you with the perfect fit.
                             </p>
                             <a 
                               href={`https://wa.me/${whatsappNumber}?text=Hi, I need help with sizing for this product: ${product.title}`}
                               target="_blank"
                               className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200"
                             >
                                <MessageCircle className="w-3.5 h-3.5" /> Chat via WhatsApp
                             </a>
                          </div>
                        </div>
                      </div>
                    </div>
                 </SheetContent>
               </Sheet>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {values.map(val => (
              <button
                key={val}
                onClick={() => setSelections({...selections, [attrName]: val})}
                className={`w-12 h-12 flex items-center justify-center text-[10px] font-bold border transition-all uppercase rounded-xl ${selections[attrName] === val ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'}`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Quantity & Actions Block */}
      <div className="space-y-6 pt-2">
        <div className="space-y-3">
          <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Quantity</h3>
          <div className="flex items-center w-32 h-10 border border-gray-200 rounded-full overflow-hidden">
             <button 
               onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
               className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 transition-all font-light text-xl"
             >
               -
             </button>
             <div className="flex-1 h-full flex items-center justify-center bg-white">
               <input 
                 type="number" 
                 value={quantity} 
                 readOnly
                 className="w-full text-center text-xs font-bold focus:outline-none bg-transparent text-gray-900"
               />
             </div>
             <button 
               onClick={() => setQuantity(prev => prev + 1)}
               className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 transition-all font-light text-xl"
             >
               +
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Add to Cart - Luxury Outline */}
          <button 
            onClick={() => handleAddToCart()} 
            disabled={adding}
            className="h-14 bg-white text-gray-900 border-2 border-gray-900 font-black text-[10px] uppercase tracking-[0.25em] transition-all hover:bg-neutral-50 active:scale-[0.98] flex items-center justify-center gap-2 rounded-full"
          >
             {adding ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
             {adding ? "In Bag" : "Add to Cart"}
          </button>

          {/* Buy it Now - Solid Black */}
          <button 
            onClick={handleBuyNow}
            className="h-14 bg-black text-white font-black text-[10px] uppercase tracking-[0.25em] transition-all hover:bg-neutral-800 active:scale-[0.98] flex items-center justify-center gap-2 rounded-full"
          >
             {adding ? <Check className="w-4 h-4 animate-pulse text-white" /> : <ArrowRight className="w-4 h-4" />}
             Buy it Now
          </button>
        </div>

        {/* WhatsApp Checkout - Brand Green */}
        <div className="pt-2">
          <button 
            onClick={handleWhatsAppOrder}
            className="w-full h-14 bg-[#25D366] text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:opacity-90 active:scale-[0.98] flex flex-col items-center justify-center rounded-full shadow-sm"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
              WhatsApp Order
            </div>
          </button>
          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest text-center mt-3">
             Quick Checkout via Whatsapp Chat
          </p>
        </div>
      </div>
    </div>
  )
}

