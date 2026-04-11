"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getPaginatedOrders({ 
  page = 1, 
  pageSize = 10 
}: { 
  page?: number, 
  pageSize?: number 
}) {
  const skip = (page - 1) * pageSize

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      include: {
        items: {
          include: { variant: { include: { product: true } } }
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
