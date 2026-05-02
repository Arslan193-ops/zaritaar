import React from "react"

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden">
      <main className="flex-1 max-w-[1300px] mx-auto px-4 sm:px-8 py-8 md:py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Gallery Skeleton */}
          <div className="w-full space-y-4">
             <div className="aspect-[2/3] bg-gray-200 animate-pulse rounded-lg w-full" />
             <div className="flex gap-2 mt-4">
                <div className="aspect-[3/5] bg-gray-200 animate-pulse rounded-lg flex-1" />
                <div className="aspect-[3/5] bg-gray-200 animate-pulse rounded-lg flex-1" />
                <div className="aspect-[3/5] bg-gray-200 animate-pulse rounded-lg flex-1" />
                <div className="aspect-[3/5] bg-gray-200 animate-pulse rounded-lg flex-1" />
             </div>
          </div>

          {/* Info Side Skeleton */}
          <div className="flex flex-col space-y-8 pt-4">
             <div className="space-y-4 border-b border-gray-100 pb-6">
                <div className="flex justify-between">
                   <div className="h-3 w-1/4 bg-gray-300 animate-pulse rounded-sm" />
                   <div className="h-3 w-1/5 bg-gray-200 animate-pulse rounded-sm" />
                </div>
                <div className="h-10 md:h-14 w-full max-w-sm bg-gray-300 animate-pulse rounded-sm" />
                <div className="h-8 w-1/3 bg-gray-200 animate-pulse rounded-sm" />
             </div>
             
             <div className="h-32 w-full bg-gray-200 animate-pulse rounded-sm" />
             
             <div className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="h-14 w-full bg-gray-200 animate-pulse rounded-sm" />
                   <div className="h-14 w-full bg-gray-300 animate-pulse rounded-sm" />
                </div>
                <div className="h-14 w-full bg-green-200/50 animate-pulse rounded-sm" />
             </div>
          </div>
        </div>
      </main>
      
    </div>
  )
}
