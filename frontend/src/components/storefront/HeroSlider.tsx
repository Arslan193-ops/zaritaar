"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CdnImage } from "@/components/storefront/CdnImage"
import Link from "next/link"
import { useRenderGuard } from "@/lib/debug-utils"

interface HeroSliderProps {
  images: string[]
  headline?: string
  subtext?: string
  buttonText?: string
  buttonLink?: string
  badgeText?: string
  showHeadline?: boolean
  showButton?: boolean
  quality?: number
}

export default function HeroSlider({
  images = [],
  headline,
  subtext,
  buttonText,
  buttonLink,
  badgeText,
  showHeadline = true,
  showButton = true,
  quality = 80
}: HeroSliderProps) {
  useRenderGuard("HeroSlider", 30)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState(0)

  // Auto-scroll logic
  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setPrevIndex(currentIndex)
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [images.length, currentIndex])

  if (images.length === 0) {
    return null // Fallback to parent static hero if no images
  }

  return (
    <div className="relative h-[65vh] md:h-[85vh] w-full overflow-hidden">
      {/* Background Layer (Previous Slide) to prevent black flash while loading on live site */}
      <div className="absolute inset-0 z-0">
        <CdnImage
          key={`bg-${prevIndex}`}
          source={images[prevIndex]}
          alt=""
          fill
          sizes="100vw"
          quality={20}
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 z-10"
        >
          <CdnImage
            source={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            fill
            sizes="100vw"
            quality={quality}
            className="object-cover"
            priority
          />
          {/* Subtle Overlay for readability */}
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2 py-1 px-3 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 border border-white/10 mb-8"
          >
            {badgeText || "Premium Collection 2024"}
          </motion.div>

          {showHeadline && (
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-2xl sm:text-4xl md:text-8xl font-bold text-white leading-[1.1] mb-6 md:mb-8 tracking-tighter drop-shadow-2xl"
            >
              {headline?.split(" ").map((word, i) => (
                <span key={i} className={i % 2 === 1 ? "text-white/60" : "text-white"}>
                  {word}{" "}
                  {i === 1 && <br className="hidden md:block" />}
                </span>
              )) || "ELEVATING THE MODERN STANDARD."}
            </motion.h1>
          )}

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-sm md:text-xl text-white/80 max-w-xl mb-8 md:mb-12 font-medium leading-relaxed drop-shadow-lg"
          >
            {subtext || "Discover our meticulously engineered collection. Designed for the technical curator who appreciates the finer details."}
          </motion.p>

          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-wrap items-center gap-6"
            >
              <Link href={buttonLink || "#featured"} className="group relative bg-black text-white hover:bg-white hover:text-black border border-black px-10 py-4 font-bold text-sm uppercase tracking-widest transition-all rounded-2xl shadow-2xl flex items-center gap-2">
                {buttonText || "Shop Collection"}
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      {/* Progress Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 transition-all duration-500 rounded-full ${currentIndex === i ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
