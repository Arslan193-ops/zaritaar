"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, ShoppingBag, MessageCircle, Ruler, Info, X, Maximize2, Truck } from "lucide-react"
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

  // Handle stock changes when switching variants
  useEffect(() => {
    if (currentStock === 0) {
      setQuantity(0)
    } else if (quantity > currentStock) {
      setQuantity(currentStock)
    } else if (quantity === 0 && currentStock > 0) {
      setQuantity(1)
    }
  }, [currentStock, quantity])

  const handleAddToCart = (silent = false) => {
    if (!selectedVariant && Object.keys(options).length > 0) {
      toast.error("Selection Required", {
        description: "Please select your preferred size and color before adding to bag."
      })
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
      if (currentCart[existingIndex].quantity + quantity > currentStock) {
        toast.error("Stock Limit Reached", {
          description: `We only have ${currentStock} units available for this selection.`
        })
        if (!silent) setAdding(false)
        return false
      }
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
       toast.success("Added to Bag", {
         description: `${product.title} has been successfully added to your shopping bag.`,
         action: {
           label: "View Bag",
           onClick: () => window.dispatchEvent(new Event('openCart'))
         }
       })
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
      
      {/* Size Guide Sidebar */}
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
                       <Info className="w-8 h-8 text-gray-200 mx-auto" />
                       <p className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Documentation Pending</p>
                    </div>
                  )
                  
                  try {
                    const chartData = JSON.parse(product.sizeChart)
                    if (Array.isArray(chartData)) {
                      return (
                        <div className="space-y-8">
                          {chartData.map((url: string, i: number) => (
                            <div key={i} className="group relative cursor-zoom-in" onClick={() => setZoomedChartUrl(url)}>
                              <img src={url} alt="Size Chart" className="w-full h-auto rounded-2xl border border-gray-100 shadow-sm transition-transform duration-700 group-hover:scale-[1.01]" />
                            </div>
                          ))}
                        </div>
                      )
                    }
                    return null
                  } catch (e) { return null }
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Header Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-50 pb-2">
          {product.categorySlug ? (
            <Link 
              href={`/category/${product.categorySlug}`}
              className="text-[11px] font-medium text-[#D4AF37] uppercase tracking-[0.2em] hover:text-black transition-colors"
            >
              {product.categoryName || "Collection"}
            </Link>
          ) : (
            <p className="text-[11px] font-medium text-[#D4AF37] uppercase tracking-[0.2em]">
              {product.categoryName || "ZARITAAR OFFICIAL"}
            </p>
          )}
          <AnimatePresence mode="wait">
            <motion.p 
              key={selectedVariant?.sku || product.sku}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] font-medium text-gray-500 uppercase tracking-widest"
            >
              SKU: {selectedVariant?.sku || product.sku || "N/A"}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-serif font-normal text-gray-900 uppercase tracking-wide">
            {product.title}
          </h1>

          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              <motion.p 
                key={currentPrice}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-serif text-gray-900"
              >
                Rs. {currentPrice.toLocaleString()}
              </motion.p>
            </AnimatePresence>
            
            {product.freeShipping && (
              <span className="bg-[#E8F5E9] text-[#2E7D32] px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5 border border-[#C8E6C9]">
                <Truck className="w-3 h-3" />
                Free Shipping
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {currentStock > 0 && currentStock <= 10 && (
              <motion.p 
                key={currentStock}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[13px] font-medium text-[#FF4500]"
              >
                Only {currentStock} left in stock - order soon!
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="h-[1px] w-full bg-[#D4AF37]/50" />
      </div>

      {/* Options Section */}
      {Object.entries(options).map(([attrName, values]) => {
        const isColor = attrName.toLowerCase() === "color" || attrName.toLowerCase() === "colour" || attrName.toLowerCase() === "finish"
        return (
          <div key={attrName} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                {attrName.charAt(0).toUpperCase() + attrName.slice(1)}: <span className={cn("ml-1", isColor ? "text-[#D4AF37]" : "text-gray-400")}>{selections[attrName]}</span>
              </h3>
              {attrName.toLowerCase() === "size" && (
                <button onClick={() => setIsSizeGuideOpen(true)} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-black transition-all group">
                   <Ruler className="w-3.5 h-3.5" />
                   <span className="border-b border-transparent group-hover:border-black">SIZE GUIDE</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {values.map(val => (
                <button
                  key={val}
                  onClick={() => setSelections({...selections, [attrName]: val})}
                  className={
                    "transition-all duration-300 flex items-center justify-center relative " +
                    (isColor ? "w-9 h-9 rounded-full border-2 p-1 " : "min-w-[50px] h-10 px-4 text-[11px] font-bold border transition-colors ") +
                    (selections[attrName] === val 
                      ? (isColor ? "border-[#D4AF37] scale-110" : "border-black bg-black text-white") 
                      : (isColor ? "border-gray-100 opacity-60" : "border-gray-200 text-gray-400 hover:border-gray-400 hover:text-black"))
                  }
                >
                  {isColor ? <div className="w-full h-full rounded-full border border-black/5" style={{ backgroundColor: val.toLowerCase().replace(" ", "") }} title={val} /> : val}
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {/* Quantity Selector */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
        <div className="flex items-center w-32 h-12 border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))} 
            className="flex-1 h-full flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-black font-bold"
          >
            -
          </button>
          <div className="w-12 h-full flex items-center justify-center font-black text-xs border-x border-gray-50">
            {currentStock > 0 ? quantity : 0}
          </div>
          <button 
            onClick={() => {
              if (quantity < currentStock) {
                setQuantity(quantity + 1)
              } else {
                toast.error("Stock Limit", {
                  description: "You cannot add more items as we have reached the maximum available stock for this selection."
                })
              }
            }} 
            className="flex-1 h-full flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-black font-bold"
          >
            +
          </button>
        </div>
      </div>

      <div className="space-y-4 pt-6">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleAddToCart()} 
            disabled={adding || currentStock === 0}
            className={cn("h-14 font-bold text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 rounded border border-black", currentStock === 0 ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed" : "bg-white text-black hover:bg-black hover:text-white")}
          >
             {adding ? <Check className="w-4 h-4" /> : (currentStock === 0 ? "" : <ShoppingBag className="w-4 h-4" />)}
             {currentStock === 0 ? "Out of Stock" : (adding ? "Added" : "Add to Cart")}
          </button>
          <button 
            onClick={() => {
              if (quantity > currentStock) {
                toast.error(`Only ${currentStock} items available in stock.`)
                return
              }
              const success = handleAddToCart(true); 
              if (success) router.push("/checkout") 
            }} 
            disabled={currentStock === 0}
            className={cn("h-14 font-bold text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 rounded", currentStock === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-black text-white hover:bg-neutral-800")}
          >
             Buy It Now
          </button>
        </div>
        <button onClick={handleWhatsAppOrder} className="w-full h-14 bg-[#25D366] text-white font-bold text-[11px] uppercase tracking-[0.2em] transition-all hover:bg-[#128C7E] active:scale-[0.98] flex items-center justify-center gap-3 rounded">
           <MessageCircle className="w-5 h-5 fill-white" /> WhatsApp Order
        </button>
      </div>
    </div>
  )
}
