"use server"

import prisma from "@/lib/prisma"

export async function getStoreCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    })
    return categories
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return []
  }
}

export async function searchStoreProducts(query: string) {
  if (!query) return []
  
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ]
      },
      include: {
        category: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" }
    })
    return products
  } catch (error) {
    console.error("Failed to search products:", error)
    return []
  }
}
