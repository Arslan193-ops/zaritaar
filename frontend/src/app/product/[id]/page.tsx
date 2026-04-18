import Link from "next/link"
import Image from "next/image"
import { CdnImage } from "@/components/storefront/CdnImage"
import prisma from "@/lib/prisma"
import { AddToCartBtn } from "@/components/storefront/AddToCartBtn"
import ProductGallery from "@/components/storefront/ProductGallery"
import Header from "@/components/storefront/Header"
import { getStoreSettings } from "@/lib/settings"
import { Truck, ShoppingBag } from "lucide-react"
import { client, urlFor } from "@/lib/sanity"
import { notFound } from "next/navigation"
import Footer from "@/components/storefront/Footer"

export const dynamic = "force-dynamic"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const settings = await getStoreSettings()
  
  // Fetch from Sanity with GROQ
  const product = await client.fetch(`*[_type == "product" && (_id == $id || slug.current == $id)][0]`, { id })
  if (!product) return notFound()
  
  // Also fetch variants from Prisma (Database) using the Sanity ID
  const dbVariants = await prisma.productVariant.findMany({
    where: { productId: product._id }
  })
  
  // Merging them for the UI
  product.variants = dbVariants
  
  // Extract all dynamic options from variants with a robust fallback system
  const options: Record<string, string[]> = {}
  const systemKeys = ['id', 'productId', 'price', 'stock', 'sku', 'imageUrl', 'attributes', 'createdAt', 'updatedAt']

  product.variants?.forEach((v: any) => {
    // Priority 1: JSON attributes object (Most structured)
    if (v.attributes) {
      try {
        const attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes
        Object.entries(attrs).forEach(([key, value]) => {
          if (!options[key]) options[key] = []
          if (value && !options[key].includes(value as string)) {
            options[key].push(value as string)
          }
        })
      } catch (e) {
        console.error("Error parsing attributes for product:", product._id, e)
      }
    } 
    
    // Priority 2: Key-Agnostic Scan (Dynamic fallback for flat records)
    // This catches fields like 'size', 'color', 'Size', 'Color', etc., automatically
    Object.entries(v).forEach(([key, value]) => {
      // Ignore internal system keys and our primary 'attributes' object
      if (!systemKeys.includes(key) && value && typeof value === 'string') {
        // Normalize the label (e.g., 'size' -> 'Size')
        const label = key.charAt(0).toUpperCase() + key.slice(1)
        if (!options[label]) options[label] = []
        if (!options[label].includes(value)) {
          options[label].push(value)
        }
      }
    })
  })

  const sizeChartData = product.sizeChart ? JSON.parse(product.sizeChart) : null
  
  const relatedProducts = await client.fetch(
    `*[_type == "product" && category == $categoryId && _id != $id && status == "PUBLISHED"][0...4]`, 
    { categoryId: product.category, id: product._id }
  )

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex flex-col font-sans selection:bg-black selection:text-white">
      <Header />
      
      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-5 sm:py-8 md:py-16 w-full min-w-0 animate-in fade-in duration-1000 pb-10 sm:pb-8 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 md:gap-12 xl:gap-20 items-start w-full min-w-0">
          {/* Gallery Architecture - Vertical Thumbnails Style */}
          <ProductGallery images={product.images} title={product.title} />

          {/* Product Specifications & Purchase Buffer */}
          <div className="min-w-0 w-full lg:col-span-4 flex flex-col">
            <div className="space-y-6 md:space-y-8">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-[11px] font-black text-[#B8860B] uppercase tracking-[0.2em]">
                    {product.category?.name || product.category || "Collection"}
                  </p>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
                    SKU: {product.sku || (product._id || product.id).substring(0, 8).toUpperCase()}
                  </span>
                </div>
                
                <h1 className="text-xl md:text-5xl font-serif font-medium text-gray-900 leading-[1.15] tracking-tight">
                  {product.title}
                </h1>
                
                <div className="flex items-center gap-5 pt-1">
                   <div className="text-2xl md:text-3xl font-medium text-gray-900 leading-none tabular-nums">
                    Rs. {(product.basePrice || 0).toLocaleString()}
                   </div>
                   <div className="flex">
                    <span className="border border-emerald-500/30 bg-emerald-50/50 text-emerald-600 px-3 py-1 text-[9px] font-black uppercase tracking-[0.1em] flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" /> Free Shipping
                    </span>
                   </div>
                </div>

                {(product.stock > 0 && product.stock < 10) && (
                  <p className="text-[11px] font-bold text-[#E67E22] italic mt-2">
                    Only {product.stock} left in stock - order soon!
                  </p>
                )}
              </div>
              
              <div className="prose prose-sm max-w-none pt-2">
                <div className="text-xs md:text-sm text-gray-600 leading-relaxed tracking-wide break-words whitespace-pre-wrap font-medium">
                  {product.description}
                </div>
              </div>
            </div>

            <AddToCartBtn 
              product={product as any} 
              options={options} 
              whatsappNumber={settings?.whatsappNumber || ""} 
            />
              
            {/* Info Blocks - Fabric & Shipping */}
            <div className="grid grid-cols-2 gap-4 sm:gap-8 py-6 sm:py-8 border-t border-gray-100">
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

        {/* RELATED PRODUCTS - Complete the Look */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 sm:mt-24 md:mt-32 pt-12 sm:pt-16 md:pt-20 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-12">
               <div className="space-y-1">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Curation</p>
                 <h2 className="text-3xl font-serif text-gray-900">Complete the Look</h2>
               </div>
               <Link href="/" className="text-[10px] font-black uppercase tracking-widest border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-all">
                  View All Accessories
               </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {relatedProducts.map((item: any) => (
                 <Link key={item._id} href={`/product/${item.slug?.current || item._id}`} className="group space-y-4">
                    <div className="aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden relative">
                       {item.images?.[0] ? (
                       <CdnImage 
                         src={urlFor(item.images[0]).width(400).auto('format').quality(82).url()} 
                         alt={item.title} 
                         fill 
                         sizes="(max-width: 768px) 50vw, 25vw"
                         className="object-cover transition-transform duration-700 group-hover:scale-105"
                       />
                       ) : (
                       <Image src="/placeholder.svg" alt="" fill className="object-cover" />
                       )}
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

      <Footer storeName={settings?.storeName} />
    </div>
  )
}

