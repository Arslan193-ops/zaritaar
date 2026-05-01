import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getPaginatedOrders } from "./actions"
import OrderStatusSelect from "./OrderStatusSelect"

export const dynamic = "force-dynamic"

export default async function OrdersPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string }> 
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  
  const { orders, totalPages, total, currentPage } = await getPaginatedOrders({
    page,
    pageSize: 10
  })

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders</h1>
           <p className="text-sm text-slate-500 mt-1">Found {total} orders across {totalPages} pages.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200 shadow-sm">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           Sync Active
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Order ID</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Customer</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Date</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Amount</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No orders found in this period.
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                       <span className="font-mono text-[10px] font-black tracking-widest text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                          #{order.id.slice(-8).toUpperCase()}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 tracking-tight">{order.customerName}</div>
                        <div className="text-[11px] font-medium text-slate-500 tracking-tight">{order.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tabular-nums">
                       {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 tabular-nums uppercase">
                       Rs. {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusSelect orderId={order.id} initialStatus={order.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex flex-col gap-0.5">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order Archive</p>
             <p className="text-sm font-black text-slate-900 italic">{currentPage} <span className="text-slate-300 font-medium not-italic mx-1">of</span> {totalPages}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Link 
              href={`/admin/orders?page=${currentPage - 1}`}
              className={`p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm ${currentPage <= 1 ? 'pointer-events-none opacity-30' : ''}`}
            >
              <ChevronLeft className="w-4 h-4 text-slate-900" />
            </Link>
            <Link 
              href={`/admin/orders?page=${currentPage + 1}`}
              className={`p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm ${currentPage >= totalPages ? 'pointer-events-none opacity-30' : ''}`}
            >
              <ChevronRight className="w-4 h-4 text-slate-900" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

