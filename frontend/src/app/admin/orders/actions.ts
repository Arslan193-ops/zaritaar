"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"

export async function getPaginatedOrders({ 
  page = 1, 
  pageSize = 10 
}: { 
  page?: number, 
  pageSize?: number 
}) {
  const session = await getSession()
  if (!session) {
    throw new Error("Unauthorized: Active session required.")
  }

  const validPage = Math.max(1, page)
  const skip = (validPage - 1) * pageSize

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            variant: {
              select: {
                sku: true,
                product: { select: { title: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize
    }),
    prisma.order.count()
  ])

  return {
    orders,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: page
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const session = await getSession()
    if (!hasPermission(session?.user?.role?.permissions || null, PERMISSIONS.ORDERS_EDIT)) {
      return { success: false, error: "Unauthorized: Missing 'orders:edit' capability." }
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })
    revalidatePath("/admin/orders")
    revalidatePath("/", "layout")
    return { success: true }
  } catch (error: any) {
    console.error("ORDER_UPDATE_ERROR:", error)
    return { success: false, error: error.message }
  }
}
