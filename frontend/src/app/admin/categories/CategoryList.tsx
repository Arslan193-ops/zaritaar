"use client"

import { useState, useMemo } from "react"
import { deleteCategories } from "./actions"
import { DeleteModal } from "@/components/admin/DeleteModal"
import Link from "next/link"
import { 
  Search, 
  Trash2, 
  ShoppingBag, 
  MoreVertical,
  X,
  Edit2
} from "lucide-react"
import { urlForImage } from "@/lib/sanity-image"

export default function CategoryList({ 
  categories, 
  onEdit 
}: { 
  categories: any[], 
  onEdit: (cat: any) => void 
}) {
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    ids: string[];
  }>({
    isOpen: false,
    ids: []
  })

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.slug.toLowerCase().includes(search.toLowerCase())
    )
  }, [categories, search])

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCategories.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredCategories.map(c => c.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = async () => {
    setIsProcessing(true)
    try {
      const res = await deleteCategories(deleteModal.ids)
      if (res.success) {
        setSelectedIds([])
        setDeleteModal({ isOpen: false, ids: [] })
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <DeleteModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, ids: [] })}
        onConfirm={handleBulkDelete}
        title={deleteModal.ids.length > 1 ? "Wipe Categories?" : "Erase Category?"}
        description={`This action will permanently delete ${deleteModal.ids.length > 1 ? deleteModal.ids.length + ' categories' : 'this category'}. Any linked product associations may be affected.`}
        loading={isProcessing}
      />

      {/* Utility Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            disabled={selectedIds.length === 0}
            onClick={() => setDeleteModal({ isOpen: true, ids: selectedIds })}
            className="flex-1 sm:flex-none px-4 py-2 text-xs font-black uppercase tracking-widest text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Selected ({selectedIds.length})
          </button>
        </div>
      </div>

      {/* Primary Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto text-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredCategories.length && filteredCategories.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Image</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Name</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Slug</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Items</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCategories.length === 0 ? (
                <tr key="empty">
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    No matching categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat._id || cat.id} className={`group hover:bg-slate-50/50 transition-colors ${selectedIds.includes(cat._id || cat.id) ? 'bg-slate-50/80' : ''}`}>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(cat._id || cat.id)}
                        onChange={() => toggleSelect(cat._id || cat.id)}
                        className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 shadow-sm">
                        {cat.image ? (
                          <img src={urlForImage(cat.image, 100)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-200">
                             <ShoppingBag className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-bold tracking-tight text-slate-900">{cat.name}</p>
                        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => onEdit(cat)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Modify</button>
                          <button 
                            onClick={() => setDeleteModal({ isOpen: true, ids: [cat.id] })}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      /{cat.slug?.current || cat.slug}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100">
                        {cat._count?.products || 0} Listings
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-1.5 text-slate-300 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

