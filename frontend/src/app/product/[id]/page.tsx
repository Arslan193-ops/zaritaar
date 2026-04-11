import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { AddToCartBtn } from "@/components/storefront/AddToCartBtn"
import Header from "@/components/storefront/Header"
import { getStoreSettings } from "@/lib/settings"
import Image from "next/image"
import { Star, Truck, ShieldCheck, ArrowLeft, Share2, Heart, ShoppingBag, Table as TableIcon, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const settings = await getStoreSettings()
  
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true, category: true, images: { orderBy: { order: "asc" } } }
  })

  if (!product) return notFound()
  
  // Extract all dynamic options from variants
  const options: Record<string, string[]> = {}
  
  product.variants.forEach((v: any) => {
    if (v.attributes) {
      const attrs = JSON.parse(v.attributes)
      Object.entries(attrs).forEach(([key, value]) => {
        if (!options[key]) options[key] = []
        if (value && !options[key].includes(value as string)) {
          options[key].push(value as string)
        }
      })
    }
  })

  const sizeChartData = product.sizeChart ? JSON.parse(product.sizeChart) : null
  
  const relatedProducts = await prisma.product.findMany({
    where: { 
      categoryId: product.categoryId,
      id: { not: product.id },
      status: "PUBLISHED"
    },
    take: 4,
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex flex-col font-sans selection:bg-black selection:text-white">
      <Header />
      
      <main className="flex-1 max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-12 md:py-16 w-full animate-in fade-in duration-1000">
        <div className="grid lg:grid-cols-12 gap-12 xl:gap-20 items-start">
          {/* Gallery Architecture - Vertical Thumbnails Style */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-6">
            {/* Gallery Thumbnails - Vertical */}
            {product.images.length > 1 && (
              <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible no-scrollbar md:w-20 shrink-0">
                {product.images.map((img, i) => (
                  <div key={img.id} className="aspect-[3/4] w-20 bg-gray-50 rounded-lg overflow-hidden cursor-pointer group relative border border-gray-100">
                    <img 
                      src={img.url} 
                      alt={`${product.title} view ${i+1}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex-1 aspect-[3/4] sm:aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden relative group max-h-[600px] lg:max-h-[75vh] w-full">
              <Image 
                src={product.imageUrl || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop'} 
                alt={product.title}
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>

          {/* Product Specifications & Purchase Buffer */}
          <div className="lg:col-span-5 flex flex-col space-y-8">
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Exclusively Handcrafted</p>
                <h1 className="text-4xl md:text-5xl font-serif text-gray-900 leading-[1.2]">
                  {product.title}
                </h1>
                
                <div className="flex items-center gap-4 mt-4">
                   <div className="text-2xl font-medium text-gray-900">
                    Rs. {product.basePrice.toLocaleString()}
                   </div>
                   <span className="bg-green-50 text-green-600 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-green-100">
                      <Truck className="w-3 h-3" /> Free Shipping
                   </span>
                </div>

                {(product.stock > 0 && product.stock < 10) && (
                  <p className="text-xs font-bold text-orange-600 mt-4 italic">
                    Only {product.stock} left in stock - order soon!
                  </p>
                )}
              </div>
              
              <div className="prose prose-sm max-w-none pt-4">
                <p className="text-sm text-gray-600 leading-relaxed tracking-wide">
                  {product.description}
                </p>
              </div>
            </div>

            <div className="space-y-8 pt-4">
              <AddToCartBtn 
                product={product as any} 
                options={options} 
                whatsappNumber={settings?.whatsappNumber || ""} 
              />
              
              {/* Info Blocks - Fabric & Shipping */}
              <div className="grid grid-cols-2 gap-8 py-8 border-t border-gray-100">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Fabric & Care</h4>
                  <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                    Main: 100% Pure Raw Silk<br/>
                    Dupatta: Silk Organza<br/>
                    Dry Clean Only
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Shipping Info</h4>
                  <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                    Dispatched in 7-10 business days.<br/>
                    Free worldwide shipping on orders above Rs. 50,000.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS - Complete the Look */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 pt-20 border-t border-gray-100">
            <div className="flex items-end justify-between mb-12">
               <div className="space-y-1">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Curation</p>
                 <h2 className="text-3xl font-serif text-gray-900">Complete the Look</h2>
               </div>
               <Link href="/" className="text-[10px] font-black uppercase tracking-widest border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-all">
                  View All Accessories
               </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {relatedProducts.map(item => (
                 <Link key={item.id} href={`/product/${item.id}`} className="group space-y-4">
                    <div className="aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden relative">
                       <Image 
                         src={item.imageUrl || ""} 
                         alt={item.title} 
                         fill 
                         className="object-cover transition-transform duration-700 group-hover:scale-105"
                       />
                    </div>
                    <div>
                       <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{item.title}</h3>
                       <p className="text-xs text-gray-500 font-medium">Rs. {item.basePrice.toLocaleString()}</p>
                    </div>
                 </Link>
               ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer - Keep it but ensuring it doesn't break the new style */}
      <footer className="bg-white border-t border-gray-100 py-24 pb-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black flex items-center justify-center rounded-xl">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-gray-900 uppercase">{settings?.storeName || "My Store"}</span>
              </Link>
              <p className="text-sm font-medium text-gray-400 leading-relaxed max-w-xs uppercase tracking-widest text-[10px]">
                Excellence in handcrafted fashion. Designed for the technical curator.
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Store Navigation</h4>
              <nav className="flex flex-col gap-4">
                <Link href="/" className="text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">New Arrivals</Link>
                <Link href="/admin/products" className="text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">Collections</Link>
                <Link href="/cart" className="text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">Shopping Bag</Link>
              </nav>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Protocols</h4>
              <nav className="flex flex-col gap-4">
                <Link href="/" className="text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">Shipping Logic</Link>
                <Link href="/" className="text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">Returns Policy</Link>
                <Link href="/" className="text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">Privacy Protocol</Link>
              </nav>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Contact Dispatch</h4>
              <p className="text-xs font-medium text-gray-400 leading-relaxed uppercase tracking-widest text-[10px]">
                Global operations handled from our central design laboratory.
              </p>
              <div className="flex items-center gap-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                 <span className="text-[9px] font-bold text-gray-900 uppercase tracking-[0.2em] leading-none">Operations Live</span>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
              &copy; {new Date().getFullYear()} {settings?.storeName?.toUpperCase() || "MY STORE"}. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

