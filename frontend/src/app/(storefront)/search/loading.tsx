import React from "react"

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <div className="max-w-[1400px] mx-auto px-6 py-12 lg:py-20 w-full">
         <div className="h-4 w-48 bg-gray-50 animate-pulse mb-4 rounded-sm" />
         <div className="h-12 w-96 bg-gray-50 animate-pulse mb-12 rounded-sm" />
         
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 transition-all duration-500">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className="space-y-4 flex flex-col items-center">
                <div className="w-full aspect-[2/3] sm:aspect-[3/5] bg-gray-50 animate-pulse rounded-sm" />
                <div className="w-2/3 h-2.5 bg-gray-50 animate-pulse rounded-sm" />
                <div className="w-1/2 h-2.5 bg-gray-50 animate-pulse rounded-sm" />
                <div className="w-full h-8 bg-gray-50 animate-pulse rounded-sm" />
              </div>
            ))}
         </div>
      </div>
      
    </div>
  )
}
