"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { 
  Search, 
  ExternalLink, 
  ShoppingBag, 
  X,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react"
import { deleteProducts, updateProductsStatus } from "./actions"
import { toast } from "sonner"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { DeleteModal } from "@/components/admin/DeleteModal"

export default function ProductTable({ 
  products, 
  userPermissions,
  totalPages,
  currentPage,
  initialSearch,
  initialStatus
}: { 
  products: any[], 
  userPermissions: string | null,
  totalPages: number,
  currentPage: number,
  initialSearch: string,
  initialStatus: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(initialSearch)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  // Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    ids: string[];
    title: string;
    description: string;
  }>({
    isOpen: false,
    ids: [],
    title: "",
    description: ""
  })

  const canEdit = hasPermission(userPermissions, PERMISSIONS.PRODUCTS_EDIT)
  const canDelete = hasPermission(userPermissions, PERMISSIONS.PRODUCTS_DELETE)

  // State Management via URL
  const updateQuery = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    })
    // Reset to page 1 for any search/filter change, unless actually changing the page
    if (!updates.page) params.set("page", "1")
    
    router.push(`${pathname}?${params.toString()}`)
  }

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(products.map(p => p.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev: string[]) => 
      prev.includes(id) ? prev.filter((i: string) => i !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = async () => {
    setIsProcessing(true)
    try {
      const res = await deleteProducts(deleteModal.ids)
      if (res.success) {
        toast.success(`Deleted ${deleteModal.ids.length} products`)
        setSelectedIds([])
        setDeleteModal(prev => ({ ...prev, isOpen: false }))
        router.refresh()
      } else {
        toast.error("Error: " + res.error)
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkStatusUpdate = async (status: string) => {
    setIsProcessing(true)
    try {
      const res = await updateProductsStatus(selectedIds, status)
      if (res.success) {
        toast.success(`Updated ${selectedIds.length} products`)
        setSelectedIds([])
        router.refresh()
      } else {
        toast.error("Error: " + res.error)
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteTrigger = (ids: string[]) => {
    setDeleteModal({
      isOpen: true,
      ids,
      title: ids.length > 1 ? "Bulk Delete Items?" : "Erase this listing?",
      description: ids.length > 1 
        ? `You are about to permanently delete ${ids.length} products. This action cannot be undone.` 
        : "Are you sure? This product listing will be permanently removed from your catalog."
    })
  }

  return (
    <div className="space-y-4">
      <DeleteModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleBulkDelete}
        title={deleteModal.title}
        description={deleteModal.description}
        loading={isProcessing}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            updateQuery({ search })
          }}
          className="relative flex-1 w-full sm:w-auto"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or SKU (Press Enter)..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </form>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={initialStatus}
            onChange={(e) => updateQuery({ status: e.target.value })}
            className="bg-slate-50 border border-slate-200 text-sm text-slate-700 rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-slate-900 appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="published">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-800 flex items-center gap-6">
            <div className="flex items-center gap-3 pr-6 border-r border-slate-700">
              <span className="flex items-center justify-center min-w-[24px] h-6 px-1 rounded-full bg-slate-800 text-xs font-bold tabular-nums">{selectedIds.length}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Selected</span>
            </div>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => handleBulkStatusUpdate("PUBLISHED")}
                disabled={isProcessing}
                className="text-[10px] font-black uppercase tracking-widest text-white hover:text-slate-300 transition-colors disabled:opacity-50"
              >
                Set Active
              </button>
              <button 
                onClick={() => handleBulkStatusUpdate("DRAFT")}
                disabled={isProcessing}
                className="text-[10px] font-black uppercase tracking-widest text-white hover:text-slate-300 transition-colors disabled:opacity-50"
               >
                Set Draft
              </button>
              {canDelete && (
                <button 
                  onClick={() => handleDeleteTrigger(selectedIds)}
                  disabled={isProcessing}
                  className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </div>
            
            <button 
              onClick={() => setSelectedIds([])}
              className="ml-2 p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto text-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === products.length && products.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Listing</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Status</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Inventory</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Base Price</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Category</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400 font-medium">
                    No results found for your active filters.
                  </td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product.id} className={`group hover:bg-slate-50/50 transition-colors ${selectedIds.includes(product.id) ? 'bg-slate-50/80' : ''}`}>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 relative shadow-sm">
                          {product.imageUrl || product.images?.[0]?.url ? (
                            <img src={product.imageUrl || product.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                               <ShoppingBag className="w-5 h-5 text-slate-200" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[220px] tracking-tight">{product.title}</p>
                          <div className="flex items-center gap-4 mt-1 opacity-0 group-hover:opacity-100 transition-all">
                            {canEdit && (
                               <Link 
                                 href={`/admin/products/edit/${product.id}`} 
                                 className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900"
                               >
                                 Modify
                               </Link>
                            )}
                            {canDelete && (
                               <button 
                                 onClick={() => handleDeleteTrigger([product.id])}
                                 className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600"
                               >
                                 Delete
                               </button>
                            )}
                            <Link href={`/product/${product.id}`} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 flex items-center gap-1">
                              View <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                        product.status === 'PUBLISHED' 
                          ? 'bg-green-50 text-green-700 border border-green-100' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {product.status === 'PUBLISHED' ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)] ${
                          product.stock > 10 ? 'bg-green-500' : 
                          product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        <span className={`text-[11px] font-bold tracking-tight ${product.stock > 0 ? 'text-slate-600' : 'text-red-500'}`}>
                          {product.stock} Units
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 tabular-nums">
                      ${product.basePrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      {product.category?.name || "Global"}
                    </td>
                    <td className="px-6 py-4 text-right text-[11px] font-bold text-slate-300 tabular-nums uppercase">
                      {format(new Date(product.createdAt), "MMM d, yyyy")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination Controls */}
        <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex flex-col gap-0.5">
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Registry Page</p>
             <p className="text-sm font-bold text-slate-900 italic">{currentPage} <span className="text-slate-300 font-medium not-italic mx-1">of</span> {totalPages}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => updateQuery({ page: currentPage - 1 })}
              disabled={currentPage <= 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            <button 
              onClick={() => updateQuery({ page: currentPage + 1 })}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
