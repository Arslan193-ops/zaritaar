"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"

export async function getCoupons() {
  const session = await getSession()
  if (!hasPermission(session?.user?.role?.permissions || null, PERMISSIONS.PRODUCTS_VIEW)) {
    throw new Error("Unauthorized")
  }
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" }
  })
}

export async function getCoupon(id: string) {
  const session = await getSession()
  if (!hasPermission(session?.user?.role?.permissions || null, PERMISSIONS.PRODUCTS_VIEW)) {
    throw new Error("Unauthorized")
  }
  return prisma.coupon.findUnique({ where: { id } })
}

export async function saveCoupon(data: any) {
  const session = await getSession()
  if (!hasPermission(session?.user?.role?.permissions || null, PERMISSIONS.PRODUCTS_EDIT)) {
    return { success: false, error: "Unauthorized" }
  }
  
  const couponData = {
    code: data.code.toUpperCase(),
    discountType: data.discountType,
    discountValue: parseFloat(data.discountValue),
    maxUses: data.maxUses ? parseInt(data.maxUses) : null,
    isActive: data.isActive,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
  }

  try {
    if (data.id) {
      await prisma.coupon.update({
        where: { id: data.id },
        data: couponData
      })
    } else {
      await prisma.coupon.create({
        data: couponData
      })
    }
    revalidatePath("/admin/coupons")
    return { success: true }
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: "Coupon code already exists." }
    return { success: false, error: error.message }
  }
}

export async function deleteCoupon(id: string) {
  const session = await getSession()
  if (!hasPermission(session?.user?.role?.permissions || null, PERMISSIONS.PRODUCTS_DELETE)) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    await prisma.coupon.delete({ where: { id } })
    revalidatePath("/admin/coupons")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
