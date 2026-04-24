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
    // Remove client-side total calculation
    // const totalAmount = data.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    // Using Prisma $transaction to ensure atomicity
    const order = await prisma.$transaction(async (tx) => {
      const orderItems = []
      let serverTotalAmount = 0

      for (const item of data.items) {
        // 1. ATOMIC STOCK VERIFICATION & SECURE PRICE FETCHING
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { title: true, stock: true, basePrice: true, discountedPrice: true }
        })

        if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
          throw new Error(`Invalid quantity for "${product?.title || 'Unknown Product'}".`)
        }

        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${product?.title || 'Unknown Product'}". Only ${product?.stock || 0} left.`)
        }

        // 2. VARIANT MANAGEMENT & PRICE RESOLUTION
        let variantId = item.variantId
        let variantPrice = null

        if (variantId) {
          const v = await tx.productVariant.findUnique({ where: { id: variantId }})
          if (v) variantPrice = v.discountedPrice || v.price
        } else {
          const v = await tx.productVariant.findFirst({ where: { productId: item.productId }})
          variantId = v?.id
          if (v) variantPrice = v.discountedPrice || v.price
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

        // Determine final secure price
        const finalPrice = variantPrice ?? (product.discountedPrice ?? product.basePrice)
        serverTotalAmount += finalPrice * item.quantity

        // 3. DECREMENT STOCK
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })

        orderItems.push({
          variantId: variantId,
          quantity: item.quantity,
          price: finalPrice // Use DB verified price
        })
      }

      // 4. CREATE ORDER WITH SECURE TOTAL
      return await tx.order.create({
        data: {
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          shippingStreet: data.shippingStreet,
          shippingCity: data.shippingCity,
          shippingState: data.shippingState,
          totalAmount: serverTotalAmount,
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

export async function getOrderStatus(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
      return { success: false, error: "Order not found" }
    }

    return { success: true, order }
  } catch (error: any) {
    console.error("GET_ORDER_STATUS_ERROR:", error.message)
    return { success: false, error: "Failed to fetch order status" }
  }
}
