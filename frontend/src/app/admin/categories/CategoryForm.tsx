"use client"

import { useState } from "react"
import { ImagePlus, Loader2, X } from "lucide-react"
import { createCategory, updateCategory } from "./actions"
import { toast } from "sonner"
import { compressImage } from "@/lib/image-utils"
import { urlForImage } from "@/lib/sanity-image"

export default function CategoryForm({ 
  initialData = null, 
  onSuccess 
}: { 
  initialData?: any, 
  onSuccess: () => void 
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(
    initialData?.image ? urlForImage(initialData.image, 600) : null
  )
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    
    if (imageFile) {
      const compressed = await compressImage(imageFile)
      formData.append("image", compressed)
    }

    const res = initialData 
      ? await updateCategory(initialData.id, formData)
      : await createCategory(formData)

    if (res.success) {
      toast.success(initialData ? "Category updated successfully." : "New collection created.")
      form.reset()
      setImagePreview(null)
      setImageFile(null)
      onSuccess()
    } else {
      toast.error(res.error)
    }
    setIsLoading(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-6">
      <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          {initialData ? "Update Category" : "New Category"}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Display Name</label>
          <input 
            name="name" 
            required 
            defaultValue={initialData?.name}
            placeholder="e.g. Summer Collection" 
            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">URL Slug</label>
          <input 
            name="slug" 
            required 
            defaultValue={initialData?.slug}
            placeholder="e.g. summer-collection" 
            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all font-mono" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea 
            name="description" 
            defaultValue={initialData?.description}
            placeholder="Describe this category..." 
            className="w-full min-h-[100px] rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all resize-y" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Image</label>
          
          <div className="relative group mt-1">
            {imagePreview ? (
              <div className="w-full aspect-[16/9] rounded-lg border border-slate-200 relative group overflow-hidden bg-slate-50">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    type="button" 
                    onClick={() => { setImagePreview(null); setImageFile(null); }}
                    className="p-2 bg-white text-red-600 rounded-md shadow-sm hover:bg-red-50 transition-colors scale-95 group-hover:scale-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => document.getElementById('cat-img')?.click()}
                className="w-full aspect-[16/9] rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm group-hover:shadow transition-all text-slate-400 group-hover:text-slate-600">
                  <ImagePlus className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700">Upload Image</span>
              </div>
            )}
            <input 
              id="cat-img"
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageChange}
            />
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:bg-slate-300 flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : initialData ? "Confirm Changes" : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  )
}
