import Link from "next/link"
import Image from "next/image"
import { CdnImage } from "@/components/storefront/CdnImage"
import { getStoreSettings } from "@/lib/settings"
import HeroSlider from "@/components/storefront/HeroSlider"
import { ArrowRight, ShoppingBag } from "lucide-react"
import { getStoreCategories, getStoreProducts } from "@/lib/storefront-actions"
import { notFound } from "next/navigation"
import ProductGrid from "@/components/storefront/ProductGrid"

export const revalidate = 60

export default async function Home() {
  const [settings, categories, products] = await Promise.all([
    getStoreSettings() as any,
    getStoreCategories(),
    getStoreProducts()
  ])

  // Parse slider images
  const sliderImages = JSON.parse(settings?.heroSliderImages || "[]")

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-black selection:text-white">
      {/* Dynamic Hero Slider Selection */}

      {/* Dynamic Hero Slider Selection */}
      {sliderImages.length > 0 ? (
        <HeroSlider 
          images={sliderImages} 
          headline={settings?.heroHeadline ?? undefined}
          subtext={settings?.heroHeadline ?? undefined} 
          buttonText={settings?.heroButtonText ?? undefined}
          buttonLink={settings?.heroButtonLink ?? undefined}
          badgeText={settings?.heroBadge ?? undefined}
          showHeadline={settings?.showHeroHeadline}
          showButton={settings?.showHeroButton}
          quality={75}
        />
      ) : (
        /* Fallback Static Hero if no slider images are set */
        <section className="relative h-[80vh] flex items-center bg-[#fafafa] overflow-hidden">
          <div className="absolute inset-0 z-0">
            {settings?.desktopHeroImage ? (
            <CdnImage 
              source={settings.desktopHeroImage}
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
              unoptimized={true}
            />
            )}
          </div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
            <div className="inline-flex items-center gap-2 py-1 px-3 bg-black/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-8">
              New Arrival Protocol 2024
            </div>
            <h1 className="text-2xl md:text-8xl font-bold text-gray-900 leading-[1.1] mb-8 tracking-tighter">
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
      <section className="bg-[#f7f4e9] pt-4 pb-2 md:py-10 border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h2 className="text-center text-lg md:text-3xl font-bold text-gray-900 mb-6 md:mb-10 tracking-[0.2em] uppercase leading-relaxed">ALL COLLECTIONS</h2>
          
          {categories.length === 0 ? (
            <div className="text-center py-10">
               <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">No Collections Found.</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.map((cat: any, idx: number) => (
                <Link 
                  href={`/category/${cat.slug?.current || cat.slug}`} 
                  key={cat._id || cat.id} 
                  prefetch={false}
                  className="group block space-y-2 md:space-y-3 flex-shrink-0 w-[48%] md:w-auto"
                >
                  <div className="aspect-[3/5] bg-gray-50 rounded-xl md:rounded-2xl overflow-hidden relative shadow-sm transition-all duration-300 group-hover:shadow-md border border-[#D4AF37]/10">
                      {cat.image ? (
                        <CdnImage 
                          source={cat.image} 
                          alt={cat.name}
                          fill
                          cdnWidth={600}
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                     ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-200 gap-3 group-hover:bg-gray-100 transition-colors">
                           <div className="w-10 h-10 border border-[#D4AF37]/20 rounded-full flex items-center justify-center">
                              <ShoppingBag className="w-4 h-4 opacity-30 text-[#D4AF37]" />
                           </div>
                           <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 px-4 text-center">Awaiting Visuals</span>
                        </div>
                     )}
                  </div>
                  <div className="flex flex-col items-center gap-1 pt-3">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-gray-900 group-hover:text-[#D4AF37] transition-colors text-center">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Collection Registry -> All Products */}
      <main id="featured" className="flex-1 max-w-[1400px] mx-auto px-4 sm:px-6 pt-12 md:pt-20 pb-6 md:pb-12 w-full">
        <div className="text-center mb-6 md:mb-12 space-y-2 md:space-y-3">
           <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.4em]">Explore</p>
           <h2 className="text-3xl md:text-5xl font-serif text-gray-900">All Products</h2>
        </div>

        <ProductGrid products={products} />

        <div className="mt-16 flex justify-center pb-8">
          <Link 
            href="/shop" 
            className="inline-flex items-center justify-center border border-gray-200 text-gray-900 font-black text-[10px] uppercase tracking-[0.2em] px-8 py-4 transition-all hover:bg-black hover:text-white hover:border-black rounded-lg"
          >
            View All
          </Link>
        </div>
      </main>
      
    </div>
  )
}

