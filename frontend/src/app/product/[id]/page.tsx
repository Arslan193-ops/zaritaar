import Link from "next/link"
import Image from "next/image"
import { CdnImage } from "@/components/storefront/CdnImage"
import prisma from "@/lib/prisma"
import { AddToCartBtn } from "@/components/storefront/AddToCartBtn"
import ProductGallery from "@/components/storefront/ProductGallery"
import Header from "@/components/storefront/Header"
import { getStoreSettings } from "@/lib/settings"
import { Truck, ChevronDown, MoveRight } from "lucide-react"
import { client, urlFor } from "@/lib/sanity"
import { notFound } from "next/navigation"
import Footer from "@/components/storefront/Footer"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const settings = await getStoreSettings()
  
  const product = await client.fetch(`*[_type == "product" && (_id == $id || slug.current == $id)][0]{
    ...,
    "category": category->{name, _id},
    images[]{
      ...,
      "ratio": asset->metadata.dimensions.aspectRatio
    }
  }`, { id })
  if (!product) return notFound()
  
  const dbVariants = await prisma.productVariant.findMany({
    where: { productId: product._id }
  })
  
  product.variants = dbVariants
  
  const options: Record<string, string[]> = {}
  const systemKeys = ['id', 'productId', 'price', 'stock', 'sku', 'imageUrl', 'attributes', 'createdAt', 'updatedAt']

  product.variants?.forEach((v: any) => {
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
        console.error("Error parsing attributes", e)
      }
    } 
  })

  const relatedProducts = await client.fetch(
    `*[_type == "product" && category._ref == $categoryId && _id != $id][0...4]{
      _id,
      title,
      slug,
      basePrice,
      images,
      "category": category->{name}
    }`, 
    { 
      categoryId: product.category?._id || "", 
      id: product._id 
    }
  )

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-black selection:text-white overflow-x-hidden">
      <Header />
      
      <main className="flex-1 max-w-[1400px] mx-auto px-6 sm:px-10 py-10 md:py-20 w-full min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start w-full min-w-0">
          {/* Gallery Architecture */}
          <div className="lg:col-span-8">
            <ProductGallery images={product.images} title={product.title} />
          </div>

          {/* Product Specifications & Purchase Buffer */}
          <div className="lg:col-span-4 flex flex-col pt-4">
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">
                  {product.category?.name || "The Heritage Series"} — Volume 04
                </p>
                <h1 className="text-3xl md:text-6xl font-serif text-gray-900 leading-tight">
                  {product.title}
                </h1>
                <p className="text-[15px] font-serif italic text-gray-600 pt-2">
                  PKR {product.basePrice.toLocaleString()}
                </p>
              </div>
              
              <AddToCartBtn 
                product={product as any} 
                options={options} 
                whatsappNumber={settings?.whatsappNumber || ""} 
              />

              <div className="pt-10 space-y-4">
                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em]">Stitching & Design Details</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-xs md:text-[13px] text-gray-400 leading-relaxed font-medium break-words whitespace-pre-wrap">
                    {product.description || "A study in understated luxury. This stitched suit features hand-woven craftsmanship meticulously designed for the modern woman who values the soul of heritage."}
                  </p>
                </div>
              </div>

              {/* Dynamic Information Accordions */}
              <div className="pt-8 border-t border-gray-100 space-y-1">
                <details className="group border-b border-gray-50 pb-4" open>
                   <summary className="flex items-center justify-between list-none cursor-pointer uppercase text-[10px] font-black tracking-[0.2em] text-gray-900 py-2">
                      Artistry & Fabric
                      <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                   </summary>
                   <div className="pt-2">
                      <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                        {product.artistry || "Each piece is crafted over 48 hours by our master artisans. Features hand-embroidered Zari work on pure raw silk. Includes a hand-painted organza dupatta with scalloped edges."}
                      </p>
                   </div>
                </details>

                <details className="group border-b border-gray-50 pb-4">
                   <summary className="flex items-center justify-between list-none cursor-pointer uppercase text-[10px] font-black tracking-[0.2em] text-gray-900 py-2">
                      Shipping & Returns
                      <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                   </summary>
                   <div className="pt-2">
                      <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                        {product.shippingInfo || "Complimentary worldwide shipping on orders above PKR 50,000. Standard delivery takes 7-10 business days. Items can be returned within 14 days of receipt."}
                      </p>
                   </div>
                </details>
              </div>
            </div>
          </div>
        </div>

        {/* THE HERITAGE GALLERY (Related Products) */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 pt-20 border-t border-gray-100">
             <div className="text-center mb-16 space-y-3">
               <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Curated for you</p>
               <h2 className="text-3xl md:text-5xl font-serif text-gray-900">The Heritage Gallery</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {relatedProducts.map((item: any) => (
                  <Link key={item._id} href={`/product/${item.slug?.current || item._id}`} className="group block p-2 bg-white border border-gray-100 rounded-2xl transition-all duration-500 hover:shadow-xl hover:border-gray-200">
                     <div className="aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden relative border border-gray-50 transition-all duration-500 group-hover:scale-[1.02]">
                        {item.images?.[0] ? (
                        <CdnImage 
                          src={urlFor(item.images[0]).width(600).auto('format').quality(82).url()} 
                          alt={item.title} 
                          fill 
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        ) : (
                        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                        )}
                        <div className="absolute top-2 left-2">
                           <span className="bg-black/90 backdrop-blur-sm text-white px-2 py-0.5 text-[8px] font-bold tracking-wider uppercase rounded-sm shadow-sm">
                             {item.category?.name || "Pret"}
                           </span>
                        </div>
                     </div>
                     <div className="text-center mt-4 space-y-1">
                        <h3 className="text-[11px] sm:text-[13px] font-black uppercase tracking-tight text-gray-900 group-hover:text-emerald-700 transition-colors truncate px-2">{item.title}</h3>
                        <p className="text-[11px] sm:text-xs text-gray-400 font-bold tracking-widest">Rs. {(item.basePrice || 0).toLocaleString()}</p>
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

