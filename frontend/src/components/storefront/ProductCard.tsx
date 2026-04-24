import { BaseProduct } from "@/lib/storefront-actions"
import { CdnImage } from "./CdnImage"
import Link from "next/link"
import Image from "next/image"
import { Star, ShoppingBag } from "lucide-react"

interface ProductCardProps {
  product: BaseProduct
  view?: "1" | "2"
}

export default function ProductCard({ product, view = "1" }: ProductCardProps) {
  const isGrid = view === "2"

  return (
    <div className="group flex flex-col transition-all duration-500 p-1 sm:p-2">
      <Link
        href={`/product/${product.id}`}
        prefetch={false}
        className="block relative aspect-[2/3] bg-gray-50 rounded-2xl overflow-hidden mb-3 sm:mb-6 border border-transparent group-hover:border-[#D4AF37]/50 transition-colors duration-500"
      >
        {product.image ? (
          <CdnImage
            source={product.image}
            alt={product.title}
            fill
            sizes={!isGrid ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" : "(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 20vw"}
            className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
          />
        ) : (
          <Image
            src="/placeholder.svg"
            alt=""
            fill
            className="object-cover grayscale opacity-20"
          />
        )}


      </Link>

      <div className="flex flex-col items-center text-center space-y-2">

        <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">ZARITAAR</span>


        <Link href={`/product/${product.id}`} prefetch={false}>
          <h3 className={`font-bold text-gray-900 group-hover:text-black transition-colors line-clamp-1 px-2 uppercase tracking-tight ${isGrid ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'}`}>
            {product.title}
          </h3>
        </Link>


        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-2.5 h-2.5 fill-[#D4AF37] text-[#D4AF37]" />
          ))}
        </div>


        <p className={`font-black text-gray-900 ${isGrid ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}>
          Rs. {(product.basePrice || 0).toLocaleString()}
        </p>


        <div className="w-full pt-4 hidden md:block">
          <Link
            href={`/product/${product.id}`}
            prefetch={false}
            className="w-full bg-black text-white py-3 rounded-md text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all hover:bg-neutral-800 active:scale-[0.98] shadow-lg shadow-black/10"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add to Cart
          </Link>
        </div>
      </div>
    </div>
  )
}
