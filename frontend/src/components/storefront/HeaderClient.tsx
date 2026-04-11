"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, Search, ChevronLeft, ChevronRight, X, Loader2, ArrowRight } from "lucide-react"
import { getStoreCategories, searchStoreProducts } from "@/lib/storefront-actions"

export default function HeaderClient({ settings }: { settings?: any }) {
  const announcements = (() => {
    try {
      const parsed = JSON.parse(settings?.announcementsText || '[]');
      return parsed.length > 0 ? parsed : ['Get an extra 5% off on your first order using code "IMNEW" !'];
    } catch {
      return ['Get an extra 5% off on your first order using code "IMNEW" !'];
    }
  })();

  const [cartCount, setCartCount] = useState(0)
  const [categories, setCategories] = useState<any[]>([])
  const [announcementIndex, setAnnouncementIndex] = useState(0)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      setCartCount(cart.length)
    }

    const fetchCategories = async () => {
      const cats = await getStoreCategories()
      setCategories(cats)
    }

    updateCartCount()
    fetchCategories()
    setIsMounted(true)
    
    window.addEventListener("cartUpdated", updateCartCount)
    return () => window.removeEventListener("cartUpdated", updateCartCount)
  }, [])

  useEffect(() => {
    if (!settings?.enableScrollingAnnouncements || announcements.length <= 1) return;
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [settings?.enableScrollingAnnouncements, announcements.length]);

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

  // Real-time search logic
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
        setSearchResults(results.slice(0, 5)); // Show top 5 results
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

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm transition-all duration-300">
      {/* Professional Search Modal */}
      <AnimatePresence>
        {isSearchOpen && isMounted && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden overflow-y-auto max-h-[80vh] no-scrollbar"
            >
              {/* Search Input Area */}
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
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-100 bg-gray-50 px-1.5 font-sans text-[10px] font-medium text-gray-400 opacity-100">
                  <span className="text-xs">ESC</span>
                </kbd>
                <button 
                  onClick={() => setIsSearchOpen(false)} 
                  className="p-1 text-gray-400 hover:text-black transition-colors"
                >
                   <X className="w-6 h-6" />
                </button>
              </div>

              {/* Suggestions Area */}
              {(searchQuery.length >= 2 || searchResults.length > 0) ? (
                <div className="px-6 py-6 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Live Results */}
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
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center gap-4 group hover:bg-[#059669] hover:text-white p-2 -mx-2 rounded-2xl transition-all duration-300"
                            >
                              <div className="w-10 h-14 bg-gray-100 relative overflow-hidden shrink-0 rounded-xl">
                                <Image 
                                  src={product.imageUrl || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop'} 
                                  alt={product.title} 
                                  fill 
                                  className="object-cover group-hover:scale-110 transition-transform duration-700" 
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[11px] font-black uppercase tracking-wider line-clamp-1">{product.title}</h4>
                                <p className="text-[10px] font-bold opacity-60">Rs. {product.basePrice?.toLocaleString()}</p>
                              </div>
                              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Link>
                          ))}
                          {searchResults.length >= 5 && (
                            <button 
                              onClick={handleSearchSubmit}
                              className="text-[10px] font-black uppercase tracking-widest text-[#059669] flex items-center gap-2 pt-4 group hover:underline underline-offset-4"
                            >
                              View all results <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </button>
                          )}
                        </div>
                      ) : !isSearching && searchQuery.length >= 2 && (
                         <div className="py-4 text-center">
                            <p className="text-[11px] font-bold text-gray-400 italic">No exact matches found...</p>
                         </div>
                      )}
                    </div>

                    {/* Collections Hook */}
                    <div className="space-y-4 border-l border-gray-50 pl-8 hidden md:block">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Quick Access</p>
                      <div className="flex flex-col gap-1">
                         {categories.slice(0, 5).map(cat => (
                           <Link 
                             key={cat.id} 
                             href={`/category/${cat.slug}`}
                             onClick={() => setIsSearchOpen(false)}
                             className="text-[11px] font-bold uppercase tracking-wider text-gray-600 hover:text-black hover:translate-x-1 transition-all py-1"
                           >
                             {cat.name}
                           </Link>
                         ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-10 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                    <Search className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Type a character to start searching</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Announcement Bar */}
      <div className="bg-black text-white w-full py-2 px-4 flex items-center justify-between text-[11px] font-medium tracking-wide relative z-50">
        {announcements.length > 1 ? (
          <ChevronLeft 
            onClick={() => setAnnouncementIndex((prev) => (prev - 1 + announcements.length) % announcements.length)} 
            className="w-4 h-4 cursor-pointer hover:text-gray-300 transition-colors shrink-0" 
          />
        ) : <div className="w-4 h-4 shrink-0" />}
        
        <div className="flex-1 overflow-hidden relative h-4">
          {announcements.map((text: string, idx: number) => (
            <p 
              key={idx}
              className={`text-center w-full absolute inset-0 transition-all duration-500 transform ${
                idx === announcementIndex 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-4 opacity-0 pointer-events-none'
              }`}
            >
              {text}
            </p>
          ))}
        </div>
        
        {announcements.length > 1 ? (
          <ChevronRight 
            onClick={() => setAnnouncementIndex((prev) => (prev + 1) % announcements.length)} 
            className="w-4 h-4 cursor-pointer hover:text-gray-300 transition-colors shrink-0" 
          />
        ) : <div className="w-4 h-4 shrink-0" />}
      </div>

      <div className="max-w-full mx-auto px-6 sm:px-10 lg:px-12">
        {/* Main Header Row */}
        <div className="h-16 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex-1 flex items-center">
            <Link href="/" className="group inline-block">
              {settings?.logoUrl ? (
                <div className="h-11 relative">
                   <img 
                     src={settings.logoUrl} 
                     alt={settings.storeName || "Logo"} 
                     className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                   />
                </div>
              ) : (
                <div className="flex flex-col items-start">
                  <span className="text-xl font-light tracking-[0.15em] text-black transition-colors">
                    {settings?.storeName || "PEZWAAN"}
                  </span>
                  <span className="text-[7px] tracking-[0.25em] text-gray-500 uppercase mt-0.5">
                    Clothing Brand
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Center: Navigation Links (Desktop Only) */}
          <nav className="hidden lg:flex flex-[2] items-center justify-center gap-6">
            {categories.length > 0 ? (
              categories.map((cat, idx) => (
                <Link 
                  key={cat.id} 
                  href={`/category/${cat.slug}`} 
                  className={`text-[11px] font-bold uppercase tracking-wider transition-all hover:scale-110 active:scale-95 flex items-center gap-0.5 ${idx % 3 === 1 ? 'text-red-500 hover:text-red-600' : 'text-gray-600 hover:text-black'}`}
                >
                  {cat.name}
                </Link>
              ))
            ) : (
               <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">No Collections</span>
            )}
          </nav>

          {/* Right: Controls */}
          <div className="flex-1 flex items-center justify-end gap-1 sm:gap-2">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-700 hover:text-black transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-[#059669] transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#059669] text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full border-2 border-white px-0.5 shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Navigation (Shown only on small screens if we want to keep categories accessible) */}
        <nav className="lg:hidden flex items-center justify-center gap-4 overflow-x-auto no-scrollbar pb-3 pt-1">
          {categories.slice(0, 4).map((cat, idx) => (
            <Link 
              key={cat.id} 
              href={`/category/${cat.slug}`} 
              className="text-[10px] font-bold uppercase tracking-widest text-gray-600 whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
