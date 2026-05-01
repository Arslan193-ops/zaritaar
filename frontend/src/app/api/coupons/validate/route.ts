import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { code, email } = await req.json()

    if (!code) return NextResponse.json({ success: false, error: "Code is required" })

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ success: false, error: "Invalid or inactive coupon code." })
    }
    
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return NextResponse.json({ success: false, error: "This coupon has reached its usage limit." })
    }
    
    const now = new Date()
    if (coupon.startDate && now < coupon.startDate) {
      return NextResponse.json({ success: false, error: "This coupon is not active yet." })
    }
    if (coupon.endDate && now > coupon.endDate) {
      return NextResponse.json({ success: false, error: "This coupon has expired." })
    }

    if (email) {
      const previousUse = await prisma.order.findFirst({
         where: { customerEmail: email, couponId: coupon.id, status: { not: "CANCELLED" } }
      })
      if (previousUse) {
         return NextResponse.json({ success: false, error: "You have already used this coupon code." })
      }
    }

    return NextResponse.json({ 
      success: true, 
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to validate coupon." })
  }
}
