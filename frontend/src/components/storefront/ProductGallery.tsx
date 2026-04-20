"use client"

import { useState } from "react"
import Image from "next/image"
import { CdnImage } from "@/components/storefront/CdnImage"
import { urlFor } from "@/lib/sanity"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: any[]
  title: string
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="flex-1 w-full min-w-0 lg:col-span-7 h-[min(42vh,360px)] sm:h-auto sm:aspect-[3/4] sm:max-h-[600px] bg-gray-50 rounded-2xl overflow-hidden relative lg:max-h-[75vh]">
        <Image 
          src="/placeholder.svg" 
          alt={title}
          fill
          className="object-cover"
        />
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 lg:col-span-8 flex flex-col gap-6">
      {/* Main Image Area */}
      <div className="flex-1 w-full overflow-hidden max-h-[90vh]">
        <div 
          className="bg-white rounded-3xl overflow-hidden relative group w-full min-w-0 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-center transition-all duration-700"
          style={{ aspectRatio: images[activeIndex].ratio || "2/3" }}
        >
          <CdnImage 
            key={activeIndex}
            src={urlFor(images[activeIndex]).width(1200).auto('format').quality(85).url()} 
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 60vw"
            className="w-full h-full object-cover p-0 transition-transform duration-700 hover:scale-105"
            priority
          />
          
          {/* Main image label/pills for mobile */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:hidden z-10">
            {images.map((_, i) => (
              <button 
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "h-1 transition-all rounded-full drop-shadow-sm",
                  activeIndex === i ? "w-8 bg-black" : "w-2 bg-black/20"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Thumbnails Row - Desktop and Mobile (Below Main Image) */}
      {images.length > 1 && (
        <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-2 px-1">
          {images.map((img, i) => (
            <button 
              key={img._key || i} 
              onClick={() => setActiveIndex(i)}
              className={cn(
                "aspect-[3/4] w-20 sm:w-28 bg-gray-50 rounded-2xl overflow-hidden cursor-pointer group relative border-2 transition-all duration-300 shrink-0",
                activeIndex === i ? "border-black shadow-lg scale-95" : "border-transparent opacity-60 hover:opacity-100"
              )}
              aria-label={`View image ${i + 1}`}
            >
              <CdnImage 
                src={urlFor(img).width(200).auto('format').quality(85).url()} 
                alt=""
                fill
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
