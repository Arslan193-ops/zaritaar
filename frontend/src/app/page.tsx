  import Link from "next/link"
import Image from "next/image"
import { CdnImage } from "@/components/storefront/CdnImage"
import prisma from "@/lib/prisma"
import Header from "@/components/storefront/Header"
import { getStoreSettings } from "@/lib/settings"
import HeroSlider from "@/components/storefront/HeroSlider"
import { ArrowRight, ShoppingBag } from "lucide-react"
import { client, urlFor } from "@/lib/sanity"
import { notFound } from "next/navigation"
import ProductGrid from "@/components/storefront/ProductGrid"
import Footer from "@/components/storefront/Footer"

export const dynamic = "force-dynamic"

export default async function Home() {
  const settings = await getStoreSettings()
  
  const categories = await client.fetch(`*[_type == "category"] | order(createdAt asc)`)
  const products = await client.fetch(`*[_type == "product"] | order(createdAt desc) [0...12]`)

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
            {settings?.desktopHeroImage ? (
            <CdnImage 
              src={settings.desktopHeroImage}
              alt="Hero Background"
              fill
              sizes="100vw"
              className="object-cover opacity-15 grayscale"
              priority
            />
            ) : (
            <Image 
              src="/placeholder.svg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-15 grayscale"
              priority
            />
            )}
          </div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
            <div className="inline-flex items-center gap-2 py-1 px-3 bg-black/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-8">
              New Arrival Protocol 2024
            </div>
            <h1 className="text-2xl md:text-8xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tighter">
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
      <section className="bg-[#fcfbf5] py-10 border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h2 className="text-center text-lg md:text-3xl font-black text-gray-900 mb-10 tracking-[0.2em] uppercase leading-relaxed">ALL COLLECTIONS</h2>
          
          {categories.length === 0 ? (
            <div className="text-center py-10">
               <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">No Collections Found.</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-3 lg:grid-cols-6 gap-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.map((cat: any, idx: number) => (
                <Link 
                  href={`/category/${cat.slug?.current || cat.slug}`} 
                  key={cat._id || cat.id} 
                  className="group block space-y-3 flex-shrink-0 w-[45%] md:w-auto"
                >
                  <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden relative shadow-sm transition-all duration-300 group-hover:shadow-md">
                      {cat.image ? (
                        <CdnImage 
                          src={urlFor(cat.image).width(400).auto('format').quality(82).url()} 
                          alt={cat.name}
                          fill
                          sizes="(max-width: 768px) 45vw, 20vw"
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
      <main id="featured" className="flex-1 max-w-[1400px] mx-auto px-6 py-12 w-full">
        <div className="flex items-center justify-between mb-10 gap-4">
          <div className="space-y-1">
            <h2 className="text-lg md:text-2xl font-black tracking-tight text-gray-900 uppercase">All Products</h2>
            <div className="h-1 w-10 bg-black rounded-full" />
          </div>
          <Link href="/shop" className="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-[0.2em] transition-all flex items-center gap-1 shrink-0 border-b border-gray-100 pb-1">
            Grid View <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <ProductGrid products={products} />
      </main>
      
      <Footer storeName={settings?.storeName} />
    </div>
  )
}

