"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { saveCoupon, deleteCoupon } from "./actions"
import Link from "next/link"
import { ArrowLeft, Trash2 } from "lucide-react"

export function CouponForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    code: initialData?.code || "",
    discountType: initialData?.discountType || "PERCENTAGE",
    discountValue: initialData?.discountValue || "",
    maxUses: initialData?.maxUses || "",
    isActive: initialData?.isActive ?? true,
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    if (!formData.code || !formData.discountValue) {
      toast.error("Code and discount value are required.")
      setLoading(false)
      return
    }

    const res = await saveCoupon(formData)
    setLoading(false)
    if (res.success) {
      toast.success("Coupon saved successfully")
      router.push("/admin/coupons")
      router.refresh()
    } else {
      toast.error(res.error || "Failed to save coupon")
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this coupon?")) return
    setLoading(true)
    const res = await deleteCoupon(formData.id)
    if (res.success) {
      toast.success("Coupon deleted")
      router.push("/admin/coupons")
      router.refresh()
    } else {
      toast.error(res.error || "Failed to delete")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/coupons" className="flex items-center text-sm text-gray-500 hover:text-black transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Coupons
        </Link>
        {initialData && (
          <button onClick={handleDelete} disabled={loading} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center text-sm font-medium">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{initialData ? "Edit Coupon" : "Create Coupon"}</h1>
          <p className="text-sm text-gray-500 mt-1">Configure discount rules and usage limits.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Coupon Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl uppercase focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all"
                placeholder="e.g. WELCOME10"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Status</label>
              <select
                value={formData.isActive ? "true" : "false"}
                onChange={e => setFormData({...formData, isActive: e.target.value === "true"})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={e => setFormData({...formData, discountType: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (Rs.)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Discount Value</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.discountValue}
                onChange={e => setFormData({...formData, discountValue: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all"
                placeholder={formData.discountType === "PERCENTAGE" ? "10" : "500"}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Max Uses (Global)</label>
              <input
                type="number"
                min="1"
                value={formData.maxUses}
                onChange={e => setFormData({...formData, maxUses: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all"
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Start Date (Optional)</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">End Date (Optional)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
