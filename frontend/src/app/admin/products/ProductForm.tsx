"use client"

import { useState, useEffect } from "react"
import { createProduct, updateProduct, getCategories } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud, Plus, Trash2, X, TableIcon, Settings2, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { urlFor } from "@/lib/sanity"

export function ProductForm({ product }: { product?: any }) {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<{ file?: File, preview: string, id?: string }[]>(
    product?.images?.map((img: any) => ({ 
      preview: typeof img === 'string' ? img : (img.asset ? urlFor(img).url() : ""), 
      id: img._key || img.id 
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

  const [sizeChart, setSizeChart] = useState(() => {
    try {
      return product?.sizeChart ? JSON.parse(product.sizeChart) : {
        headers: [
          { text: "Size", bold: true },
          { text: "Chest", bold: true },
          { text: "Length", bold: true }
        ],
        rows: [
          [{ text: "S", bold: true }, { text: "", bold: false }, { text: "", bold: false }],
          [{ text: "M", bold: true }, { text: "", bold: false }, { text: "", bold: false }],
          [{ text: "L", bold: true }, { text: "", bold: false }, { text: "", bold: false }]
        ]
      }
    } catch (e) {
      return {
        headers: [
          { text: "Size", bold: true }, { text: "Chest", bold: true }, { text: "Length", bold: true }
        ],
        rows: [
          [{ text: "S", bold: true }, { text: "", bold: false }, { text: "", bold: false }],
          [{ text: "M", bold: true }, { text: "", bold: false }, { text: "", bold: false }],
          [{ text: "L", bold: true }, { text: "", bold: false }, { text: "", bold: false }]
        ]
      }
    }
  })

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

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    )
  }

  // RESTORED LOGIC FOR ATTRIBUTES & VARIANTS
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

  const addChartColumn = () => {
    const name = window.prompt("Enter Column Header Name:")
    if (!name) return
    
    setSizeChart((prev: any) => ({
      headers: [...prev.headers, { text: name, bold: true }],
      rows: prev.rows.map((row: any) => [...row, { text: "", bold: false }])
    }))
  }

  const addChartRow = () => {
    setSizeChart((prev: any) => ({
      headers: prev.headers,
      rows: [...prev.rows, Array(prev.headers.length).fill({ text: "", bold: false })]
    }))
  }

  const removeChartColumn = (index: number) => {
    if (sizeChart.headers.length <= 1) return
    setSizeChart((prev: any) => ({
      headers: prev.headers.filter((_: any, i: number) => i !== index),
      rows: prev.rows.map((row: any) => row.filter((_: any, i: number) => i !== index))
    }))
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)
    
    formData.append("attributes", JSON.stringify(attributes))
    formData.append("sizeChart", JSON.stringify(sizeChart))

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
    
    images.forEach((img) => {
      if (img.file) formData.append("imageFiles", img.file)
    })

    try {
      const result = product?.id 
        ? await updateProduct(product.id, formData)
        : await createProduct(formData)

      if (result.success) {
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
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">Product Title</label>
              <Input name="title" required defaultValue={product?.title || ""} className="h-11 shadow-sm border-gray-300 rounded-md focus:ring-black focus:border-black" />
            </div>
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

        <div className="p-8 border-b border-gray-200 bg-gray-50/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
               <TableIcon className="w-5 h-5 text-gray-500" /> Size Guide Matrix
            </h2>
            <div className="flex gap-2">
               <button type="button" onClick={addChartColumn} className="text-xs font-semibold text-gray-600 px-3 py-1.5 hover:text-gray-900 border border-gray-300 rounded-md bg-white shadow-sm">+ Col</button>
               <button type="button" onClick={addChartRow} className="text-xs font-semibold text-gray-600 px-3 py-1.5 hover:text-gray-900 border border-gray-300 rounded-md bg-white shadow-sm">+ Row</button>
            </div>
          </div>
          <div className="border border-gray-200 bg-white rounded-md overflow-x-auto shadow-sm">
             <table className="w-full border-collapse">
                <thead>
                   <tr className="bg-gray-50 border-b border-gray-200">
                      {sizeChart.headers.map((h: any, i: number) => (
                        <th key={i} className="p-3 border-r border-gray-200 min-w-[120px]">
                           <div className="flex items-center gap-2">
                              <input 
                                value={h.text} 
                                onChange={e => {
                                  const newH = [...sizeChart.headers]; 
                                  newH[i].text = e.target.value; 
                                  setSizeChart({...sizeChart, headers: newH})
                                }} 
                                className="w-full bg-transparent text-sm font-semibold focus:outline-none" 
                              />
                              <button type="button" onClick={() => removeChartColumn(i)} className="text-gray-400 hover:text-red-500 transition-all">
                                 <X className="w-4 h-4" />
                              </button>
                           </div>
                        </th>
                      ))}
                      <th className="w-10"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {sizeChart.rows.map((row: any, ri: number) => (
                     <tr key={ri}>
                        {row.map((cell: any, ci: number) => (
                          <td key={ci} className="p-2 border-r border-gray-100">
                             <input 
                               value={cell.text} 
                               onChange={e => {
                                 const newR = [...sizeChart.rows]; 
                                 newR[ri][ci].text = e.target.value; 
                                 setSizeChart({...sizeChart, rows: newR})
                               }} 
                               className="w-full text-sm font-medium p-1 focus:outline-none focus:bg-gray-50 rounded" 
                             />
                          </td>
                        ))}
                        <td className="p-2 text-center">
                           <button type="button" onClick={() => setSizeChart({...sizeChart, rows: sizeChart.rows.filter((_:any,i:number) => i !== ri)})} className="text-gray-400 hover:text-red-500">
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
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
             <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">2. Manage Variations</h2>
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
