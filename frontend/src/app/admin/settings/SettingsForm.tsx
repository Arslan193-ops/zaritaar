"use client"

import { useState } from "react"
import imageCompression from "browser-image-compression"
import { updateStoreSettings, updateShippingMethods } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud, Check, X, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

export function SettingsForm({
  initialSettings,
  initialShipping
}: {
  initialSettings: any;
  initialShipping: any[];
}) {
  const [activeTab, setActiveTab] = useState("general")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Tab 2 State
  const [shippingMethods, setShippingMethods] = useState(initialShipping || [])

  // Helper to filter out legacy local uploads that no longer exist (cause 404s)
  const sanitizePath = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("/uploads/")) return ""; // Clear legacy paths
    return url;
  };

  // Basic reusable hook for file previews
  const [previews, setPreviews] = useState({
    desktop: sanitizePath(initialSettings?.desktopHeroImage),
    mobile: sanitizePath(initialSettings?.mobileHeroImage),
    logo: sanitizePath(initialSettings?.logoUrl),
    logoDark: sanitizePath(initialSettings?.logoDarkUrl),
  })

  // Slider State (Array of file-like objects for the UI)
  const [sliderImages, setSliderImages] = useState<{ id: string, url: string, file?: File }[]>(() => {
    try {
      const existing = JSON.parse(initialSettings?.heroSliderImages || "[]")
      return existing
        .map((url: string, i: number) => ({ id: `existing-${i}`, url: sanitizePath(url) }))
        .filter((item: any) => item.url !== "") // Remove empty legacy paths
    } catch { return [] }
  })

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }))
    }
  }

  const addShippingMethod = () => {
    setShippingMethods([
      ...shippingMethods,
      { name: "New Method", duration: "3-5 Business Days", price: 0, isFree: false }
    ])
  }

  const updateMethod = (index: number, field: string, value: any) => {
    const newMethods = [...shippingMethods]
    newMethods[index][field] = value
    setShippingMethods(newMethods)
  }

  const removeMethod = (index: number) => {
    setShippingMethods(shippingMethods.filter((_: any, i: number) => i !== index))
  }

  const addSliderImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const newImg = { 
        id: `new-${Date.now()}`, 
        url: URL.createObjectURL(file),
        file 
      }
      setSliderImages([...sliderImages, newImg])
    }
  }

  const removeSliderImage = (id: string) => {
    setSliderImages(sliderImages.filter(img => img.id !== id))
  }

  // Announcements State
  const [announcements, setAnnouncements] = useState<string[]>(() => {
    try {
       const parsed = JSON.parse(initialSettings?.announcementsText || "[]")
       return parsed.length ? parsed : ["Get an extra 5% off on your first order using code 'IMNEW' !"]
    } catch {
       return ["Get an extra 5% off on your first order using code 'IMNEW' !"]
    }
  })

  const addAnnouncement = () => setAnnouncements([...announcements, ""])
  const updateAnnouncement = (index: number, val: string) => {
     const newAnn = [...announcements]
     newAnn[index] = val
     setAnnouncements(newAnn)
  }
  const removeAnnouncement = (index: number) => {
     setAnnouncements(announcements.filter((_, i) => i !== index))
  }

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 2048,
      useWebWorker: true,
      fileType: "image/webp" as const,
    };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error("Compression error:", error);
      return file; // Fallback to original
    }
  };

  // Submission handler based on Tab
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (activeTab === "shipping") {
        // Handle standalone shipping array logic
        const r = await updateShippingMethods(JSON.stringify(shippingMethods))
        if (!r.success) throw new Error(r.error)
      } else {
        // Handle General / Order / Branding pages
        const payload = new FormData(e.currentTarget)
        
        // COMPRESSION FOR STANDALONE IMAGES
        const fileFields = ['logoFile', 'logoDarkFile', 'desktopHeroImageFile', 'mobileHeroImageFile'];
        for (const field of fileFields) {
           const file = payload.get(field) as File | null;
           if (file && file.size > 0 && file.name !== "undefined") {
              const compressed = await compressImage(file);
              payload.set(field, compressed, file.name.split('.')[0] + '.webp');
           }
        }

        // COMPRESSION FOR SLIDER IMAGES
        for (let i = 0; i < sliderImages.length; i++) {
           const img = sliderImages[i];
           if (img.file) {
              const compressed = await compressImage(img.file);
              payload.append(`sliderFile_${i}`, compressed, img.file.name.split('.')[0] + '.webp');
           } else {
              payload.append(`existingSliderUrl_${i}`, img.url);
           }
        }
        
        payload.append("sliderCount", sliderImages.length.toString())
        payload.append("announcementsText", JSON.stringify(announcements))

        const res = await updateStoreSettings(payload)
        if (!res.success) throw new Error(res.error)
      }
      
        toast.success("Settings saved successfully!")
    } catch (err: any) {
      toast.error(err.message || "An error occurred saving settings.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: "general", label: "General & Identity" },
            { id: "branding", label: "Branding & Slider" },
            { id: "shipping", label: "Shipping Options" },
            { id: "order", label: "Order Page Settings" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-8 pb-10">
          {error && (
             <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-md mb-6 font-medium text-sm">
               {error}
             </div>
          )}

          {/* TAB 1: General & Identity */}
          <div className={`${activeTab === "general" ? "" : "hidden"} space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              
              {/* Store Identity & Announcements */}
              <div className="space-y-6 border-b border-gray-100 pb-8">
                <h2 className="text-lg font-semibold text-gray-900">Store Identity</h2>
                <div className="space-y-2 max-w-lg">
                  <label className="text-sm font-semibold text-gray-700">Store Name</label>
                  <Input name="storeName" required defaultValue={initialSettings?.storeName || ""} className="h-11 border-gray-300" />
                </div>
                
                <div className="pt-4 space-y-4 max-w-2xl">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700">Top Announcement Bar</h3>
                      <p className="text-xs text-gray-500 mt-1">Add messages to the black bar at the top of the storefront.</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-1 shrink-0">
                       <input type="checkbox" name="enableScrollingAnnouncements" value="true" defaultChecked={initialSettings?.enableScrollingAnnouncements ?? false} className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded" />
                       <span className="text-sm font-semibold text-gray-600">Auto-Scroll (Marquee)</span>
                    </label>
                  </div>
                  
                  <div className="space-y-3">
                    {announcements.map((ann, i) => (
                      <div key={i} className="flex gap-2 relative group">
                        <Input 
                          value={ann} 
                          onChange={(e) => updateAnnouncement(i, e.target.value)} 
                          className="h-10 text-sm border-gray-300 pr-10" 
                          placeholder="e.g. Free shipping on orders over $50!" 
                        />
                        {announcements.length > 1 && (
                          <button type="button" onClick={() => removeAnnouncement(i)} className="absolute right-2 top-1.5 text-gray-400 hover:text-red-500 bg-white p-1 rounded-md transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addAnnouncement} className="h-9 text-xs border-gray-300">+ Add Message</Button>
                  </div>
                </div>
              </div>

              {/* Hero Section */}
              <div className="space-y-6 border-b border-gray-100 pb-8">
                <h2 className="text-lg font-semibold text-gray-900">Hero Section (Home)</h2>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Desktop Hero Image</label>
                    <label className="block w-full h-[180px] bg-slate-50 border-2 border-dashed border-gray-300 hover:border-black rounded-xl overflow-hidden cursor-pointer relative group transition-colors">
                      {previews.desktop ? (
                        <img src={previews.desktop} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                           <UploadCloud className="w-8 h-8" />
                           <span className="text-xs font-semibold">Upload Desktop Banner</span>
                        </div>
                      )}
                      <input type="file" name="desktopHeroImageFile" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'desktop')} />
                    </label>
                  </div>
                  <div className="space-y-3 max-w-[200px]">
                    <label className="text-sm font-semibold text-gray-700">Mobile Hero Image</label>
                    <label className="block w-full h-[180px] bg-slate-50 border-2 border-dashed border-gray-300 hover:border-black rounded-xl overflow-hidden cursor-pointer relative group transition-colors">
                      {previews.mobile ? (
                        <img src={previews.mobile} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                           <UploadCloud className="w-8 h-8" />
                           <span className="text-xs font-semibold text-center">Mobile<br/>Portrait</span>
                        </div>
                      )}
                      <input type="file" name="mobileHeroImageFile" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'mobile')} />
                    </label>
                  </div>
                </div>

                <div className="space-y-2 max-w-2xl pt-4">
                  <label className="text-sm font-semibold text-gray-700">Headline</label>
                  <div className="flex items-center gap-4">
                     <Input name="heroHeadline" defaultValue={initialSettings?.heroHeadline || ""} className="h-11 flex-1 border-gray-300" />
                     <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input type="checkbox" name="showHeroHeadline" value="true" defaultChecked={initialSettings?.showHeroHeadline ?? true} className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded" />
                        <span className="text-sm font-semibold text-gray-600">Show</span>
                     </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 max-w-2xl pt-2">
                  <div className="space-y-2">
                     <label className="text-sm font-semibold text-gray-700">Button Text</label>
                     <div className="flex items-center gap-3">
                        <Input name="heroButtonText" defaultValue={initialSettings?.heroButtonText || ""} className="h-11 border-gray-300" />
                        <label className="flex items-center gap-2 cursor-pointer pt-1 shrink-0">
                           <input type="checkbox" name="showHeroButton" value="true" defaultChecked={initialSettings?.showHeroButton ?? true} className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded" />
                           <span className="text-sm font-semibold text-gray-600">Show</span>
                        </label>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-semibold text-gray-700">Button Link</label>
                     <Input name="heroButtonLink" defaultValue={initialSettings?.heroButtonLink || ""} placeholder="/products" className="h-11 border-gray-300" />
                  </div>
                </div>
              </div>
          </div>

          {/* TAB 4: Branding & Slider */}
          <div className={`${activeTab === "branding" ? "" : "hidden"} space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
               {/* Logo Section */}
               <div className="space-y-6 border-b border-gray-100 pb-10">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Store Branding</h2>
                    <p className="text-sm text-gray-500 font-medium">Upload your store logos. Use PNG or SVG for best quality.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Main Logo (Light Mode)</label>
                        <div className="flex items-start gap-6">
                           <label className="flex-1 h-[140px] bg-slate-50 border-2 border-dashed border-gray-200 hover:border-black rounded-xl overflow-hidden cursor-pointer relative flex flex-col items-center justify-center transition-all group">
                              {previews.logo ? (
                                <img src={previews.logo} alt="Logo" className="max-h-full max-w-full object-contain p-4" />
                              ) : (
                                <div className="text-center p-4">
                                   <UploadCloud className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                   <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Upload Light Logo</span>
                                </div>
                              )}
                              <input type="file" name="logoFile" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'logo')} />
                           </label>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Dark Mode Logo (Optional)</label>
                        <div className="flex items-start gap-6">
                           <label className="flex-1 h-[140px] bg-black border-2 border-dashed border-gray-700 hover:border-white rounded-xl overflow-hidden cursor-pointer relative flex flex-col items-center justify-center transition-all group">
                              {previews.logoDark ? (
                                <img src={previews.logoDark} alt="Logo Dark" className="max-h-full max-w-full object-contain p-4" />
                              ) : (
                                <div className="text-center p-4">
                                   <UploadCloud className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                   <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Upload Dark Logo</span>
                                </div>
                              )}
                              <input type="file" name="logoDarkFile" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'logoDark')} />
                           </label>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Hero Slider Section */}
               <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Homepage Hero Slider</h2>
                      <p className="text-sm text-gray-500 font-medium">Add multiple images to create an auto-scrolling hero section.</p>
                    </div>
                    <label className="h-10 px-6 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg flex items-center cursor-pointer transition-all active:scale-95 shadow-sm">
                       Add Slide
                       <input type="file" className="hidden" accept="image/*" onChange={addSliderImage} />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                     {sliderImages.map((img) => (
                        <div key={img.id} className="group relative aspect-video bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                           <img src={img.url} alt="Slider" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                type="button" 
                                onClick={() => removeSliderImage(img.id)}
                                className="w-10 h-10 bg-white text-red-600 rounded-full flex items-center justify-center hover:bg-red-50 transition-all font-bold"
                              >
                                <X className="w-5 h-5" />
                              </button>
                           </div>
                           <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">
                              Slide {sliderImages.indexOf(img) + 1}
                           </div>
                        </div>
                     ))}
                     {sliderImages.length === 0 && (
                        <div className="col-span-full py-16 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center gap-4">
                           <UploadCloud className="w-10 h-10 text-slate-200" />
                           <div className="text-center">
                              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No slider images uploaded</p>
                              <p className="text-xs text-slate-400 mt-1">The home screen will fallback to a static hero image.</p>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
          </div>

          {/* TAB 2: Shipping Options */}
          <div className={`${activeTab === "shipping" ? "" : "hidden"} space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-[400px]`}>
               <div className="flex justify-between items-center pb-2">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Shipping Methods</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">Configure delivery options shown at checkout. The first item becomes the default.</p>
                  </div>
                  <button type="button" onClick={addShippingMethod} className="h-10 px-5 bg-white border border-gray-300 shadow-sm rounded-md text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <span className="text-lg leading-none mb-0.5">+</span> Add Option
                  </button>
               </div>

               <div className="space-y-4">
                 {shippingMethods.map((method: any, i: number) => (
                    <div key={i} className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm relative group hover:border-gray-300 transition-colors">
                      <div className="grid grid-cols-2 gap-6 relative z-10">
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">Method Name *</label>
                            <Input value={method.name} onChange={e => updateMethod(i, "name", e.target.value)} required className="h-10 text-sm font-semibold border-gray-300" placeholder="e.g. Standard Delivery" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">Duration / Description</label>
                            <Input value={method.duration || ""} onChange={e => updateMethod(i, "duration", e.target.value)} className="h-10 text-sm font-medium border-gray-300" placeholder="e.g. 4-5 Business Days" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">Price (PKR)</label>
                            <div className="flex items-center gap-6">
                              <Input type="number" value={method.price || ""} disabled={method.isFree} onChange={e => updateMethod(i, "price", parseFloat(e.target.value))} className="h-10 text-sm font-medium border-gray-300 max-w-[140px]" placeholder="0" />
                              <label className="flex items-center gap-2 cursor-pointer mt-1">
                                 <input type="checkbox" checked={method.isFree} onChange={e => updateMethod(i, "isFree", e.target.checked)} className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded" />
                                 <span className="text-sm font-semibold text-gray-700">Free Shipping</span>
                              </label>
                            </div>
                         </div>
                      </div>

                      <button type="button" onClick={() => removeMethod(i)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all bg-white p-1 rounded-full border border-transparent hover:border-red-100 hover:bg-red-50 z-20">
                         <X className="w-4 h-4" />
                      </button>
                    </div>
                 ))}
                 
                 {shippingMethods.length === 0 && (
                   <div className="border border-dashed border-gray-300 rounded-xl p-12 text-center flex flex-col items-center justify-center bg-gray-50/50">
                      <h3 className="text-sm font-semibold text-gray-800 mb-2">No Shipping Options Provided</h3>
                      <p className="text-sm text-gray-500 max-w-sm mb-6">Customers will not be charged for delivery, or checkout might fail without a default rule.</p>
                      <Button type="button" onClick={addShippingMethod} variant="outline" className="h-10 border-gray-300">Create Option</Button>
                   </div>
                 )}
               </div>
          </div>

          {/* TAB 3: Order Settings */}
          <div className={`${activeTab === "order" ? "" : "hidden"} space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-[400px]`}>
               <div className="space-y-4 border-b border-gray-100 pb-8">
                 <h2 className="text-lg font-semibold text-gray-900">Order Contact Settings</h2>
                 
                 <div className="space-y-2 max-w-sm">
                   <label className="text-sm font-semibold text-gray-700">WhatsApp Order Number</label>
                   <Input name="whatsappNumber" defaultValue={initialSettings?.whatsappNumber || ""} placeholder="e.g. 923399880082" className="h-11 border-gray-300 font-medium" />
                   <p className="text-xs text-gray-500 leading-relaxed mt-2">
                     This number will be used for "WhatsApp Order" button on product pages. Include country code without + (e.g., 923...).
                   </p>
                 </div>
               </div>
          </div>

          {/* Fixed Footer Logic */}
          <div className="mt-12 flex items-center justify-end border-t border-gray-100 pt-6">
             <Button type="submit" disabled={loading} className="bg-slate-900 hover:bg-black text-white px-8 h-11 text-[13px] tracking-wide font-bold shadow-lg shadow-slate-200/50 rounded-lg transition-all active:scale-[0.98] min-w-[160px] flex items-center justify-center gap-2">
               {loading ? (
                 <>
                   <Loader2 className="w-4 h-4 animate-spin"/>
                   <span>Saving...</span>
                 </>
               ) : (
                 <>
                   <Save className="w-4 h-4" />
                   <span>Save Changes</span>
                 </>
               )}
             </Button>
          </div>

        </form>
      </div>
    </div>
  )
}
