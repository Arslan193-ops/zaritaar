"use client"

import React, { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { CdnImage } from "@/components/storefront/CdnImage"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, Search, ChevronLeft, ChevronRight, X, Loader2, ArrowRight, Menu, ShoppingCart, Trash2 } from "lucide-react"
import { getStoreCategories, searchStoreProducts, getPublicSettings } from "@/lib/storefront-actions"
import { useRenderGuard } from "@/lib/debug-utils"

export default function HeaderClient({ settings }: { settings?: any }) {
  useRenderGuard("HeaderClient", 40)
  const [cartCount, setCartCount] = useState(0)
  const [categories, setCategories] = useState<any[]>([])
  const [liveSettings, setLiveSettings] = useState(settings)
  const [announcementIndex, setAnnouncementIndex] = useState(0)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<any[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const currentSettings = liveSettings || settings;

  const announcements = React.useMemo(() => {
    try {
      const parsed = JSON.parse(currentSettings?.announcementsText || "[]");
      return parsed.length > 0 ? parsed : ['Get an extra 5% off on your first order using code "IMNEW" !'];
    } catch {
      return ['Get an extra 5% off on your first order using code "IMNEW" !'];
    }
  }, [currentSettings?.announcementsText]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const updateCartCount = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]")
        setCartCount(cart.length)
        setCartItems(cart)
      }, 50);
    }

    const fetchInitialData = async () => {
      const [cats, settingsData] = await Promise.all([
        getStoreCategories(),
        !settings ? getPublicSettings() : Promise.resolve(null)
      ])
      setCategories(cats)
      if (settingsData) setLiveSettings(settingsData)
    }

    updateCartCount()
    fetchInitialData()
    setIsMounted(true)
    
    window.addEventListener("cartUpdated", updateCartCount)
    return () => window.removeEventListener("cartUpdated", updateCartCount)
  }, [settings])

  useEffect(() => {
    if (!currentSettings?.enableScrollingAnnouncements || announcements.length <= 1 || !isMounted) return;
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [currentSettings?.enableScrollingAnnouncements, announcements.length, isMounted]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsSearchOpen(false);
      };
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 1) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchStoreProducts(query);
        setSearchResults(results.slice(0, 5));
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    setIsSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cartItems]
    newCart.splice(index, 1)
    localStorage.setItem("cart", JSON.stringify(newCart))
    window.dispatchEvent(new Event("cartUpdated"))
  }

  const cartTotal = cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0)

  return (
    <header className="sticky top-0 z-50 w-full bg-white transition-all duration-300 rounded-none">
      <AnimatePresence>
        {isSearchOpen && isMounted && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden overflow-y-auto max-h-[80vh] no-scrollbar"
            >
              <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
                {isSearching ? <Loader2 className="w-5 h-5 text-black animate-spin" /> : <Search className="w-5 h-5 text-gray-400" />}
                <input 
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  placeholder="WHAT ARE YOU LOOKING FOR?"
                  className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg font-bold tracking-wider placeholder:text-gray-300 uppercase"
                />
                <button onClick={() => setIsSearchOpen(false)} className="p-1 text-gray-400 hover:text-black transition-colors">
                   <X className="w-6 h-6" />
                </button>
              </div>

              {searchQuery.length >= 2 ? (
                <div className="px-6 py-6 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
                        {isSearching ? 'Searching...' : 'Found Suggestions'}
                      </p>
                      {searchResults.length > 0 ? (
                        <div className="space-y-1">
                          {searchResults.map((product) => (
                            <Link 
                              key={product.id} 
                              href={`/product/${product.id}`}
                              prefetch={false}
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center gap-4 group hover:bg-black hover:text-white p-2 -mx-2 rounded-2xl transition-all duration-300"
                            >
                              <div className="w-10 h-14 bg-gray-100 relative overflow-hidden shrink-0 rounded-xl">
                                {product.image ? (
                                <CdnImage source={product.image} alt={product.title} fill sizes="40px" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                <Image src="/placeholder.svg" alt="" fill className="object-cover" unoptimized={true} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[11px] font-bold uppercase tracking-wider line-clamp-1">{product.title}</h4>
                                <p className="text-[10px] font-bold opacity-60">Rs. {product.basePrice?.toLocaleString()}</p>
                              </div>
                              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Link>
                          ))}
                        </div>
                      ) : !isSearching && (
                         <div className="py-4 text-center">
                            <p className="text-[11px] font-bold text-gray-400 italic">No matches found...</p>
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-10 flex flex-col items-center justify-center text-center space-y-3">
                  <Search className="w-5 h-5 text-gray-300" />
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Type to start searching</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-black text-[#D4AF37] w-full py-2 px-4 flex items-center justify-between text-[11px] font-medium tracking-wide relative z-50 rounded-none">
        <ChevronLeft onClick={() => setAnnouncementIndex((prev) => (prev - 1 + announcements.length) % announcements.length)} className="w-4 h-4 cursor-pointer hover:text-gray-300" />
        <div className="flex-1 overflow-hidden relative h-4">
          {announcements.map((text: string, idx: number) => (
            <p key={idx} className={`text-center w-full absolute transition-all duration-500 ${idx === announcementIndex ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>{text}</p>
          ))}
        </div>
        <ChevronRight onClick={() => setAnnouncementIndex((prev) => (prev + 1) % announcements.length)} className="w-4 h-4 cursor-pointer hover:text-gray-300" />
      </div>

      {/* Mobile & Desktop Header Content */}
      <div className="max-w-full mx-auto px-4 lg:px-12">
        <div className="h-16 flex items-center justify-between relative">
          
          {/* Burger Menu Button (Mobile Only) */}
          <div className="flex-1 lg:hidden">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 text-gray-700 hover:text-black transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Logo - Desktop: Left, Mobile: Center */}
          <div className="flex-1 lg:flex-none lg:static absolute left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0">
            <Link href="/" className="group flex items-center gap-2 md:gap-3">
              {currentSettings?.logoUrl ? (
                <div className="relative h-8 w-24 md:h-10 md:w-32">
                   <CdnImage 
                     source={currentSettings.logoUrl} 
                     alt={currentSettings?.storeName || "Logo"} 
                     fill 
                     className="object-contain lg:object-left object-center"
                     priority
                   />
                </div>
              ) : (
                <div className="flex flex-col items-center lg:items-start leading-tight">
                  <span className="text-sm md:text-xl font-bold tracking-[0.2em] text-[#D4AF37] transition-all group-hover:tracking-[0.25em]">ZARITAAR</span>
                  <span className="text-[5px] md:text-[7px] tracking-[0.3em] text-[#D4AF37] uppercase font-bold">The Gold Standard</span>
                </div>
              )}
            </Link>
          </div>

          {/* Nav - Desktop Only - Perfectly Centered */}
          <nav className="hidden lg:flex items-center justify-center gap-8 absolute left-1/2 -translate-x-1/2 h-full">
            <Link href="/shop" className="text-[11px] font-medium uppercase tracking-widest text-gray-600 hover:text-black transition-all">Shop All</Link>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`} className="text-[11px] font-medium uppercase tracking-wider text-gray-600 hover:text-black transition-all">{cat.name}</Link>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex-1 flex items-center justify-end gap-1 sm:gap-2">
            <button onClick={() => setIsSearchOpen(true)} className="p-2 text-gray-700 hover:text-black flex items-center justify-center">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-700 hover:text-black flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && <span className="absolute top-1 right-1 bg-black text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full border-2 border-white">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE SIDEBAR MENU (Nav) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md lg:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[120] shadow-2xl flex flex-col lg:hidden"
            >
              <div className="p-8 flex flex-col h-full">
                <div className="flex items-center justify-between mb-12">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Zaritaar</span>
                     <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-300">Boutique Bag</span>
                   </div>
                   <button 
                     onClick={() => setIsMenuOpen(false)} 
                     className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-900 hover:bg-black hover:text-white transition-all"
                   >
                     <X className="w-5 h-5" />
                   </button>
                </div>
                
                <nav className="flex flex-col gap-2">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Link 
                      href="/shop" 
                      onClick={() => setIsMenuOpen(false)}
                      className="text-xl font-serif text-gray-900 flex items-center justify-between group py-3"
                    >
                      Shop All <ChevronRight className="w-4 h-4 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </Link>
                  </motion.div>

                  {categories.map((cat, idx) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + (idx + 1) * 0.05 }}
                    >
                      <Link 
                        href={`/category/${cat.slug}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="text-xl font-serif text-gray-900 flex items-center justify-between group py-3"
                      >
                        {cat.name} <ChevronRight className="w-4 h-4 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </Link>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + (categories.length + 1) * 0.05 }}
                    className="pt-8 mt-4 border-t border-gray-50"
                  >
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] mb-4">Support & Logistics</h4>
                    <Link 
                      href="/track-order" 
                      onClick={() => setIsMenuOpen(false)}
                      className="text-xl font-serif text-[#D4AF37] flex items-center justify-between group py-3"
                    >
                      Track Order <ChevronRight className="w-4 h-4 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </Link>
                  </motion.div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* GLOBAL CART SIDEBAR */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white z-[120] shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-gray-100">
                 <div className="flex items-center gap-3">
                   <ShoppingBag className="w-5 h-5 text-gray-900" />
                   <h2 className="text-sm font-black uppercase tracking-widest">Shopping Bag ({cartCount})</h2>
                 </div>
                 <button onClick={() => setIsCartOpen(false)} className="p-2 -mr-2 text-gray-400 hover:text-black">
                   <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                 {cartItems.length > 0 ? (
                   cartItems.map((item, idx) => (
                     <div key={idx} className="flex gap-4 group">
                        <div className="w-20 h-28 bg-gray-50 rounded-xl overflow-hidden relative shrink-0 border border-gray-100">
                           {item.imageUrl ? (
                             <Image src={item.imageUrl} alt={item.title} fill className="object-cover" unoptimized={true} />
                           ) : (
                             <div className="absolute inset-0 flex items-center justify-center text-gray-200"><ShoppingBag className="w-6 h-6" /></div>
                           )}
                        </div>
                        <div className="flex-1 flex flex-col py-1">
                           <div className="flex items-start justify-between gap-2">
                              <h4 className="text-[11px] font-black uppercase tracking-wider leading-tight">{item.title}</h4>
                              <button onClick={() => removeFromCart(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                           <p className="text-[10px] font-bold text-gray-400 mt-1">{item.variantName || 'Boutique Item'}</p>
                           <div className="mt-auto flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-500">Qty: {item.quantity || 1}</span>
                              <span className="text-xs font-medium">Rs. {(item.price || 0).toLocaleString()}</span>
                           </div>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                      <ShoppingBag className="w-12 h-12" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">Your bag is empty</p>
                      <button 
                        onClick={() => setIsCartOpen(false)}
                        className="text-[10px] font-bold border-b border-black pb-1 uppercase tracking-widest hover:opacity-100"
                      >
                         View Collection
                      </button>
                   </div>
                 )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
                   <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Bag Subtotal</span>
                      <span className="text-xl font-medium">Rs. {cartTotal.toLocaleString()}</span>
                   </div>
                   <Link 
                    href="/checkout" 
                    onClick={() => setIsCartOpen(false)}
                    className="block w-full py-4 bg-black text-white text-center text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-black/10"
                   >
                     Secure Checkout
                   </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
