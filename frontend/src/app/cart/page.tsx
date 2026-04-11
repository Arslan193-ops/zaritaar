"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft, CheckCircle2, Minus, Plus, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createOrder } from "./actions"
import Header from "@/components/storefront/Header"
import Image from "next/image"

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)
  const [promoCode, setPromoCode] = useState("")

  useEffect(() => {
    setIsClient(true)
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(storedCart)
  }, [])

  const removeFromCart = (index: number) => {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart]
    const newQty = (newCart[index].quantity || 1) + delta
    if (newQty < 1) return
    newCart[index].quantity = newQty
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  if (!isClient) return null

  const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0)
  const shipping = 0 // Free Shipping for premium feel
  const total = subtotal + shipping

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans selection:bg-black selection:text-white">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-24 w-full animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 py-1 px-3 bg-black/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Shopping Cart Selection
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">SHOPPING BAG</h1>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
            <ShoppingBag className="w-4 h-4" />
            {cart.length} {cart.length === 1 ? 'Item' : 'Items'} in Bag
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="py-32 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
             <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-8">
               <ShoppingBag className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your Bag is Empty</h3>
            <p className="text-gray-400 mb-10 max-w-xs text-center font-medium">Looks like you haven't added anything to your collection yet.</p>
            <Link href="/">
              <button className="bg-gray-900 text-white px-10 py-4 font-bold text-xs uppercase tracking-widest transition-all hover:bg-black rounded-xl shadow-lg shadow-gray-200">
                Continue Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Bag Items Selection */}
            <div className="lg:col-span-8 space-y-6">
              {cart.map((item, i) => (
                <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 flex gap-6 md:gap-10 group relative transition-all hover:shadow-xl hover:shadow-gray-200/50 duration-500">
                  <div className="w-24 h-32 md:w-44 md:h-56 bg-gray-50 rounded-2xl overflow-hidden shadow-inner relative flex-shrink-0">
                    <Image 
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop'} 
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="space-y-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-4">
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">{item.title}</h3>
                          <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {item.selections ? (
                              Object.entries(item.selections).map(([key, val]) => (
                                <div key={key} className="flex items-baseline gap-2">
                                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{key}</span>
                                   <span className="text-xs font-bold text-gray-900">{val as string}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs font-bold text-gray-400">Standard Issue</span>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFromCart(i)}
                          className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end pt-8 md:pt-12">
                      <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                        <button 
                          onClick={() => updateQuantity(i, -1)}
                          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-12 text-center text-xs font-bold text-gray-900">{item.quantity || 1}</span>
                        <button 
                          onClick={() => updateQuantity(i, 1)}
                          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter">${(Number(item.price) * (item.quantity || 1)).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest group pt-4">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Continue Shopping
              </Link>
            </div>

            {/* Reconciliation Summary Area */}
            <div className="lg:col-span-4 sticky top-32">
              <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 space-y-10">
                <div className="space-y-4">
                   <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Order Summary</h2>
                   <div className="w-10 h-1 bg-gray-900 rounded-full" />
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center group">
                    <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors">Subtotal</span>
                    <span className="text-base font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors">Shipping</span>
                    <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Complimentary</span>
                  </div>

                  <div className="pt-6 space-y-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Promo Code</label>
                    <div className="flex gap-2">
                       <input 
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value)}
                        placeholder="ENTER CODE" 
                        className="flex-1 h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-gray-900 transition-all placeholder:text-gray-200"
                      />
                      <button className="h-12 px-6 bg-gray-100 hover:bg-gray-900 hover:text-white text-gray-900 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all">
                        Apply
                      </button>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-gray-100 flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-gray-500">Order Total</span>
                      <p className="text-4xl font-black text-gray-900 tracking-tighter leading-none">${total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 pt-4">
                  <Link href="/checkout">
                    <button 
                      className="w-full h-16 bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3" 
                    >
                      Checkout Now <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                  
                  <div className="flex items-center justify-center gap-3 py-4 border-t border-gray-100">
                    <Lock className="w-3.5 h-3.5 text-gray-300" />
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-none">Secure SSL Encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="h-24" />
    </div>
  )
}

