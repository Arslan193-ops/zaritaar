"use client"

import { useState } from "react"
import { updateAdsSettings } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Facebook, Music2, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

export default function AdsSettingsForm({
  settings
}: {
  settings: { facebookPixelId?: string | null, tiktokPixelId?: string | null }
}) {
  const [activeTab, setActiveTab] = useState<"facebook" | "tiktok">("facebook")
  const [fbPixel, setFbPixel] = useState(settings?.facebookPixelId || "")
  const [ttPixel, setTtPixel] = useState(settings?.tiktokPixelId || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  const handleSave = async () => {
    setIsSubmitting(true)
    setMessage(null)
    try {
      const res = await updateAdsSettings(fbPixel, ttPixel)
      if (res.success) {
        setMessage({ type: "success", text: "Pixel settings updated successfully!" })
      } else {
        setMessage({ type: "error", text: res.error || "Failed to update settings." })
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab("facebook")}
            className={`px-8 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === "facebook"
                ? "border-slate-900 text-slate-900 bg-slate-50/30"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
              }`}
          >
            <Facebook className="w-4 h-4" />
            Facebook Pixel
          </button>
          <button
            onClick={() => setActiveTab("tiktok")}
            className={`px-8 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === "tiktok"
                ? "border-slate-900 text-slate-900 bg-slate-50/30"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
              }`}
          >
            <Music2 className="w-4 h-4" />
            TikTok Pixel
          </button>
        </div>

        <div className="p-8 space-y-8">
          {message && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in zoom-in duration-200 ${message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
              }`}>
              {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="text-sm font-semibold">{message.text}</p>
            </div>
          )}

          {activeTab === "facebook" ? (
            <div className="space-y-6 animate-in slide-in-from-left-2 duration-300">
              <div>
                <h4 className="text-lg font-bold text-slate-900">Facebook Pixel Settings</h4>
                <p className="text-sm text-slate-500 mt-1">Configure your Facebook tracking integration.</p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Facebook Pixel ID</label>
                <Input
                  value={fbPixel}
                  onChange={e => setFbPixel(e.target.value)}
                  placeholder="e.g. 1878727759436206"
                  className="h-12 border-slate-200 bg-white focus-visible:ring-slate-900 shadow-sm"
                />
                <p className="text-xs text-slate-400 px-1 leading-relaxed">
                  This Pixel ID will be dynamically injected into the website. Leave blank to disable the pixel.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
              <div>
                <h4 className="text-lg font-bold text-slate-900">TikTok Pixel Settings</h4>
                <p className="text-sm text-slate-500 mt-1">Configure your TikTok tracking integration.</p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">TikTok Pixel ID</label>
                <Input
                  value={ttPixel}
                  onChange={e => setTtPixel(e.target.value)}
                  placeholder="e.g. C8X9J2H1G0F7E6D5"
                  className="h-12 border-slate-200 bg-white focus-visible:ring-slate-900 shadow-sm"
                />
                <p className="text-xs text-slate-400 px-1 leading-relaxed">
                  The TikTok pixel script will be added to your storefront automatically when an ID is provided.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-start pt-6 border-t border-slate-100">
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-slate-900 hover:bg-slate-800 text-white h-10 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-amber-500" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
