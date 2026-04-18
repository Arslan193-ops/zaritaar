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
    <div className="w-full min-w-0 lg:col-span-7 flex flex-col md:flex-row gap-4 sm:gap-6">
      {/* Thumbnails - Desktop Focus (Hidden on Mobile) */}
      {images.length > 1 && (
        <div className="hidden md:flex md:flex-col gap-4 no-scrollbar md:w-20 shrink-0">
          {images.map((img, i) => (
            <div 
              key={img._key || i} 
              onClick={() => setActiveIndex(i)}
              className={cn(
                "aspect-[3/4] w-20 bg-gray-50 rounded-lg overflow-hidden cursor-pointer group relative border transition-all duration-300",
                activeIndex === i ? "border-black shadow-md ring-2 ring-black/5" : "border-gray-100 opacity-60 hover:opacity-100"
              )}
            >
              <CdnImage 
                src={urlFor(img).width(200).auto('format').quality(85).url()} 
                alt={`${title} thumbnail ${i + 1}`}
                width={200}
                height={266}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            </div>
          ))}
        </div>
      )}

      {/* Main Image & Mobile Navigation Area */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="h-[min(42vh,360px)] sm:h-auto sm:aspect-[3/4] sm:max-h-[600px] bg-gray-50 rounded-2xl overflow-hidden relative group lg:max-h-[75vh] w-full min-w-0 shadow-sm">
          <CdnImage 
            key={activeIndex}
            src={urlFor(images[activeIndex]).width(1080).auto('format').quality(82).url()} 
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 55vw"
            className="object-cover object-top animate-in fade-in zoom-in-95 duration-500"
            priority
          />
          
          {/* Subtle Mobile Overlay Indicators (Pills) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden z-10">
            {images.map((_, i) => (
              <button 
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "h-1 transition-all rounded-full drop-shadow-sm",
                  activeIndex === i ? "w-6 bg-black" : "w-1.5 bg-black/40"
                )}
              />
            ))}
          </div>
        </div>

        {/* Mobile Horizontal Thumbnail Strip - Positioned Safely BELOW Image */}
        {images.length > 1 && (
          <div className="flex md:hidden gap-3 overflow-x-auto no-scrollbar pb-2 pt-1">
            {images.map((img, i) => (
              <div 
                key={img._key || i} 
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "aspect-[3/4] w-14 shrink-0 bg-gray-50 rounded-lg overflow-hidden border transition-all",
                  activeIndex === i ? "border-black ring-1 ring-black/5" : "border-gray-100 opacity-70"
                )}
              >
                <CdnImage 
                  src={urlFor(img).width(160).auto('format').quality(80).url()} 
                  alt=""
                  width={160}
                  height={210}
                  className="w-full h-full object-cover" 
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
