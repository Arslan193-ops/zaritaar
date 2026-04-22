import React from "react"

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden">
      {/* Hero Skeleton */}
      <div className="h-[65vh] md:h-[85vh] w-full bg-gray-50 animate-pulse relative">
        <div className="absolute inset-0 flex flex-col justify-center max-w-7xl mx-auto px-6 space-y-6">
           <div className="h-6 w-32 bg-gray-100 rounded-full" />
           <div className="h-12 md:h-20 w-3/4 bg-gray-100 rounded-sm" />
           <div className="h-4 md:h-6 w-1/2 bg-gray-100 rounded-sm" />
           <div className="h-12 w-48 bg-gray-100 rounded-2xl" />
        </div>
      </div>

      {/* Collections Skeleton */}
      <section className="bg-[#fcfbf5] py-10 border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="h-8 w-64 bg-gray-100 animate-pulse mx-auto mb-10 rounded-sm" />
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="aspect-[4/5] w-full bg-gray-100 animate-pulse rounded-2xl" />
                <div className="h-3 w-1/2 bg-gray-100 animate-pulse rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid Skeleton */}
      <main className="max-w-[1400px] mx-auto px-6 py-12 w-full">
         <div className="flex items-center justify-between mb-10">
            <div className="h-6 w-32 bg-gray-100 animate-pulse rounded-sm" />
            <div className="h-4 w-24 bg-gray-100 animate-pulse rounded-sm" />
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                 <div className="w-full aspect-[3/4] bg-gray-50 animate-pulse rounded-sm" />
                 <div className="w-2/3 h-3 bg-gray-50 animate-pulse mt-6 rounded-sm" />
                 <div className="w-1/2 h-3 bg-gray-50 animate-pulse mt-2 rounded-sm" />
                 <div className="w-full h-10 bg-gray-50 animate-pulse mt-6 rounded-sm" />
              </div>
            ))}
         </div>
      </main>
      
    </div>
  )
}
