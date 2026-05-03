import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { getStoreSettings } from "@/lib/settings"
import { getStoreProducts } from "@/lib/storefront-actions"
import CategoryFilter from "@/components/storefront/CategoryFilter"
import ProductGrid from "@/components/storefront/ProductGrid"
import { ShoppingBag, LayoutGrid } from "lucide-react"

export const revalidate = 60

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  
  const category = await prisma.category.findUnique({
    where: { slug }
  })

  if (!category) {
    notFound()
  }

  // Parse Filters
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : "newest"
  const min = typeof resolvedSearchParams.min === 'string' && resolvedSearchParams.min ? parseFloat(resolvedSearchParams.min) : undefined
  const max = typeof resolvedSearchParams.max === 'string' && resolvedSearchParams.max ? parseFloat(resolvedSearchParams.max) : undefined
  const inStock = resolvedSearchParams.inStock === "true"

  const products = await getStoreProducts({
    categoryId: category.id,
    sort,
    min,
    max,
    inStock
  })

  const settings = await getStoreSettings()

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-black selection:text-white">
      {/* Category Banner */}
      <div className="bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-10 pb-4 lg:pt-16 lg:pb-8 flex flex-col items-center text-center">
           {category.imageUrl && (
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden relative mb-6 shadow-sm">
                <Image src={category.imageUrl} alt={category.name} fill className="object-cover" unoptimized={true} />
              </div>
           )}
           <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em] mb-4">
              Curated Collection
           </p>
           <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
             {category.name}
           </h1>
           {category.description && (
             <p className="max-w-xl text-sm text-gray-500 leading-relaxed font-medium mx-auto">
               {category.description}
             </p>
           )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 pb-12 w-full flex-1 flex flex-col lg:flex-row gap-8 lg:gap-16">
         {/* Sidebar / Drawer Filters */}
         <aside className="w-full lg:w-[260px] shrink-0">
            <CategoryFilter />
         </aside>

         {/* Product Grid */}
         <main className="flex-1">
            <div className="flex items-center justify-between mb-2 pt-1 lg:pt-0">
               <div className="flex items-center gap-2">
                 <LayoutGrid className="w-4 h-4 text-gray-900" />
                 <span className="text-[11px] font-black tracking-[0.2em] uppercase text-gray-900">
                   Showing <span className="text-black">{products.length}</span> Products
                 </span>
               </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 flex flex-col items-center shadow-sm">
                <ShoppingBag className="w-12 h-12 text-gray-100 mb-6" />
                <h3 className="text-[14px] font-black text-gray-900 mb-2 uppercase tracking-[0.2em]">No Matches Found</h3>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-8 max-w-[240px] mx-auto leading-relaxed">
                  Try adjusting your price range or sorting options.
                </p>
                <Link href={`/category/${slug}`} className="text-[10px] font-black uppercase tracking-[0.3em] text-black border-2 border-black px-8 py-3 hover:bg-black hover:text-white transition-all rounded-xl">
                   Clear Filters
                </Link>
              </div>
            ) : (
              <ProductGrid products={products} hasSidebar={true} />
            )}
         </main>
      </div>
    </div>
  )
}
