"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendOrderConfirmationEmail } from "@/lib/mail"

export async function createOrder(data: {
  customerName: string
  customerEmail: string
  customerPhone?: string
  shippingStreet?: string
  shippingCity?: string
  shippingState?: string
  items: { productId: string, variantId?: string, quantity: number, price: number }[]
  couponCode?: string
}) {
  try {
    const order = await prisma.$transaction(async (tx) => {
      const orderItems = []
      let serverTotalAmount = 0

      for (const item of data.items) {
        if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
          throw new Error(`Invalid quantity for product.`)
        }

        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { title: true, stock: true, basePrice: true, discountedPrice: true }
        })

        if (!product) {
          throw new Error(`Product not found.`)
        }

        let variantId = item.variantId
        let variantPrice = null
        let availableStock = product.stock

        if (variantId) {
          const v = await tx.productVariant.findUnique({ where: { id: variantId }})
          if (v) {
             variantPrice = v.discountedPrice || v.price
             // Use variant stock if we have variants
             availableStock = v.stock
          }
        } else {
          const v = await tx.productVariant.findFirst({ where: { productId: item.productId }})
          if (v) {
             variantId = v.id
             variantPrice = v.discountedPrice || v.price
             availableStock = v.stock
          } else {
             // Create default variant if none exists
             const newV = await tx.productVariant.create({
               data: { productId: item.productId, sku: `DEF-${item.productId.slice(0,5)}`, stock: product.stock }
             })
             variantId = newV.id
          }
        }

        if (availableStock < item.quantity) {
          throw new Error(`Insufficient stock for "${product.title}". Only ${availableStock} left.`)
        }

        const finalPrice = variantPrice ?? (product.discountedPrice ?? product.basePrice)
        serverTotalAmount += finalPrice * item.quantity

        // ATOMIC STOCK DECREMENT (Prevents race conditions)
        if (variantId) {
           const updateResult = await tx.productVariant.updateMany({
             where: { id: variantId, stock: { gte: item.quantity } },
             data: { stock: { decrement: item.quantity } }
           })
           if (updateResult.count === 0) {
             throw new Error(`Insufficient stock for "${product.title}". It may have been purchased by another customer just now.`)
           }
        } else {
           const updateResult = await tx.product.updateMany({
             where: { id: item.productId, stock: { gte: item.quantity } },
             data: { stock: { decrement: item.quantity } }
           })
           if (updateResult.count === 0) {
             throw new Error(`Insufficient stock for "${product.title}". It may have been purchased by another customer just now.`)
           }
        }

        orderItems.push({
          variantId: variantId!,
          quantity: item.quantity,
          price: finalPrice
        })
      }

      // COUPON LOGIC
      let discountAmount = 0
      let appliedCouponId = null

      if (data.couponCode) {
        const coupon = await tx.coupon.findUnique({
           where: { code: data.couponCode }
        })

        if (!coupon || !coupon.isActive) {
           throw new Error("Invalid or inactive coupon code.")
        }
        
        if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
           throw new Error("This coupon has reached its usage limit.")
        }
        
        const now = new Date()
        if (coupon.startDate && now < coupon.startDate) throw new Error("This coupon is not active yet.")
        if (coupon.endDate && now > coupon.endDate) throw new Error("This coupon has expired.")

        // Prevent single user from using it multiple times (per-email limit)
        const previousUse = await tx.order.findFirst({
           where: { customerEmail: data.customerEmail, couponId: coupon.id, status: { not: "CANCELLED" } }
        })
        if (previousUse) {
           throw new Error("You have already used this coupon code.")
        }

        if (coupon.discountType === "PERCENTAGE") {
           discountAmount = serverTotalAmount * (coupon.discountValue / 100)
        } else {
           discountAmount = coupon.discountValue
        }

        if (discountAmount > serverTotalAmount) discountAmount = serverTotalAmount

        serverTotalAmount -= discountAmount
        appliedCouponId = coupon.id

        await tx.coupon.update({
           where: { id: coupon.id },
           data: { currentUses: { increment: 1 } }
        })
      }

      return await tx.order.create({
        data: {
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          shippingStreet: data.shippingStreet,
          shippingCity: data.shippingCity,
          shippingState: data.shippingState,
          totalAmount: serverTotalAmount,
          discountAmount: discountAmount,
          couponId: appliedCouponId,
          status: "PENDING",
          items: {
            create: orderItems
          }
        }
      })
    })

    // Send Order Confirmation Email via Brevo
    await sendOrderConfirmationEmail({
      toEmail: order.customerEmail,
      customerName: order.customerName,
      orderId: order.id,
      totalAmount: order.totalAmount
    }).catch(err => console.error("Email trigger failed:", err));

    revalidatePath("/admin/products", "page")
    revalidatePath(`/product`, "layout")

    return { success: true, orderId: order.id }
  } catch (error: any) {
    console.error("ORDER_ERROR:", error.message)
    return { success: false, error: error.message || "Checkout failed. Please try again." }
  }
}

export async function getOrderStatus(orderId: string) {
  try {
    if (!orderId) {
      return { success: false, error: "Order ID is required." }
    }

    const order = await prisma.order.findUnique({
      where: { 
        id: orderId,
      },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        customerName: true,
        shippingStreet: true,
        shippingCity: true,
        shippingState: true,
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            variant: {
              select: {
                id: true,
                attributes: true,
                imageUrl: true,
                product: {
                  select: {
                    id: true,
                    title: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!order) {
      return { success: false, error: "Order not found with provided ID and Email." }
    }

    return { success: true, order }
  } catch (error: any) {
    console.error("GET_ORDER_STATUS_ERROR:", error.message)
    return { success: false, error: "Failed to fetch order status" }
  }
}
