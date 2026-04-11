import Link from "next/link"
import { Plus } from "lucide-react"
import { getSession } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"
import ProductTable from "./ProductTable"
import { getPaginatedProducts } from "./actions"

export const dynamic = "force-dynamic"

export default async function ProductsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string; search?: string; status?: string }> 
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.search || ""
  const status = params.status || "all"

  const { products, totalPages, total, currentPage } = await getPaginatedProducts({
    page,
    search,
    status
  })

  const session = await getSession()
  const userPermissions = session?.user?.role?.permissions || null
  const canCreate = hasPermission(userPermissions, PERMISSIONS.PRODUCTS_CREATE)

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products</h1>
           <p className="text-sm text-slate-500 mt-1">Found {total} products across {totalPages} pages.</p>
        </div>
        
        {canCreate && (
          <Link href="/admin/products/new">
            <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </Link>
        )}
      </div>

      <ProductTable 
        products={products} 
        userPermissions={userPermissions} 
        totalPages={totalPages}
        currentPage={currentPage}
        initialSearch={search}
        initialStatus={status}
      />
    </div>
  )
}
