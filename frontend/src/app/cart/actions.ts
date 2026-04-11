"use server"

import prisma from "@/lib/prisma"

export async function createOrder(data: {
  customerName: string
  customerEmail: string
  customerPhone?: string
  shippingStreet?: string
  shippingCity?: string
  shippingState?: string
  items: { productId: string, variantId?: string, quantity: number, price: number }[]
}) {
  try {
    const totalAmount = data.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    // Using Prisma $transaction to ensure atomicity (all updates succeed or all fail/rollback)
    // This prevents "Partial Orders" if the server crashes or stock updates fail.
    const order = await prisma.$transaction(async (tx) => {
      const orderItems = []

      for (const item of data.items) {
        // 1. ATOMIC STOCK VERIFICATION
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { title: true, stock: true }
        })

        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${product?.title || 'Unknown Product'}". Only ${product?.stock || 0} left.`)
        }

        // 2. VARIANT MANAGEMENT (Ensure a variant exists for the order item)
        let variantId = item.variantId
        if (!variantId) {
          const v = await tx.productVariant.findFirst({ where: { productId: item.productId }})
          variantId = v?.id
        }

        if (!variantId) {
          const v = await tx.productVariant.create({
            data: {
              productId: item.productId,
              sku: `DEF-${item.productId.slice(0,5)}`
            }
          })
          variantId = v.id
        }

        // 3. DECREMENT STOCK
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })

        orderItems.push({
          variantId: variantId,
          quantity: item.quantity,
          price: item.price
        })
      }

      // 4. CREATE ORDER
      return await tx.order.create({
        data: {
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          shippingStreet: data.shippingStreet,
          shippingCity: data.shippingCity,
          shippingState: data.shippingState,
          totalAmount,
          status: "PENDING",
          items: {
            create: orderItems
          }
        }
      })
    })

    return { success: true, orderId: order.id }
  } catch (error: any) {
    console.error("ORDER_HARDENING_ERROR:", error.message)
    return { success: false, error: error.message || "Checkout failed. Please try again." }
  }
}
