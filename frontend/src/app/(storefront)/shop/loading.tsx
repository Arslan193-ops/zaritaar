import React from "react"

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-[#FDFCF9] flex flex-col font-sans">

      {/* Shop Header Skeleton */}
      <div className="bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 lg:py-20 flex flex-col items-center text-center">
           <div className="h-6 w-32 bg-gray-50 animate-pulse mb-6 rounded-full" />
           <div className="h-16 w-3/4 bg-gray-50 animate-pulse mb-4 rounded-sm" />
           <div className="h-4 w-1/2 bg-gray-50 animate-pulse rounded-sm" />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 w-full flex-1 flex flex-col lg:flex-row gap-8 lg:gap-16">
         {/* Sidebar Skeleton */}
         <aside className="w-full lg:w-[260px] shrink-0 space-y-6">
            <div className="h-10 w-full bg-gray-100 animate-pulse rounded-sm" />
            <div className="h-48 w-full bg-gray-50 animate-pulse rounded-sm" />
            <div className="h-48 w-full bg-gray-50 animate-pulse rounded-sm" />
         </aside>

         {/* Product Grid Skeleton */}
         <main className="flex-1">
            <div className="h-6 w-48 bg-gray-100 animate-pulse mb-8 rounded-sm" />
            
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12 sm:gap-x-6">
               {Array.from({ length: 8 }).map((_, idx) => (
                 <div key={idx} className="space-y-6 flex flex-col items-center">
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
