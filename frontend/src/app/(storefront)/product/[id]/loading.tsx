import React from "react"

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden">
      <main className="flex-1 max-w-[1400px] mx-auto px-6 sm:px-10 py-10 md:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Gallery Skeleton */}
          <div className="lg:col-span-8 space-y-4">
             <div className="aspect-[3/4] bg-gray-50 animate-pulse rounded-sm w-full" />
             <div className="grid grid-cols-4 gap-4">
                <div className="aspect-square bg-gray-50 animate-pulse rounded-sm" />
                <div className="aspect-square bg-gray-50 animate-pulse rounded-sm" />
                <div className="aspect-square bg-gray-50 animate-pulse rounded-sm" />
                <div className="aspect-square bg-gray-50 animate-pulse rounded-sm" />
             </div>
          </div>

          {/* Info Side Skeleton */}
          <div className="lg:col-span-4 space-y-8 pt-4">
             <div className="space-y-4">
                <div className="h-3 w-1/3 bg-gray-50 animate-pulse rounded-sm" />
                <div className="h-12 w-full bg-gray-50 animate-pulse rounded-sm" />
                <div className="h-4 w-1/4 bg-gray-50 animate-pulse rounded-sm" />
             </div>
             
             <div className="h-16 w-full bg-gray-50 animate-pulse rounded-sm" />
             <div className="h-32 w-full bg-gray-50 animate-pulse rounded-sm" />
             
             <div className="space-y-2">
                <div className="h-10 w-full bg-gray-50 animate-pulse rounded-sm" />
                <div className="h-10 w-full bg-gray-50 animate-pulse rounded-sm" />
             </div>
          </div>
        </div>
      </main>
      
    </div>
  )
}
