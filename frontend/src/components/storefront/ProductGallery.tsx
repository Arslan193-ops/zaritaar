"use client"

import { useState } from "react"
import Image from "next/image"
import { CdnImage } from "@/components/storefront/CdnImage"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown } from "lucide-react"

interface ProductGalleryProps {
  images: any[]
  title: string
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="flex-1 w-full min-w-0 h-[min(60vh,800px)] bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-100">
        <Image 
          src="/placeholder.svg" 
          alt={title}
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 flex items-center justify-center">
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Awaiting Visuals</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 w-full">

      <div className="lg:w-20 shrink-0">
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar max-h-[80vh]">
          {images.map((img, i) => (
            <button 
              key={img._key || i} 
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative aspect-[2/3] w-16 lg:w-full shrink-0 bg-gray-50 rounded-lg overflow-hidden border-2 transition-all duration-300",
                activeIndex === i ? "border-[#D4AF37] shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <CdnImage 
                source={img}
                alt={`${title} view ${i + 1}`}
                fill
                className="object-cover" 
              />
            </button>
          ))}
        </div>
      </div>


      <div className="flex-1 relative flex justify-center">
        <div 
          className="bg-white rounded-2xl overflow-hidden relative w-full max-w-[500px] border border-[#D4AF37]/10 group shadow-sm transition-all duration-700 max-h-[80vh]"
          style={{ aspectRatio: "3/4" }}
        >
          <CdnImage 
            key={activeIndex}
            source={images[activeIndex]}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            priority
          />
          

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 lg:hidden z-10">
            {images.map((_, i) => (
              <div 
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  activeIndex === i ? "w-6 bg-black" : "w-1.5 bg-black/20"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
