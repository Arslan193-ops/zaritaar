"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Package, Truck, CheckCircle2, AlertCircle, ArrowLeft, Loader2, MapPin } from "lucide-react"
import Link from "next/link"
import { getOrderStatus } from "../checkout/actions"
import { cn } from "@/lib/utils"

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState("")

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId.trim()) return
    
    setLoading(true)
    setError("")
    setOrder(null)

    try {
      const res = await getOrderStatus(orderId.trim(), email.trim())
      if (res.success) {
        setOrder(res.order)
      } else {
        setError(res.error || "Order not found. Please check your credentials.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusStep = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 1
      case 'PROCESSING': return 2
      case 'SHIPPED': return 3
      case 'DELIVERED': return 4
      default: return 1
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white">
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-24 animate-in fade-in duration-700">
        
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-8 h-[1px] bg-[#D4AF37]" />
            <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">Logistics</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">Track Your Order</h1>
          <p className="text-sm text-gray-400 mt-4 max-w-md leading-relaxed font-medium">
            Enter your order reference ID to view its current status and estimated delivery journey.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleTrack} className="relative mb-20 group">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-[1.5]">
              <input 
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="ORDER ID (E.G. CLX...)"
                className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-8 pr-16 text-sm font-bold tracking-widest text-gray-900 outline-none focus:bg-white focus:border-gray-900 transition-all uppercase placeholder:text-gray-300"
                required
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="relative flex-[2]">
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="CUSTOMER EMAIL"
                className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-8 pr-16 text-sm font-bold tracking-widest text-gray-900 outline-none focus:bg-white focus:border-gray-900 transition-all uppercase placeholder:text-gray-300"
                required
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300">
                <Search className="w-5 h-5" />
              </div>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="h-16 px-10 bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Track Status"}
            </button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-8 bg-red-50 rounded-3xl border border-red-100 flex items-center gap-4 text-red-600"
            >
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p className="text-sm font-bold uppercase tracking-widest">{error}</p>
            </motion.div>
          )}

          {order && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Status Stepper */}
              <div className="bg-gray-50/50 rounded-[2.5rem] p-8 md:p-12 border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                  <div>
                    <h3 className="text-2xl font-serif text-gray-900">Current Progress</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Order Ref: {order.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="px-6 py-2.5 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-black/10">
                    {order.status}
                  </div>
                </div>

                <div className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-0">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-5 md:left-0 md:w-full h-full md:h-[2px] bg-gray-200 -z-0 hidden md:block">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((getStatusStep(order.status) - 1) / 3) * 100}%` }}
                      className="h-full bg-gray-900"
                    />
                  </div>

                  {[
                    { label: "Confirmed", icon: CheckCircle2, step: 1 },
                    { label: "Processing", icon: Package, step: 2 },
                    { label: "Dispatched", icon: Truck, step: 3 },
                    { label: "Delivered", icon: MapPin, step: 4 },
                  ].map((s, idx) => {
                    const active = getStatusStep(order.status) >= s.step
                    return (
                      <div key={idx} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-6">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                          active ? "bg-black border-black text-white shadow-xl shadow-black/20" : "bg-white border-gray-100 text-gray-200"
                        )}>
                          <s.icon className="w-5 h-5" />
                        </div>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          active ? "text-gray-900" : "text-gray-200"
                        )}>
                          {s.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Order Items Summary */}
              <div className="grid md:grid-cols-2 gap-12 pt-8">
                 <div className="space-y-6">
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] border-b border-gray-100 pb-4">Package Contents</h4>
                    <div className="space-y-4">
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className="flex gap-4 items-center group">
                          <div className="w-14 h-16 bg-gray-50 rounded-xl overflow-hidden relative shrink-0 border border-gray-100">
                             {item.variant?.imageUrl ? (
                               <img 
                                src={item.variant.imageUrl} 
                                alt="" 
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                               />
                             ) : (
                               <div className="absolute inset-0 flex items-center justify-center text-gray-200"><Package className="w-5 h-5" /></div>
                             )}
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="text-[11px] font-bold text-gray-900 uppercase tracking-tight truncate">{item.variant?.product?.title || "Product"}</p>
                             <p className="text-[10px] font-medium text-gray-400">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] border-b border-gray-100 pb-4">Destination</h4>
                    <div className="space-y-4">
                       <p className="text-[11px] font-bold text-gray-900 uppercase tracking-widest leading-relaxed">
                          {order.customerName}<br/>
                          {order.shippingStreet}<br/>
                          {order.shippingCity}, {order.shippingState}
                       </p>
                       <div className="pt-4 space-y-1">
                          <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest">Total Value</p>
                          <p className="text-2xl font-black text-gray-900 tracking-tighter">Rs. {order.totalAmount?.toLocaleString()}</p>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-32 pt-12 border-t border-gray-100 flex justify-center">
           <Link href="/shop" className="inline-flex items-center gap-3 text-[10px] font-black text-[#D4AF37] hover:text-black transition-colors uppercase tracking-[0.3em] group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Return to Collection
           </Link>
        </div>

      </main>
    </div>
  )
}
