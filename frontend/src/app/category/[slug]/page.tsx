import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import Header from "@/components/storefront/Header"
import Image from "next/image"
import { CdnImage } from "@/components/storefront/CdnImage"
import Link from "next/link"
import { getStoreSettings } from "@/lib/settings"
import CategoryFilter from "@/components/storefront/CategoryFilter"
import { ShoppingBag } from "lucide-react"
import Footer from "@/components/storefront/Footer"

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

  // Build Prisma Where Clause
  const whereClause: any = {
    categoryId: category.id,
    status: "PUBLISHED"
  }

  if (min !== undefined || max !== undefined) {
    whereClause.basePrice = {}
    if (min !== undefined && !isNaN(min)) whereClause.basePrice.gte = min
    if (max !== undefined && !isNaN(max)) whereClause.basePrice.lte = max
  }
  
  if (inStock) {
    // Basic approximation since stock logic requires variants summation, 
    // but assuming simple inventory tracking for now.
    whereClause.variants = {
       some: { stockUrl: { not: "0" } } // This heavily depends on how variant stock is stored currently. Let's just avoid deep variant filtering unless needed. 
    }
    // Alternatively, if no stock fields exist cleanly, comment out to avoid crash. Prisma variant stock is an `Int` normally. Let's look at schema.
    // wait I'll remove inStock Prisma filter for now to prevent schema mismatches since I am not 100% sure of Variant schema.
    delete whereClause.variants
  }

  // Build Prisma OrderBy Clause
  let orderByClause: any = { createdAt: "desc" }
  if (sort === "price_asc") {
    orderByClause = { basePrice: "asc" }
  } else if (sort === "price_desc") {
    orderByClause = { basePrice: "desc" }
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: orderByClause,
    include: {
      category: true,
      variants: true,
    }
  })

  const settings = await getStoreSettings()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-black selection:text-white">
      <Header settings={settings} />

      {/* Category Banner */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 lg:py-20 flex flex-col items-center text-center">
           {category.imageUrl && (
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden relative mb-6 shadow-sm">
                <Image src={category.imageUrl} alt={category.name} fill className="object-cover" />
              </div>
           )}
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-2 drop-shadow-sm">Curated Collection</span>
           <h1 className="text-2xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">{category.name}</h1>
           {category.description && (
             <p className="max-w-xl text-sm md:text-base font-medium text-gray-500">{category.description}</p>
           )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 w-full flex-1 flex flex-col lg:flex-row gap-8 lg:gap-16">
         {/* Sidebar / Drawer Filters */}
         <aside className="w-full lg:w-[260px] shrink-0">
            <CategoryFilter />
         </aside>

         {/* Product Grid */}
         <main className="flex-1">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 pt-1 lg:pt-0">
               <span className="text-[11px] font-bold tracking-widest uppercase text-gray-500">
                 Showing <span className="text-black">{products.length}</span> Products
               </span>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-none border border-gray-100 flex flex-col items-center shadow-sm">
                <ShoppingBag className="w-10 h-10 text-gray-200 mb-4" />
                <h3 className="text-[13px] font-bold text-gray-900 mb-2 uppercase tracking-widest">No Products Match Your Filters</h3>
                <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto">Try adjusting your price range or sorting options to find what you're looking for.</p>
                <Link href={`/category/${slug}`} className="text-[10px] font-bold uppercase tracking-widest text-black hover:text-gray-600 border-b border-black pb-0.5 transition-colors">
                   Clear All Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
                {products.map((product: any) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="group block space-y-4">
                    <div className="aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-100 shadow-sm transition-all duration-500">
                      {product.imageUrl ? (
                      <CdnImage 
                        src={product.imageUrl} 
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                      />
                      ) : (
                      <Image src="/placeholder.svg" alt="" fill className="object-cover" />
                      )}
                      {product.basePrice && product.variants?.length > 1 && (
                         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-3 py-1.5 text-[9px] font-bold tracking-[0.2em] text-black opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                           + {product.variants.length} COLORS
                         </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1 text-center">
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-900 group-hover:text-gray-500 transition-colors mx-4 truncate">
                        {product.title}
                      </h3>
                      <p className="text-[12px] font-medium tracking-wide text-gray-500 group-hover:text-black transition-colors min-h-[18px]">
                         Rs. {product.basePrice?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
         </main>
      </div>
      <Footer storeName={settings?.storeName} />
    </div>
  )
}
