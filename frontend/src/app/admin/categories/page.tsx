"use client"

import { useState, useEffect } from "react"
import CategoryForm from "./CategoryForm"
import CategoryList from "./CategoryList"
import { getCategories } from "./actions"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories()
      setCategories(data)
    }
    fetchCategories()
  }, [refreshKey])

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Categories</h2>
          <p className="text-sm text-slate-500 mt-1">Manage product taxonomy and organization.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left: Form */}
        <div className="lg:col-span-4 space-y-4">
          <CategoryForm 
            key={editingCategory?.id || 'new'} 
            initialData={editingCategory} 
            onSuccess={() => {
              setEditingCategory(null)
              setRefreshKey(prev => prev + 1)
            }} 
          />
          {editingCategory && (
            <button 
              onClick={() => setEditingCategory(null)}
              className="w-full mt-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors py-2"
            >
              Cancel Editing
            </button>
          )}
        </div>

        {/* Right: List */}
        <div className="lg:col-span-8">
          <CategoryList 
            categories={categories} 
            onEdit={(cat) => setEditingCategory(cat)} 
          />
        </div>
      </div>
    </div>
  )
}
