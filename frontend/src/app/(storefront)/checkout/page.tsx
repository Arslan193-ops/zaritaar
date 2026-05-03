"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, ShoppingBag, ShieldCheck, ArrowLeft, Lock, User, Truck, ArrowRight, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createOrder } from "./actions"
import Image from "next/image"
import { CdnImage } from "@/components/storefront/CdnImage"
import { toast } from "sonner"

export default function CheckoutPage() {
  const [cart, setCart] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)
  
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    street: "",
    city: "",
    state: ""
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutComplete, setCheckoutComplete] = useState(false)
  
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discountValue: number, discountType: string} | null>(null)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setIsApplyingCoupon(true)
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ code: couponCode, email: formData.email })
      })
      const data = await res.json()
      if (data.success) {
        setAppliedCoupon(data.coupon)
        toast.success("Coupon Applied", {
          description: "Your discount has been successfully applied to the total."
        })
      } else {
        setAppliedCoupon(null)
        toast.error("Invalid Coupon", {
          description: data.error || "Please double-check the code and try again."
        })
      }
    } catch {
      toast.error("System Error", {
        description: "There was a problem applying your coupon. Please check your connection."
      })
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  useEffect(() => {
    setIsClient(true)
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(storedCart)

    // Load saved customer info for faster checkout
    const savedInfo = localStorage.getItem('zaritaar_customer_info')
    if (savedInfo) {
      try {
        setFormData(JSON.parse(savedInfo))
      } catch (e) {
        console.error("Failed to parse saved info")
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) {
      toast.error("Empty Bag", {
        description: "Please add some items to your shopping bag before checking out."
      })
      return
    }
    setIsSubmitting(true)

    try {
      const res = await createOrder({
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingStreet: formData.street,
        shippingCity: formData.city,
        shippingState: formData.state,
        items: cart,
        couponCode: appliedCoupon?.code
      })
      if (res.success) {
        // Save customer info for future auto-fill
        localStorage.setItem('zaritaar_customer_info', JSON.stringify(formData))
        
        localStorage.removeItem('cart')
        setCart([])
        window.dispatchEvent(new Event('cartUpdated'))
        toast.success("Order Confirmed", {
          description: "Thank you for shopping with Zaritaar. A confirmation email is on its way to you."
        })
        setCheckoutComplete(true)
      } else {
        toast.error("Order Failed", {
          description: res.error || "There was a problem processing your order. Please try again."
        })
      }
    } catch (err) {
      toast.error("Connection Error", {
        description: "We couldn't reach the server. Please check your internet and try again."
      })
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isClient) return null

  if (checkoutComplete) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-black selection:text-white">
        <main className="flex-1 flex items-center justify-center p-6 md:p-12 animate-in fade-in zoom-in duration-1000">
          <div className="max-w-3xl w-full bg-white text-center space-y-16">
            
            {/* Celebration Icon */}
            <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
               <motion.div 
                 initial={{ scale: 0, rotate: -45 }}
                 animate={{ scale: 1, rotate: 0 }}
                 transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.2 }}
                 className="absolute inset-0 bg-[#D4AF37]/5 rounded-full border border-[#D4AF37]/20"
               />
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.5 }}
                 className="relative w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-2xl shadow-black/20"
               >
                  <CheckCircle2 className="w-8 h-8 text-[#D4AF37]" />
               </motion.div>
            </div>

            {/* Success Messaging */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 mb-2">
                <span className="w-12 h-[1px] bg-[#D4AF37]" />
                <p className="text-[11px] font-black text-[#D4AF37] uppercase tracking-[0.5em]">Confirmed</p>
                <span className="w-12 h-[1px] bg-[#D4AF37]" />
              </div>
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 tracking-tight">Thank You.</h2>
              <div className="space-y-4 max-w-lg mx-auto">
                <p className="text-lg text-gray-600 font-medium leading-relaxed">
                  Your order has been successfully placed and is now in our careful hands.
                </p>
                <p className="text-xs text-gray-400 uppercase tracking-widest leading-loose">
                  A digital receipt and confirmation details have been dispatched to your email address.
                </p>
              </div>
            </div>

            {/* Action Matrix */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pt-4">
              <Link href="/track-order" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-10 py-5 bg-black text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl hover:bg-neutral-800 transition-all active:scale-[0.98] shadow-xl shadow-black/10">
                  Track Your Order
                </button>
              </Link>
              <Link href="/shop" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-10 py-5 bg-white text-black border border-gray-100 font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl hover:border-black transition-all active:scale-[0.98]">
                  Back to Boutique
                </button>
              </Link>
            </div>

            {/* Support Footer */}
            <div className="pt-12 border-t border-gray-50">
               <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">Questions about your order? Contact boutique support.</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0)
  
  let discountAmount = 0
  if (appliedCoupon) {
     if (appliedCoupon.discountType === "PERCENTAGE") {
       discountAmount = subtotal * (appliedCoupon.discountValue / 100)
     } else {
       discountAmount = appliedCoupon.discountValue
     }
     if (discountAmount > subtotal) discountAmount = subtotal
  }

  const shipping = 0
  const total = subtotal - discountAmount + shipping

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-black selection:text-white">
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 w-full animate-in fade-in duration-700">
        {/* Checkout Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-8 h-[1px] bg-[#D4AF37]" />
            <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">Order Overview</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">Complete Order</h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Shipping Form Architecture */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Contact Information */}
            <section className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h2 className="text-xl font-serif font-bold text-gray-900">Shipping Contact</h2>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  <User className="w-3.5 h-3.5" />
                  Step 01
                </div>
              </div>
              
              <div className="grid gap-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address <span className="text-[#D4AF37]">*</span></label>
                  <input 
                    required 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="E.g. customer@zaritaar.com" 
                    className="h-12 w-full bg-transparent border-b-2 border-gray-100 px-1 text-sm font-bold text-gray-900 outline-none focus:border-[#D4AF37] transition-all placeholder:text-gray-200 placeholder:font-medium"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name <span className="text-[#D4AF37]">*</span></label>
                    <input 
                      required 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name" 
                      className="h-12 w-full bg-transparent border-b-2 border-gray-100 px-1 text-sm font-bold text-gray-900 outline-none focus:border-[#D4AF37] transition-all placeholder:text-gray-200 placeholder:font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
                    <input 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+92 XXX XXXXXXX" 
                      className="h-12 w-full bg-transparent border-b-2 border-gray-100 px-1 text-sm font-bold text-gray-900 outline-none focus:border-[#D4AF37] transition-all placeholder:text-gray-200 placeholder:font-medium"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h2 className="text-xl font-serif font-bold text-gray-900">Shipping Address</h2>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  <Truck className="w-3.5 h-3.5" />
                  Step 02
                </div>
              </div>
              
              <div className="grid gap-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Street Address <span className="text-[#D4AF37]">*</span></label>
                  <input 
                    required 
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="Flat, House, Street Number" 
                    className="h-12 w-full bg-transparent border-b-2 border-gray-100 px-1 text-sm font-bold text-gray-900 outline-none focus:border-[#D4AF37] transition-all placeholder:text-gray-200 placeholder:font-medium"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">City <span className="text-[#D4AF37]">*</span></label>
                    <input 
                      required 
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City/Region" 
                      className="h-12 w-full bg-transparent border-b-2 border-gray-100 px-1 text-sm font-bold text-gray-900 outline-none focus:border-[#D4AF37] transition-all placeholder:text-gray-200 placeholder:font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Postal Code</label>
                    <input 
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Postal Code (Optional)" 
                      className="h-12 w-full bg-transparent border-b-2 border-gray-100 px-1 text-sm font-bold text-gray-900 outline-none focus:border-[#D4AF37] transition-all placeholder:text-gray-200 placeholder:font-medium"
                    />
                  </div>
                </div>
              </div>
            </section>


          </div>

          {/* Reconciliation Summary Area */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <div className="space-y-12">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h2 className="text-xl font-serif font-bold text-gray-900">Bag Selection</h2>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
                </div>
              </div>
              
              <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                {cart.map((item, i) => (
                  <div key={i} className="flex gap-6 items-start group">
                    <div className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden relative flex-shrink-0 border border-gray-100 shadow-sm">
                      {item.imageUrl ? (
                      <Image 
                        src={item.imageUrl} 
                        alt={item.title}
                        fill
                        unoptimized={true}
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      ) : (
                      <Image src="/placeholder.svg" alt="" fill className="object-cover" unoptimized={true} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                       <h4 className="text-sm font-bold text-gray-900 tracking-tight group-hover:text-[#D4AF37] transition-colors">{item.title}</h4>
                       <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2.5">
                          {item.selections && Object.entries(item.selections).map(([key, val]) => (
                            <span key={key} className="text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
                              {key} <span className="text-gray-900">{val as string}</span>
                            </span>
                          ))}
                          <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 flex items-center h-5">QTY: {item.quantity || 1}</span>
                       </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 tracking-tight pt-1">Rs. {(item.price * (item.quantity || 1)).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-gray-100 space-y-5">
                
                {/* Coupon Code Input */}
                <div className="flex items-center gap-3">
                  <input 
                    type="text" 
                    placeholder="Gift card or discount code" 
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    className="h-12 flex-1 bg-transparent border-2 border-gray-100 rounded-lg px-4 text-sm font-bold text-gray-900 outline-none focus:border-black transition-all placeholder:font-medium placeholder:text-gray-300"
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="h-12 px-6 bg-black text-white font-bold text-xs uppercase tracking-widest rounded-lg disabled:opacity-50 hover:bg-gray-800 transition-colors"
                  >
                    {isApplyingCoupon ? "..." : "Apply"}
                  </button>
                </div>

                <div className="flex justify-between items-center group pt-4">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Subtotal</span>
                  <span className="text-sm font-bold text-gray-900">Rs. {subtotal.toLocaleString()}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between items-center group">
                    <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5" /> Discount ({appliedCoupon.code})
                    </span>
                    <span className="text-sm font-bold text-[#D4AF37]">- Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center group">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Shipping</span>
                  <span className="text-[9px] font-bold text-green-600 uppercase tracking-[0.2em] bg-green-50 px-2 py-0.5 rounded-full">Complimentary</span>
                </div>
                
                <div className="pt-10 mt-5 border-t border-gray-900/10">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Total Order Value</span>
                      <p className="text-3xl font-medium text-gray-900 tracking-tighter leading-none">Rs. {total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <button 
                  type="submit" 
                  className="w-full h-16 bg-black hover:bg-[#D4AF37] text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-black/10 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group" 
                  disabled={isSubmitting || cart.length === 0}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Dispatching...
                    </span>
                  ) : (
                    <>
                      Confirm Order
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )} 
                </button>
                
                <Link 
                  href="/shop"
                  className="w-full h-14 flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-black transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Continue Shopping
                </Link>

                <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-50">
                  <Lock className="w-3 h-3 text-gray-300" />
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] leading-none">Secure SSL Transmission</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

    </div>
  )
}
