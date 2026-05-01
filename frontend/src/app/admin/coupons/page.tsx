import { getCoupons } from "./actions"
import Link from "next/link"
import { Plus, Tag } from "lucide-react"

export default async function CouponsPage() {
  const coupons = await getCoupons()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
          <p className="text-sm text-gray-500">Manage discount codes and promotions.</p>
        </div>
        <Link 
          href="/admin/coupons/new"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Coupon
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Usage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Tag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-base font-medium text-gray-900">No coupons found</p>
                    <p className="text-sm mt-1">Get started by creating a new discount code.</p>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{coupon.code}</td>
                    <td className="px-6 py-4">
                      {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `Rs. ${coupon.discountValue}`}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {coupon.currentUses} / {coupon.maxUses || "∞"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full ${
                        coupon.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/coupons/${coupon.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                        Edit
                      </Link>
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
