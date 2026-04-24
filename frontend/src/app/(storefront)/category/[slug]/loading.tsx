import React from "react"

export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Category Banner Skeleton */}
      <div className="bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 lg:py-20 flex flex-col items-center text-center">
           <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gray-50 animate-pulse mb-6" />
           <div className="h-3 w-32 bg-gray-50 animate-pulse mb-2 rounded-sm" />
           <div className="h-10 w-64 bg-gray-50 animate-pulse mb-4 rounded-sm" />
           <div className="h-4 w-96 bg-gray-50 animate-pulse rounded-sm" />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 w-full flex-1 flex flex-col lg:flex-row gap-8 lg:gap-16">
         {/* Sidebar Skeleton */}
         <aside className="w-full lg:w-[260px] shrink-0 space-y-6">
            <div className="h-10 w-full bg-gray-100 animate-pulse rounded-sm" />
            <div className="h-40 w-full bg-gray-50 animate-pulse rounded-sm" />
            <div className="h-40 w-full bg-gray-50 animate-pulse rounded-sm" />
         </aside>

         {/* Product Grid Skeleton */}
         <main className="flex-1">
            <div className="h-6 w-48 bg-gray-100 animate-pulse mb-8 rounded-sm" />
            
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
               {Array.from({ length: 8 }).map((_, idx) => (
                 <div key={idx} className="space-y-4 flex flex-col items-center">
                   <div className="w-full aspect-[3/4] bg-gray-50 animate-pulse rounded-sm" />
                   <div className="w-2/3 h-3 bg-gray-50 animate-pulse rounded-sm" />
                   <div className="w-1/2 h-3 bg-gray-50 animate-pulse rounded-sm" />
                   <div className="w-full h-10 bg-gray-50 animate-pulse rounded-sm" />
                 </div>
               ))}
            </div>
         </main>
      </div>
      
    </div>
  )
}
