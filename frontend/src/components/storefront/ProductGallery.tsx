"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { CdnImage } from "@/components/storefront/CdnImage"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ProductGalleryProps {
  images: any[]
  title: string
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  // Lock body scroll when zoomed
  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isZoomed])

  if (!images || images.length === 0) {
    return (
      <div className="flex-1 w-full min-w-0 h-[min(60vh,800px)] bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-100">
        <Image 
          src="/placeholder.svg" 
          alt={title}
          fill
          className="object-cover opacity-20"
          unoptimized={true}
        />
        <div className="absolute inset-0 flex items-center justify-center">
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Awaiting Visuals</p>
        </div>
      </div>
    )
  }

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActiveIndex((prev) => (prev + 1) % images.length)
  }

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 w-full">
      
      {/* Lightbox / Full Screen View */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-10"
          >
            <button 
              onClick={() => setIsZoomed(false)}
              className="absolute top-6 right-6 sm:top-10 sm:right-10 w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 text-gray-900 hover:bg-black hover:text-white transition-all z-50"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="absolute top-10 left-10 hidden lg:block">
              <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">{title}</span>
              <h3 className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Detail Gallery View</h3>
            </div>

            <div className="relative w-full h-full flex items-center justify-center">
              <button 
                onClick={handlePrev}
                className="absolute left-0 sm:left-4 w-12 h-12 flex items-center justify-center rounded-full bg-white/50 hover:bg-white text-gray-900 shadow-sm transition-all z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <motion.div 
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 20 }}
                className="relative w-full h-full max-w-5xl"
              >
                <CdnImage 
                  source={images[activeIndex]}
                  alt={title}
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>

              <button 
                onClick={handleNext}
                className="absolute right-0 sm:right-4 w-12 h-12 flex items-center justify-center rounded-full bg-white/50 hover:bg-white text-gray-900 shadow-sm transition-all z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <span className="text-black">{activeIndex + 1}</span> / {images.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Thumbnails */}
      <div className="lg:w-20 shrink-0">
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar max-h-[80vh]">
          {images.map((img, i) => (
            <button 
              key={img._key || i} 
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative aspect-[3/5] w-16 lg:w-full shrink-0 bg-gray-50 rounded-lg overflow-hidden border-2 transition-all duration-300",
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

      {/* Main Feature Image */}
      <div className="flex-1 relative flex justify-center">
        <div 
          onClick={() => setIsZoomed(true)}
          className="bg-white rounded-2xl overflow-hidden relative w-full max-w-[500px] border border-[#D4AF37]/30 group shadow-sm transition-all duration-700 max-h-[80vh] cursor-zoom-in"
          style={{ aspectRatio: "2/3" }}
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
          
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
             <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-900 shadow-lg">
                <Maximize2 className="w-4 h-4" />
             </div>
          </div>

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
