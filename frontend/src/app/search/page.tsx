import Header from "@/components/storefront/Header"
import Image from "next/image"
import { CdnImage } from "@/components/storefront/CdnImage"
import Link from "next/link"
import { getStoreSettings } from "@/lib/settings"
import { searchStoreProducts } from "@/lib/storefront-actions"
import { ShoppingBag, Search as SearchIcon } from "lucide-react"
import Footer from "@/components/storefront/Footer"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const query = resolvedSearchParams.q || ""
  
  const products = await searchStoreProducts(query)
  const settings = await getStoreSettings()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-black selection:text-white">
      <Header settings={settings} />

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 lg:py-16 flex flex-col items-center text-center">
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-2 drop-shadow-sm">Search Results</span>
           <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2 italic">
             {query ? `"${query}"` : "All Products"}
           </h1>
           <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400">
             Found <span className="text-black">{products.length}</span> Results
           </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 w-full flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-none border border-gray-100 flex flex-col items-center shadow-sm">
              <SearchIcon className="w-10 h-10 text-gray-200 mb-4" />
              <h3 className="text-[13px] font-bold text-gray-900 mb-2 uppercase tracking-widest">No Results Found</h3>
              <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto">We couldn't find anything matching your search. Try different keywords or browse our categories.</p>
              <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-black hover:text-gray-600 border-b border-black pb-0.5 transition-colors">
                 Back to Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
              {products.map((product: any) => (
                <Link key={product.id} href={`/product/${product.id}`} className="group block space-y-4">
                  <div className="aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-100 shadow-sm transition-all duration-500">
                    {product.imageUrl ? (
                    <CdnImage 
                      src={product.imageUrl} 
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                    />
                    ) : (
                    <Image src="/placeholder.svg" alt="" fill className="object-cover" />
                    )}
                    {product.variants?.length > 1 && (
                       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-3 py-1.5 text-[9px] font-bold tracking-[0.2em] text-black opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                         + {product.variants.length} COLORS
                       </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1 text-center">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-900 group-hover:text-gray-500 transition-colors mx-4 truncate">
                      {product.title}
                    </h3>
                    <p className="text-[12px] font-medium tracking-wide text-gray-500 group-hover:text-black transition-colors">
                       Rs. {product.basePrice?.toLocaleString() || '0'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
      </div>
      <Footer storeName={settings?.storeName} />
    </div>
  )
}
