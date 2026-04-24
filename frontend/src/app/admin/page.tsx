import prisma from "@/lib/prisma"
import { Package, ShoppingCart, DollarSign, Users, Activity } from "lucide-react"
import { getSession } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  const session = await getSession()
  
  // Dashboard protection: If no permission, redirect to Products as a fallback
  if (!session || !hasPermission(session.user.role?.permissions || null, PERMISSIONS.DASHBOARD_VIEW)) {
    redirect("/admin/products")
  }

  const [totalRevenue, totalOrders, totalProducts, users] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: "CANCELLED" } } }),
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count()
  ])

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
           <p className="text-sm text-slate-500 mt-1">Overview of your store's performance.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200 shadow-sm">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           System Online
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">Gross Revenue</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">Rs. {(totalRevenue._sum.totalAmount || 0).toLocaleString()}</div>
            <p className="text-sm text-slate-500 mt-1">Total cumulative sales</p>
          </div>
        </div>
        
        {/* Orders Card */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">Total Orders</h3>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{totalOrders}</div>
            <p className="text-sm text-slate-500 mt-1">Processed transactions</p>
          </div>
        </div>

        {/* Products Card */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">Active Products</h3>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Package className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{totalProducts}</div>
            <p className="text-sm text-slate-500 mt-1">Items in inventory</p>
          </div>
        </div>

        {/* Users Card */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">Total Users</h3>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{users}</div>
            <p className="text-sm text-slate-500 mt-1">Registered accounts</p>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <div className="flex items-center gap-2 mb-4">
           <Activity className="w-5 h-5 text-slate-400" />
           <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {recentOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No orders found. Waiting for new activity.
            </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">Customer</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium text-right">Amount</th>
                      <th className="px-6 py-4 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.map((o: any) => (
                      <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{o.customerName}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right font-semibold text-slate-900 tabular-nums">
                          Rs. {o.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold
                            ${o.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              o.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                              o.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
