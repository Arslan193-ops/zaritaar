"use client"

import { updateOrderStatus } from "./actions"
import { toast } from "sonner"

export default function OrderStatusSelect({ orderId, initialStatus }: { orderId: string, initialStatus: string }) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
      case 'PROCESSING': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
      case 'SHIPPED': return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
      case 'DELIVERED': return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
      default: return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <select
      name="status"
      defaultValue={initialStatus}
      onChange={async (e) => {
        const newStatus = e.target.value
        const res = await updateOrderStatus(orderId, newStatus)
        if (!res.success) {
          toast.error(res.error)
        } else {
          toast.success(`Order status updated to ${newStatus}`)
        }
      }}
      className={`text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg border outline-none cursor-pointer transition-all duration-200 w-full md:w-40 shadow-sm focus:ring-2 focus:ring-slate-900 border-r-8 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_8px_center] !pr-8 ${getStatusStyles(initialStatus)}`}
    >
      <option value="PENDING" className="bg-white text-slate-900 font-medium">PENDING</option>
      <option value="PROCESSING" className="bg-white text-slate-900 font-medium">PROCESSING</option>
      <option value="SHIPPED" className="bg-white text-slate-900 font-medium">SHIPPED</option>
      <option value="DELIVERED" className="bg-white text-slate-900 font-medium">DELIVERED</option>
      <option value="CANCELLED" className="bg-white text-slate-900 font-medium">CANCELLED</option>
    </select>
  )
}

