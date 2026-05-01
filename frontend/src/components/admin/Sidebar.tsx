"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ShieldAlert,
  FolderTree,
  Megaphone,
  Tag
} from "lucide-react"
import { logout } from "@/app/admin/users/actions"
import { hasPermission, PERMISSIONS, Permission } from "@/lib/permissions"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW, exact: true },
  { name: "Products", href: "/admin/products", icon: ShoppingBag, permission: PERMISSIONS.PRODUCTS_VIEW },
  { name: "Coupons", href: "/admin/coupons", icon: Tag, permission: PERMISSIONS.PRODUCTS_VIEW },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart, permission: PERMISSIONS.ORDERS_VIEW },
  { name: "Categories", href: "/admin/categories", icon: FolderTree, permission: PERMISSIONS.CATEGORIES_VIEW },
  { name: "Users", href: "/admin/users", icon: Users, permission: PERMISSIONS.USERS_VIEW },
  { name: "Roles", href: "/admin/roles", icon: ShieldAlert, permission: PERMISSIONS.ROLES_VIEW },
  { name: "Ads Settings", href: "/admin/settings/ads", icon: Megaphone, permission: PERMISSIONS.ADS_VIEW },
  { name: "Settings", href: "/admin/settings", icon: Settings, permission: PERMISSIONS.SETTINGS_VIEW, exact: true }
]

export function Sidebar({ permissions }: { permissions: string }) {
  const pathname = usePathname()
  const filteredNavItems = navItems.filter(item => {
    if (!item.permission) return true
    return hasPermission(permissions, item.permission as Permission)
  })

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-20">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <span className="text-lg font-bold text-slate-900 tracking-tight">
          MyStore <span className="text-slate-400 font-medium font-mono text-sm ml-1">Admin</span>
        </span>
      </div>
      <nav className="flex-1 py-6 flex flex-col gap-1 px-4 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon
          const isActive = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className={cn(
                "w-4 h-4 transition-colors",
                isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"
              )} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <form action={logout}>
          <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
