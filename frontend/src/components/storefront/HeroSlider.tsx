"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

interface HeroSliderProps {
  images: string[]
  headline?: string
  subtext?: string
  buttonText?: string
  buttonLink?: string
  showHeadline?: boolean
  showButton?: boolean
}

export default function HeroSlider({ 
  images = [], 
  headline, 
  subtext, 
  buttonText, 
  buttonLink,
  showHeadline = true,
  showButton = true
}: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-scroll logic
  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [images.length])

  if (images.length === 0) {
     return null // Fallback to parent static hero if no images
  }

  return (
    <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden bg-[#fafafa]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            fill
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
                Premium Collection 2024
            </motion.div>

            {showHeadline && (
                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-5xl md:text-8xl font-black text-white leading-[1.05] mb-8 tracking-tighter drop-shadow-2xl"
                >
                    {headline?.split(" ").map((word, i) => (
                        <span key={i} className={i % 2 === 1 ? "text-white/60" : "text-white"}>
                            {word}{" "}
                            {i === 1 && <br />}
                        </span>
                    )) || "ELEVATING THE MODERN STANDARD."}
                </motion.h1>
            )}

            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-lg md:text-xl text-white/80 max-w-xl mb-12 font-medium leading-relaxed drop-shadow-lg"
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
                    <Link href={buttonLink || "#featured"} className="group relative bg-white text-black hover:bg-black hover:text-white px-10 py-4 font-bold text-sm uppercase tracking-widest transition-all rounded-lg shadow-2xl flex items-center gap-2">
                        {buttonText || "Explore Registry"}
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
              className={`h-1.5 transition-all duration-500 rounded-full ${
                currentIndex === i ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
