import Link from "next/link"
import Image from "next/image"
import prisma from "@/lib/prisma"
import Header from "@/components/storefront/Header"
import { getStoreSettings } from "@/lib/settings"
import HeroSlider from "@/components/storefront/HeroSlider"
import { ArrowRight, Star, Truck, ShieldCheck, Clock, ShoppingBag } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function Home() {
  const settings = await getStoreSettings()
  
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" }
  })

  // Fetch all published products
  const products = await prisma.product.findMany({
    // @ts-ignore - Prisma type sync issue
    where: { status: "PUBLISHED" } as any,
    include: {
      variants: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
    take: 12
  })

  // Parse slider images
  const sliderImages = JSON.parse(settings?.heroSliderImages || "[]")

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-black selection:text-white">
      {/* Main Navigation */}
      <Header settings={settings} />

      {/* Dynamic Hero Slider Selection */}
      {sliderImages.length > 0 ? (
        <HeroSlider 
          images={sliderImages} 
          headline={settings?.heroHeadline ?? undefined}
          subtext={settings?.heroHeadline ?? undefined} 
          buttonText={settings?.heroButtonText ?? undefined}
          buttonLink={settings?.heroButtonLink ?? undefined}
          showHeadline={settings?.showHeroHeadline}
          showButton={settings?.showHeroButton}
        />
      ) : (
        /* Fallback Static Hero if no slider images are set */
        <section className="relative h-[80vh] flex items-center bg-[#fafafa] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src={settings?.desktopHeroImage ?? "https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?q=80&w=2000&auto=format&fit=crop"}
              alt="Hero Background"
              fill
              className="object-cover opacity-15 grayscale"
              priority
            />
          </div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
            <div className="inline-flex items-center gap-2 py-1 px-3 bg-black/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-8">
              New Arrival Protocol 2024
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tighter">
              {settings?.heroHeadline || "THE NEW STANDARD"} <br />
              <span className="text-gray-400">IN MODERN LUXURY.</span>
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="#featured" className="bg-gray-900 text-white hover:bg-black px-10 py-4 font-bold text-sm uppercase tracking-widest transition-all rounded-lg shadow-lg shadow-gray-200">
                {settings?.heroButtonText || "Shop Collections"}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Trust Signals removed temporarily per user request */}

      {/* ALL COLLECTIONS SECTION */}
      <section className="bg-[#fcfbf5] py-14 border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h2 className="text-center text-3xl font-black text-gray-900 mb-10 tracking-tight">ALL COLLECTIONS</h2>
          
          {categories.length === 0 ? (
            <div className="text-center py-10">
               <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">No Collections Found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat, idx) => (
                <Link href={`/category/${cat.slug}`} key={cat.id} className="group block space-y-3">
                  <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden shadow-sm transition-all duration-300 group-hover:shadow-md">
                     {cat.imageUrl ? (
                        <Image 
                          src={cat.imageUrl} 
                          alt={cat.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                     ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-3 group-hover:bg-gray-200 transition-colors">
                           <ShoppingBag className="w-8 h-8 opacity-50" />
                           <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 px-4 text-center">Image Pending</span>
                        </div>
                     )}
                  </div>
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <h3 className={`text-[12px] font-bold text-center transition-colors
                      ${idx % 4 === 1 ? 'text-[#ff4e50] group-hover:text-red-600' : 'text-gray-800 group-hover:text-black'}
                    `}>
                      {cat.name}
                    </h3>
                    {idx % 4 === 2 ? (
                      <span className="bg-[#ffaa9b] text-white text-[8px] px-2 py-0.5 rounded ml-1 font-bold tracking-wider">SS'2026</span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Collection Registry -> All Products */}
      <main id="featured" className="flex-1 max-w-[1400px] mx-auto px-6 py-24 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 pt-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-gray-800">All Products</h2>
          </div>
          <Link href="/admin/products" className="text-xs font-bold text-gray-400 hover:text-black uppercase tracking-widest transition-colors flex items-center gap-2">
            View All Register <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mb-6" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Products Currently Listed</h3>
            <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">Our current inventory is being updated. Please check back shortly for our new arrivals.</p>
            <Link href="/admin/products/new" className="bg-gray-900 text-white px-8 py-3 text-sm font-bold uppercase tracking-widest rounded-lg transition-all hover:bg-black">
              Initialize Inventory
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product: any) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group block space-y-4">
                <div className="aspect-[4/5] bg-gray-50 overflow-hidden relative shadow-sm transition-all duration-500 group-hover:shadow-md group-hover:-translate-y-1">
                  <Image 
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop'} 
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-black text-white px-3 py-1 text-[10px] font-bold tracking-wider uppercase shadow-sm">
                      {product.category?.name || 'Limited'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 px-1">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-black transition-colors">{product.title}</h3>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium text-gray-500 group-hover:text-gray-900 transition-all">
                    <span>Registry ID: {product.id.substring(0, 8)}</span>
                    <span className="text-sm font-black text-gray-900">${product.basePrice.toFixed(2)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      
      {/* Professional Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-24 pb-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 flex items-center justify-center rounded-xl">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-gray-900 uppercase">Next Store</span>
              </Link>
              <p className="text-sm font-medium text-gray-400 leading-relaxed max-w-xs">
                Premium modern essentials for the technical curator. Quality, design, and precision in every piece.
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Navigation</h4>
              <nav className="flex flex-col gap-4">
                <Link href="/" className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors">Home Archive</Link>
                <Link href="/admin/products" className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors">Admin Portal</Link>
                <Link href="/cart" className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors">Shopping Cart</Link>
              </nav>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Integrity</h4>
              <nav className="flex flex-col gap-4">
                <Link href="/" className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors">Privacy Protocol</Link>
                <Link href="/" className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors">Terms of Service</Link>
                <Link href="/" className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors">Refund Logic</Link>
              </nav>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Connect</h4>
              <p className="text-sm font-medium text-gray-400 leading-relaxed">
                Stay updated with our latest protocols and seasonal releases.
              </p>
              <div className="flex items-center gap-4">
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                 <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest leading-none">Status: Operations Online</span>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} NEXT STORE. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-8">
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] italic">Engineered for Excellence</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

