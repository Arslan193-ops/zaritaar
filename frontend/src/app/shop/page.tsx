import Header from "@/components/storefront/Header"
import { getStoreSettings } from "@/lib/settings"
import { getStoreProducts } from "@/lib/storefront-actions"
import CategoryFilter from "@/components/storefront/CategoryFilter"
import ProductGrid from "@/components/storefront/ProductGrid"
import { ShoppingBag, LayoutGrid } from "lucide-react"
import Footer from "@/components/storefront/Footer"
import Link from "next/link"

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  
  // Parse Filters
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : "newest"
  const min = typeof resolvedSearchParams.min === 'string' && resolvedSearchParams.min ? parseFloat(resolvedSearchParams.min) : undefined
  const max = typeof resolvedSearchParams.max === 'string' && resolvedSearchParams.max ? parseFloat(resolvedSearchParams.max) : undefined
  const inStock = resolvedSearchParams.inStock === "true"

  const products = await getStoreProducts({
    sort,
    min,
    max,
    inStock
  })

  const settings = await getStoreSettings()

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex flex-col font-sans selection:bg-black selection:text-white">
      <Header settings={settings} />

      {/* Global Shop Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 lg:py-20 flex flex-col items-center text-center">
           <div className="inline-flex items-center gap-2 py-1 px-3 bg-black/5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 font-mono">
              Official Catalog v1.0
           </div>
           <h1 className="text-2xl md:text-7xl font-serif font-black text-gray-900 tracking-tighter mb-4 italic leading-tight">
             All Products
           </h1>
           <p className="max-w-xl text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400 leading-relaxed">
             Meticulously engineered garments for the modern технический. <br/> 
             Full collection deployment.
           </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 w-full flex-1 flex flex-col lg:flex-row gap-8 lg:gap-16">
         {/* Sidebar / Drawer Filters */}
         <aside className="w-full lg:w-[260px] shrink-0">
            <CategoryFilter />
         </aside>

         {/* Product Grid */}
         <main className="flex-1">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 pt-1 lg:pt-0">
               <div className="flex items-center gap-2">
                 <LayoutGrid className="w-4 h-4 text-gray-900" />
                 <span className="text-[11px] font-black tracking-[0.2em] uppercase text-gray-900">
                   Showing <span className="underline decoration-2 underline-offset-4">{products.length}</span> Masterpieces
                 </span>
               </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 flex flex-col items-center shadow-sm">
                <ShoppingBag className="w-12 h-12 text-gray-100 mb-6" />
                <h3 className="text-[14px] font-black text-gray-900 mb-2 uppercase tracking-[0.2em]">No Matches Found</h3>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-8 max-w-[240px] mx-auto leading-relaxed">
                  The current parameters yielded zero results in the registry.
                </p>
                <Link href="/shop" className="text-[10px] font-black uppercase tracking-[0.3em] text-black border-2 border-black px-8 py-3 hover:bg-black hover:text-white transition-all rounded-xl">
                   Reset Registry
                </Link>
              </div>
            ) : (
              <ProductGrid products={products} />
            )}
         </main>
      </div>
      <Footer storeName={settings?.storeName} />
    </div>
  )
}
