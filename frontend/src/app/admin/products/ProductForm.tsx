"use client"

import { useState, useEffect } from "react"
import { createProduct, updateProduct, getCategories } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud, Plus, Trash2, X, Ruler, Settings2, Loader2, Save, TableIcon } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { urlFor } from "@/lib/sanity"
import { compressImage } from "@/lib/image-utils"

export function ProductForm({ product }: { product?: any }) {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<{ file?: File, preview: string, id?: string, assetId?: string | null }[]>(
    product?.images?.map((img: any) => ({ 
      preview: typeof img === 'string' ? img : (img.asset ? urlFor(img).url() : ""), 
      id: img._key || img.id,
      assetId: img.asset?._ref || null 
    })) || []
  )
  
  const [attributes, setAttributes] = useState<{name: string, values: string[]}[]>(() => {
    try {
      return product?.attributes ? JSON.parse(product.attributes) : [
        { name: "Size", values: ["S", "M", "L"] },
        { name: "Color", values: [] }
      ]
    } catch (e) {
      return [
        { name: "Size", values: ["S", "M", "L"] },
        { name: "Color", values: [] }
      ]
    }
  })

  const [sizeChartImages, setSizeChartImages] = useState<{ file?: File, preview: string, id?: string, assetId?: string | null }[]>(
    () => {
      try {
        if (!product?.sizeChart) return []
        const parsed = JSON.parse(product.sizeChart)
        if (Array.isArray(parsed)) {
          return parsed.map((item: any, idx: number) => ({
            preview: typeof item === 'string' ? item : (item.url || ""),
            assetId: item.asset?._ref || item.assetId || null,
            id: item._key || item.id || `sc_${idx}`
          }))
        }
        return []
      } catch (e) {
        return []
      }
    }
  )

  const [variants, setVariants] = useState<any[]>(
    product?.variants?.length > 0 
      ? product.variants.map((v: any) => ({ 
          ...JSON.parse(v.attributes || "{}"), 
          sku: v.sku || "",
          price: v.price || "",
          discountedPrice: v.discountedPrice || "",
          stock: v.stock || 0,
          imageUrl: v.imageUrl || "",
          id: v.id 
        }))
      : []
  )

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    product?.categoryId ? [product.categoryId] : []
  )

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    setImages([...images, ...newImages])
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    if (newImages[index].preview.startsWith('blob:')) {
      URL.revokeObjectURL(newImages[index].preview)
    }
    setImages(newImages.filter((_, i) => i !== index))
  }

  const handleSizeChartFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    setSizeChartImages([...sizeChartImages, ...newImages])
  }

  const removeSizeChartImage = (index: number) => {
    const newImages = [...sizeChartImages]
    if (newImages[index].preview.startsWith('blob:')) {
      URL.revokeObjectURL(newImages[index].preview)
    }
    setSizeChartImages(newImages.filter((_, i) => i !== index))
  }

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    )
  }

  const addAttribute = () => {
    setAttributes([...attributes, { name: "New Attribute", values: [] }])
  }

  const updateAttributeName = (index: number, name: string) => {
    const newAttrs = [...attributes]
    newAttrs[index].name = name
    setAttributes(newAttrs)
  }

  const addAttributeValue = (index: number, value: string) => {
    if (!value) return
    const newAttrs = [...attributes]
    if (!newAttrs[index].values.includes(value)) {
      newAttrs[index].values.push(value)
      setAttributes(newAttrs)
    }
  }

  const removeAttributeValue = (attrIndex: number, valIndex: number) => {
    const newAttrs = [...attributes]
    newAttrs[attrIndex].values.splice(valIndex, 1)
    setAttributes(newAttrs)
  }

  const generateVariations = () => {
    if (attributes.some(a => a.values.length === 0)) {
      toast.error("Each attribute must have at least one value.")
      return
    }

    const combinations = attributes.reduce((acc, attr) => {
      const newAcc: any[] = []
      attr.values.forEach(val => {
        if (acc.length === 0) {
          newAcc.push({ [attr.name]: val })
        } else {
          acc.forEach(prev => {
            newAcc.push({ ...prev, [attr.name]: val })
          })
        }
      })
      return newAcc
    }, [] as any[])

    const newVariants = combinations.map(combo => {
      const existing = variants.find(v => 
        Object.keys(combo).every(key => v[key] === combo[key])
      )
      return {
        ...combo,
        sku: existing?.sku || "",
        price: existing?.price || "",
        discountedPrice: existing?.discountedPrice || "",
        stock: existing?.stock || 0,
        imageUrl: existing?.imageUrl || ""
      }
    })

    setVariants(newVariants)
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: string, value: string) => {
    const newVariants = [...variants]
    newVariants[index][field] = value
    setVariants(newVariants)
  }

  const handleBulkApply = (field: string, value: string) => {
    if (!value && field !== "stock") return
    
    setVariants(prev => prev.map(v => ({
      ...v,
      [field]: field === "stock" ? (parseInt(value) || 0) : value
    })))
    
    toast.info(`Bulk applied ${field} to all variations`)
  }

  const handleAutoSKUs = () => {
    const titleBase = (document.getElementsByName("title")[0] as HTMLInputElement)?.value || "PROD"
    const prefix = titleBase.toUpperCase().replace(/\s+/g, '-').substring(0, 10)
    
    const newVariants = variants.map(v => {
      const attrValues = attributes.map(a => v[a.name]).filter(Boolean).join('-').toUpperCase()
      return {
        ...v,
        sku: `${prefix}-${attrValues || Math.floor(Math.random() * 1000)}`
      }
    })
    setVariants(newVariants)
    toast.success("Unique SKUs generated for all variations")
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)
    
    formData.append("attributes", JSON.stringify(attributes))
    
    // Process Size Chart Images
    const existingCharts = sizeChartImages.filter(img => !img.file).map(img => ({
      _key: img.id,
      assetId: img.assetId,
      url: img.preview
    }))
    formData.append("existingSizeChartInfo", JSON.stringify(existingCharts))
    
    for (const img of sizeChartImages) {
      if (img.file) {
        const compressed = await compressImage(img.file)
        formData.append("sizeChartFiles", compressed)
      }
    }

    const cleanVariants = variants.map(v => {
      const attrKeys = Object.keys(v).filter(k => !['id', 'sku', 'price', 'discountedPrice', 'stock', 'imageUrl'].includes(k))
      const attrs = {} as any
      attrKeys.forEach(k => attrs[k] = v[k])
      
      return {
        ...attrs,
        sku: v.sku,
        price: v.price,
        discountedPrice: v.discountedPrice,
        stock: v.stock
      }
    })

    formData.append("variants", JSON.stringify(cleanVariants))
    
    if (selectedCategoryIds.length > 0) {
      formData.set("categoryId", selectedCategoryIds[0])
    }
    
    const existing = images.filter(img => !img.file).map(img => ({
      _key: img.id,
      assetId: img.assetId,
      preview: img.preview
    }))
    formData.append("existingImages", JSON.stringify(existing))
    
    for (const img of images) {
      if (img.file) {
        const compressed = await compressImage(img.file)
        formData.append("imageFiles", compressed)
      }
    }

    try {
      const result = product?.id 
        ? await updateProduct(product.id, formData)
        : await createProduct(formData)

      if (result && result.success) {
        toast.success(product ? "Product updated successfully" : "Product created successfully")
        router.push("/admin/products")
        router.refresh()
      } else {
        setError(result.error)
        toast.error(result.error || "An error occurred")
      }
    } catch (err: any) {
      setError("Failed to save product.")
      toast.error(err.message || "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="w-full space-y-8 pb-24">
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-8 mx-auto font-medium text-sm text-center">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        
        <div className="p-8 border-b border-gray-200">
          <h2 className="text-xl font-semibold mb-6">Basic Details</h2>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">Product Title</label>
              <Input name="title" required defaultValue={product?.title || ""} className="h-11 shadow-sm border-gray-300 rounded-md focus:ring-black focus:border-black" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">Product Status</label>
              <div className="flex gap-4 pt-1">
                <label className="flex flex-1 items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all has-[:checked]:bg-black has-[:checked]:text-white has-[:checked]:border-black">
                  <input type="radio" name="status" value="PUBLISHED" defaultChecked={product?.status !== "DRAFT"} className="hidden" />
                  <span className="text-sm font-bold uppercase tracking-wider">Active</span>
                </label>
                <label className="flex flex-1 items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all has-[:checked]:bg-black has-[:checked]:text-white has-[:checked]:border-black">
                  <input type="radio" name="status" value="DRAFT" defaultChecked={product?.status === "DRAFT"} className="hidden" />
                  <span className="text-sm font-bold uppercase tracking-wider">Draft</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">Slug (URL)</label>
              <Input name="slug" defaultValue={product?.slug || ""} className="h-11 shadow-sm border-gray-300 rounded-md focus:ring-black focus:border-black" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">Regular Price ($)</label>
              <Input name="basePrice" type="number" step="0.01" required defaultValue={product?.basePrice || ""} className="h-11 shadow-sm border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">Discounted Price ($)</label>
              <Input name="discountedPrice" type="number" step="0.01" defaultValue={product?.discountedPrice || ""} className="h-11 shadow-sm border-gray-300 rounded-md" />
              <p className="text-xs text-gray-500">Leave blank for no discount.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">Cost Price ($)</label>
              <Input name="costPrice" type="number" step="0.01" defaultValue={product?.costPrice || ""} className="h-11 shadow-sm border-gray-300 rounded-md" />
              <p className="text-xs text-gray-500">Not shown to customers.</p>
            </div>
          </div>
        </div>

        <div className="p-8 border-b border-gray-200">
          <h2 className="text-base font-semibold mb-5 text-gray-800">Frontend Display Options</h2>
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" name="showSizeSelector" value="true" defaultChecked={product?.showSizeSelector ?? true} className="mt-1 w-4 h-4 text-black border-gray-300 rounded focus:ring-black" />
              <div>
                <p className="text-sm font-semibold group-hover:text-black transition-colors">Show Size Selector</p>
                <p className="text-xs text-gray-500">Enable size options on product page</p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" name="showColorSelector" value="true" defaultChecked={product?.showColorSelector ?? true} className="mt-1 w-4 h-4 text-black border-gray-300 rounded focus:ring-black" />
              <div>
                <p className="text-sm font-semibold group-hover:text-black transition-colors">Show Color Selector</p>
                <p className="text-xs text-gray-500">Enable color options on product page</p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" name="freeShipping" value="true" defaultChecked={product?.freeShipping ?? false} className="mt-1 w-4 h-4 text-black border-gray-300 rounded focus:ring-black" />
              <div>
                <p className="text-sm font-semibold group-hover:text-black transition-colors">Free Shipping</p>
                <p className="text-xs text-gray-500">Offer free shipping for this product</p>
              </div>
            </label>
          </div>
        </div>

        <div className="p-8 border-b border-gray-200 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">SKU</label>
            <Input name="sku" defaultValue={product?.sku || ""} className="h-11 shadow-sm border-gray-300 rounded-md" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Description (Plain Text shown normally)</label>
            <textarea
              name="description"
              required
              rows={5}
              defaultValue={product?.description || ""}
              className="w-full min-h-[140px] rounded-md border border-gray-300 shadow-sm p-4 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-y"
            />
          </div>
        </div>

        <div className="p-8 border-b border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Images</h2>
          <div className="flex flex-wrap gap-4 pt-2">
            <label className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-500 hover:bg-gray-50 cursor-pointer transition-all shadow-sm">
              <UploadCloud className="w-6 h-6 mb-2" />
              <span className="text-xs font-semibold">Upload</span>
              <input type="file" multiple name="imageFiles" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            
            {images.map((img, i) => (
              <div key={i} className="w-28 h-28 relative group rounded-md overflow-hidden border border-gray-200 shadow-sm">
                {img.preview && <img src={img.preview} alt="" className="w-full h-full object-cover" />}
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Multi-Image Size Chart Section */}
        <div className="p-8 border-b border-gray-200 bg-gray-50/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
               <Ruler className="w-5 h-5 text-gray-500" /> Size Chart Images
            </h2>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-500 hover:bg-white cursor-pointer transition-all shadow-sm bg-gray-50/50">
              <UploadCloud className="w-6 h-6 mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-center px-4 leading-[1.3]">Add Chart Image</span>
              <input type="file" multiple name="sizeChartFiles" accept="image/*" className="hidden" onChange={handleSizeChartFileChange} />
            </label>
            
            {sizeChartImages.map((img, i) => (
              <div key={i} className="w-32 h-32 relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white p-2">
                <img src={img.preview} alt="" className="w-full h-full object-contain" />
                <button type="button" onClick={() => removeSizeChartImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-6">
             Upload one or more images of your size charts. These will be shown in the storefront guide.
          </p>
        </div>

        <div className="p-8 border-b border-gray-200 space-y-8 bg-gray-50/30">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                 <Settings2 className="w-5 h-5 text-gray-500" /> 1. Define Attributes
              </h2>
              <button type="button" onClick={addAttribute} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                 + Add Attribute
              </button>
            </div>

            <div className="space-y-4">
              {attributes.map((attr, i) => (
                <div key={i} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="flex items-center gap-4">
                    <input 
                      value={attr.name}
                      onChange={(e) => updateAttributeName(i, e.target.value)}
                      className="bg-transparent text-sm font-semibold text-gray-900 focus:outline-none w-40 border-b border-transparent focus:border-gray-300"
                      placeholder="Attribute Name"
                    />
                    <div className="flex-1 flex flex-wrap gap-2 items-center">
                      {attr.values.map((val, vi) => (
                        <span key={vi} className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-semibold text-gray-700">
                          {val}
                          <button type="button" onClick={() => removeAttributeValue(i, vi)} className="text-gray-400 hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <input 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addAttributeValue(i, e.currentTarget.value)
                            e.currentTarget.value = ""
                          }
                        }}
                        placeholder="Add value + Enter"
                        className="bg-transparent text-sm font-medium text-gray-500 focus:outline-none min-w-[150px]"
                      />
                    </div>
                    <button type="button" onClick={() => setAttributes(attributes.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500 pl-4 border-l border-gray-200">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-center">
               <Button type="button" onClick={generateVariations} variant="outline" className="px-8 h-10 font-semibold shadow-sm border-gray-300 border-2 bg-white">
                  Generate All Variations
               </Button>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-center gap-2">
                   <Plus className="w-5 h-5 text-gray-500" />
                   <h2 className="text-lg font-semibold text-gray-900">2. Manage Variations</h2>
                </div>
                
                {variants.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase text-gray-400 px-1">Bulk Price</span>
                      <Input 
                        id="bulk-price"
                        placeholder="Price" 
                        type="number" 
                        className="h-8 w-24 text-xs" 
                        onKeyDown={e => e.key === 'Enter' && handleBulkApply('price', e.currentTarget.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase text-gray-400 px-1">Bulk Stock</span>
                      <Input 
                        id="bulk-stock"
                        placeholder="Stock" 
                        type="number" 
                        className="h-8 w-20 text-xs" 
                        onKeyDown={e => e.key === 'Enter' && handleBulkApply('stock', e.currentTarget.value)}
                      />
                    </div>
                    <div className="flex items-end gap-2 pt-4">
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="secondary" 
                        className="h-8 text-[11px] font-bold px-4"
                        onClick={() => {
                          const p = (document.getElementById('bulk-price') as HTMLInputElement).value;
                          const s = (document.getElementById('bulk-stock') as HTMLInputElement).value;
                          if(p) handleBulkApply('price', p);
                          if(s) handleBulkApply('stock', s);
                        }}
                      >
                         Apply All
                      </Button>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-[11px] font-bold px-4 border-slate-200"
                        onClick={handleAutoSKUs}
                      >
                         Auto SKUs
                      </Button>
                    </div>
                  </div>
                )}
             </div>
             
             {variants.length === 0 ? (
               <div className="bg-white border border-gray-200 py-6 text-center text-[13px] text-gray-400 font-medium italic rounded-md shadow-sm">
                 No combinations generated. Use attributes to generate variations.
               </div>
             ) : (
               <div className="bg-white border border-gray-200 rounded-md overflow-x-auto shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#FAFAFA] text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3">Combination</th>
                        <th className="px-4 py-3 w-40">SKU</th>
                        <th className="px-4 py-3 w-32">Reg. Price ($)</th>
                        <th className="px-4 py-3 w-32">Sale Price ($)</th>
                        <th className="px-4 py-3 w-28">Stock</th>
                        <th className="px-4 py-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {variants.map((v, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                             <div className="flex flex-wrap gap-1">
                                 {attributes.map((attr: any) => (
                                   <span key={attr.name} className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 rounded-md inline-block">
                                     {v[attr.name]}
                                   </span>
                                 ))}
                             </div>
                          </td>
                          <td className="px-4 py-2">
                            <Input 
                              value={v.sku || ""} 
                              onChange={e => updateVariant(i, "sku", e.target.value)} 
                              className="h-8 text-sm" 
                              placeholder="SKU" 
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Input 
                              type="number"
                              value={v.price || ""} 
                              onChange={e => updateVariant(i, "price", e.target.value)} 
                              className="h-8 text-sm" 
                              placeholder="Regular" 
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Input 
                              type="number"
                              value={v.discountedPrice || ""} 
                              onChange={e => updateVariant(i, "discountedPrice", e.target.value)} 
                              className="h-8 text-sm" 
                              placeholder="Sale" 
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Input 
                              type="number" 
                              value={v.stock || ""} 
                              onChange={e => updateVariant(i, "stock", e.target.value)} 
                              className="h-8 text-sm text-amber-600 font-semibold" 
                              placeholder="0" 
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button type="button" onClick={() => removeVariant(i)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-gray-100 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
             )}
          </div>
        </div>

        <div className="p-8 border-b border-gray-200 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Organization</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">Global Stock Quantity (Total)</label>
              <Input name="stock" type="number" defaultValue={product?.stock || "0"} className="h-11 shadow-sm border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">Tags (comma separated)</label>
              <Input name="tags" defaultValue={product?.tags || ""} placeholder="Summer, Sale, New" className="h-11 shadow-sm border-gray-300 rounded-md" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-sm font-semibold text-slate-800">Assign Category</label>
            <div className="flex flex-wrap gap-3">
              {categories.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No categories available. Please create one in the Categories tab first.</p>
              ) : (
                categories.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="radio"
                      name="categoryId"
                      value={c.id}
                      checked={selectedCategoryIds.includes(c.id)} 
                      onChange={() => setSelectedCategoryIds([c.id])} 
                      className="w-4 h-4 text-slate-900 border-gray-300 focus:ring-slate-900"
                    />
                    <span className="text-sm font-medium text-gray-700">{c.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">SEO Settings</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">Meta Title</label>
              <Input name="metaTitle" defaultValue={product?.metaTitle || ""} className="h-11 shadow-sm border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">Meta Description</label>
              <textarea 
                name="metaDescription" 
                rows={3} 
                defaultValue={product?.metaDescription || ""} 
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-sm focus:ring-black focus:border-black resize-y min-h-[100px]"
              ></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">Keywords (comma separated)</label>
              <Input name="keywords" defaultValue={product?.keywords || ""} placeholder="shirt, linen, beige" className="h-11 shadow-sm border-gray-300 rounded-md" />
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-end border-t border-gray-100 pt-8 p-5">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="bg-slate-900 hover:bg-black text-white px-10 h-12 text-sm font-bold shadow-xl shadow-slate-200/50 rounded-xl transition-all active:scale-[0.95] min-w-[180px] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{product ? "Update Product" : "Publish Product"}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
