import React from "react"

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden">
      {/* Hero Skeleton */}
      <div className="h-[65vh] md:h-[85vh] w-full bg-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        <div className="absolute inset-0 flex flex-col justify-center max-w-7xl mx-auto px-6 space-y-6 z-10">
           <div className="h-6 w-32 bg-gray-300/50 rounded-full" />
           <div className="h-12 md:h-24 w-3/4 max-w-3xl bg-gray-300/50 rounded-sm" />
           <div className="h-4 md:h-6 w-1/2 max-w-xl bg-gray-300/50 rounded-sm" />
           <div className="h-12 w-48 bg-gray-300/50 rounded-2xl mt-4" />
        </div>
      </div>

      {/* Collections Skeleton */}
      <section className="bg-[#f7f4e9] pt-4 pb-2 md:py-10 border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="h-6 md:h-8 w-48 md:w-64 bg-gray-300 animate-pulse mx-auto mb-6 md:mb-10 rounded-sm" />
          
          <div className="flex overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[48%] md:w-auto flex flex-col items-center gap-3">
                <div className="aspect-[2/3] w-full bg-gray-200 animate-pulse rounded-xl md:rounded-2xl border border-[#D4AF37]/5" />
                <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded-sm mt-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid Skeleton */}
      <main className="flex-1 max-w-[1400px] mx-auto px-4 sm:px-6 pt-12 md:pt-20 pb-6 md:pb-12 w-full">
         <div className="text-center mb-6 md:mb-12 space-y-2 md:space-y-3">
            <div className="h-3 w-16 bg-gray-200 animate-pulse mx-auto rounded-sm" />
            <div className="h-8 md:h-12 w-48 md:w-64 bg-gray-200 animate-pulse mx-auto rounded-sm" />
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-8">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                 <div className="w-full aspect-[2/3] bg-gray-200 animate-pulse rounded-lg md:rounded-xl" />
                 <div className="w-3/4 h-4 bg-gray-200 animate-pulse mt-2 md:mt-4 rounded-sm" />
                 <div className="w-1/2 h-3 bg-gray-200 animate-pulse rounded-sm" />
              </div>
            ))}
         </div>
      </main>
      
    </div>
  )
}
