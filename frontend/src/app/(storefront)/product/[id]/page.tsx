import Link from "next/link"
import { CdnImage } from "@/components/storefront/CdnImage"
import { AddToCartBtn } from "@/components/storefront/AddToCartBtn"
import ProductGallery from "@/components/storefront/ProductGallery"
import { getStoreSettings } from "@/lib/settings"
import { Truck, ChevronDown, MoveRight } from "lucide-react"
import { getDetailedProduct } from "@/lib/storefront-actions"
import { notFound } from "next/navigation"
import { cn } from "@/lib/utils"
import ProductCard from "@/components/storefront/ProductCard"
export const revalidate = 60

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const settings = await getStoreSettings()
  
  const product = await getDetailedProduct(id)
  if (!product) return notFound()
  
  const options: Record<string, string[]> = {}

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

  const relatedProducts = product.relatedProducts || []

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-black selection:text-white overflow-x-hidden">
      <main className="flex-1 max-w-[1300px] mx-auto px-4 sm:px-8 py-8 md:py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          <div className="w-full">
            <ProductGallery images={product.images} title={product.title} />
          </div>


          <div className="flex flex-col space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">
                  {product.categoryName || "ZARITAAR OFFICIAL"}
                </p>
                {product.sku && (
                  <p className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest">
                    SKU: {product.sku}
                  </p>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 leading-tight">
                {product.title}
              </h1>

              <div className="flex items-center gap-4">
                <p className="text-2xl font-serif text-gray-900">
                  Rs. {product.basePrice.toLocaleString()}
                </p>
                {product.freeShipping && (
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded border border-emerald-100">
                    Free Shipping
                  </span>
                )}
              </div>
            </div>
            
            <AddToCartBtn 
              product={product as any} 
              options={options} 
              whatsappNumber={settings?.whatsappNumber || "923000000000"} 
            />


            <div className="pt-8 border-t border-gray-100 space-y-6">
              <div>
                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-3">Product Description</h3>
                <p className="text-base text-gray-500 leading-relaxed font-medium">
                  {product.description || "A study in understated luxury. This ZARITAAR piece features hand-woven craftsmanship meticulously designed for the modern woman who values the soul of heritage."}
                </p>
              </div>

              <div className="space-y-4">
                <details className="group border-b border-gray-50 pb-4" open>
                  <summary className="flex items-center justify-between list-none cursor-pointer uppercase text-[10px] font-black tracking-[0.2em] text-gray-900 py-2">
                    Artistry & Fabric
                    <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="pt-2 text-[11px] text-gray-400 font-medium leading-relaxed">
                    {product.artistry || "Each ZARITAAR piece is crafted by our master artisans. Features hand-embroidered work on premium textiles."}
                  </p>
                </details>

                <details className="group border-b border-gray-50 pb-4">
                  <summary className="flex items-center justify-between list-none cursor-pointer uppercase text-[10px] font-black tracking-[0.2em] text-gray-900 py-2">
                    Shipping & Delivery
                    <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="pt-2 text-[11px] text-gray-400 font-medium leading-relaxed">
                    {product.shippingInfo || "Standard delivery takes 5-7 business days within Pakistan. International orders may take 10-14 days."}
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>


        {relatedProducts.length > 0 && (
          <div className="mt-12">
             <div className="text-center mb-16 space-y-3">
               <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">Explore</p>
               <h2 className="text-3xl md:text-5xl font-serif text-gray-900">You May Also Like</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-8">
                {relatedProducts.map((item) => (
                  <ProductCard key={item.id} product={item} view="2" />
                ))}
            </div>

            <div className="mt-16 flex justify-center">
              <Link 
                href={product.categorySlug ? `/category/${product.categorySlug}` : (product.categoryId ? `/category/${product.categoryName}` : "/shop")} 
                className="inline-flex items-center justify-center border border-gray-200 text-gray-900 font-black text-[10px] uppercase tracking-[0.2em] px-8 py-4 transition-all hover:bg-black hover:text-white hover:border-black rounded-lg"
              >
                View All
              </Link>
            </div>
          </div>
        )}
      </main>

    </div>
  )
}

