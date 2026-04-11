"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, ShoppingBag, MessageCircle, Zap } from "lucide-react"

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
  const selectedVariant = product.variants.find((v: any) => {
    if (!v.attributes) return false
    const vAttrs = JSON.parse(v.attributes)
    return Object.entries(selections).every(([key, value]) => vAttrs[key] === value)
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
    <div className="space-y-10">
      {/* Attribute Selectors - Square Style with Depth */}
      {Object.entries(options).map(([attrName, values]) => (
        <div key={attrName} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">{attrName}</h3>
            {attrName.toLowerCase() === "size" && (
               <button className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1.5 hover:text-black transition-all group">
                  <span className="border-b border-gray-100 group-hover:border-black">Size Guide</span>
               </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {values.map(val => (
              <button
                key={val}
                onClick={() => setSelections({...selections, [attrName]: val})}
                className={`min-w-[48px] h-12 flex items-center justify-center px-4 text-[11px] font-black border-2 transition-all uppercase tracking-widest ${selections[attrName] === val ? 'bg-black text-white border-black shadow-lg scale-105' : 'bg-white text-gray-400 border-gray-50 hover:border-black hover:text-black'}`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Quantity Selector - Mechanical Design */}
      <div className="space-y-4 pt-2">
        <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Quantity Specification</h3>
        <div className="flex items-center w-36 h-12 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden ring-1 ring-black/5">
           <button 
             onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
             className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 transition-all font-bold text-lg"
           >
             -
           </button>
           <div className="flex-1 h-full flex items-center justify-center border-x border-gray-100 bg-white">
             <input 
               type="number" 
               value={quantity} 
               readOnly
               className="w-full text-center text-xs font-black focus:outline-none bg-transparent text-gray-900"
             />
           </div>
           <button 
             onClick={() => setQuantity(prev => prev + 1)}
             className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 transition-all font-bold text-lg"
           >
             +
           </button>
        </div>
      </div>

      <div className="pt-6 space-y-5">
        {/* Purchase Trio - High Saturation Colors */}
        <div className="grid grid-cols-2 gap-5">
          {/* Add to Cart - Vibrant Emerald */}
          <button 
            onClick={() => handleAddToCart()} 
            disabled={adding}
            className="h-14 bg-[#059669] text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-[#047857] active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-[#059669]/20"
          >
             {adding ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
             {adding ? "In Bag" : "Add to Cart"}
          </button>

          {/* Buy it Now - Solid Onyx (Always Colored) */}
          <button 
            onClick={handleBuyNow}
            className="h-14 bg-black text-white font-black text-[10px] uppercase tracking-[0.25em] transition-all hover:bg-neutral-800 active:scale-[0.98] flex items-center justify-center gap-2 shadow-2xl shadow-black/10"
          >
             <Zap className="w-4 h-4" /> Buy it Now
          </button>
        </div>

        {/* WhatsApp - Vibrant Green */}
        <div className="space-y-3">
          <button 
            onClick={handleWhatsAppOrder}
            className="w-full h-14 bg-[#22c55e] text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-[#16a34a] hover:shadow-xl hover:shadow-[#22c55e]/30 active:scale-[0.98] flex items-center justify-center gap-3 rounded-none ring-1 ring-[#22c55e]/20 shadow-lg shadow-[#22c55e]/10"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            WhatsApp Order
          </button>
          
          <div className="flex items-center justify-center gap-3">
             <div className="h-[1px] flex-1 bg-gray-100" />
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
               Direct Checkout Flow
             </p>
             <div className="h-[1px] flex-1 bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  )
}

