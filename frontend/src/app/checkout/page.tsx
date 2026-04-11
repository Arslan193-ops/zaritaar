"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, ShoppingBag, ShieldCheck, ArrowLeft, Lock, User, Truck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createOrder } from "../cart/actions"
import Header from "@/components/storefront/Header"
import Image from "next/image"
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

  useEffect(() => {
    setIsClient(true)
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(storedCart)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) {
      toast.error("Your bag is empty")
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
        items: cart
      })
      if (res.success) {
        localStorage.removeItem('cart')
        setCart([])
        window.dispatchEvent(new Event('cartUpdated'))
        toast.success("Order placed successfully!")
        setCheckoutComplete(true)
      } else {
        toast.error(res.error || "Error placing order.")
      }
    } catch (err) {
      toast.error("Error placing order. Please try again.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isClient) return null

  if (checkoutComplete) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex items-center justify-center p-8 animate-in zoom-in duration-700">
          <div className="max-w-2xl w-full bg-white border border-gray-100 p-16 text-center space-y-12">
            <div className="w-24 h-24 border border-gray-900 flex items-center justify-center mx-auto p-1">
               <div className="w-full h-full border border-gray-50 flex items-center justify-center bg-gray-50/50">
                  <CheckCircle2 className="w-10 h-10 text-gray-900" />
               </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-thin text-gray-900 uppercase tracking-tight">Transmission_Success</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] leading-relaxed max-w-xs mx-auto">
                Ledger entry confirmed. Your ARCHIVE selection has been routed for dispatch.
              </p>
            </div>
            <Link href="/">
              <button className="bg-[#059669] hover:bg-[#047857] text-white px-12 py-5 font-black text-[10px] uppercase tracking-[0.4em] transition-all rounded-xl shadow-lg shadow-[#059669]/10">
                Return to Registry
              </button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0)
  const shipping = 0
  const total = subtotal + shipping

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans selection:bg-black selection:text-white">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-24 w-full animate-in fade-in duration-700">
        {/* Checkout Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 py-1 px-3 bg-black/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Checkout Process
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">COMPLETE ORDER</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase tracking-widest bg-green-50 px-4 py-2 rounded-full border border-green-100">
            <Lock className="w-3.5 h-3.5" />
            Secure Transaction
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Shipping Form Architecture */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Contact Information */}
            <section className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                   <User className="w-5 h-5 text-gray-900" />
                </div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Shipping Contact</h2>
              </div>
              
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Email Address <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email" 
                    className="h-14 w-full bg-gray-50 border border-gray-100 rounded-xl px-6 text-sm font-bold text-gray-900 outline-none focus:border-gray-900 focus:bg-white transition-all"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Full Name <span className="text-red-500">*</span></label>
                    <input 
                      required 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name" 
                      className="h-14 w-full bg-gray-50 border border-gray-100 rounded-xl px-6 text-sm font-bold text-gray-900 outline-none focus:border-gray-900 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
                    <input 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (000) 000-0000" 
                      className="h-14 w-full bg-gray-50 border border-gray-100 rounded-xl px-6 text-sm font-bold text-gray-900 outline-none focus:border-gray-900 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                   <Truck className="w-5 h-5 text-gray-900" />
                </div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Shipping Address</h2>
              </div>
              
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Street Address <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="Address line 1" 
                    className="h-14 w-full bg-gray-50 border border-gray-100 rounded-xl px-6 text-sm font-bold text-gray-900 outline-none focus:border-gray-900 focus:bg-white transition-all"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">City <span className="text-red-500">*</span></label>
                    <input 
                      required 
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City/Region" 
                      className="h-14 w-full bg-gray-50 border border-gray-100 rounded-xl px-6 text-sm font-bold text-gray-900 outline-none focus:border-gray-900 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Postal Code</label>
                    <input 
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="POSTAL CODE" 
                      className="h-14 w-full bg-gray-50 border border-gray-100 rounded-xl px-6 text-sm font-bold text-gray-900 outline-none focus:border-gray-900 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-8">
               <Link href="/cart" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest group">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Return to Shopping Bag
               </Link>
            </div>
          </div>

          {/* Reconciliation Summary Area */}
          <div className="lg:col-span-5 sticky top-32">
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 space-y-10">
              <div className="space-y-4">
                 <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Bag Selection</h2>
                 <div className="w-10 h-1 bg-gray-900 rounded-full" />
              </div>
              
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-100">
                {cart.map((item, i) => (
                  <div key={i} className="flex gap-4 items-center group">
                    <div className="w-16 h-20 bg-gray-50 rounded-xl overflow-hidden relative flex-shrink-0">
                      <Image 
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop'} 
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="text-xs font-bold text-gray-900 truncate">{item.title}</h4>
                       <div className="flex flex-wrap gap-2 mt-1">
                          {item.selections && Object.entries(item.selections).map(([key, val]) => (
                            <span key={key} className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                              {key}: {val as string}
                            </span>
                          ))}
                          <span className="text-[9px] font-bold text-gray-900 uppercase tracking-widest bg-gray-50 px-1.5 py-0.5 rounded">QTY: {item.quantity || 1}</span>
                       </div>
                    </div>
                    <p className="text-sm font-black text-gray-900 tracking-tighter">${(item.price * (item.quantity || 1)).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="pt-10 border-t border-gray-100 space-y-6">
                <div className="flex justify-between items-center group">
                  <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors">Subtotal</span>
                  <span className="text-base font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors">Shipping</span>
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Complimentary</span>
                </div>
                
                <div className="pt-8 border-t border-gray-100">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Order Value</span>
                      <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none">${total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8 pt-4">
                <button 
                  type="submit" 
                  className="w-full h-16 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#059669]/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3" 
                  disabled={isSubmitting || cart.length === 0}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Processing Order...
                    </span>
                  ) : (
                    <>
                      Place Order
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )} 
                </button>
                
                <div className="flex items-center justify-center gap-3 py-4 border-t border-gray-100">
                  <Lock className="w-3.5 h-3.5 text-gray-300" />
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-none">Secure SSL Encryption</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      <footer className="h-24" />
    </div>
  )
}
