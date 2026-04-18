"use server"

import prisma from "@/lib/prisma"
import { getStoreSettings } from "./settings"

export async function getPublicSettings() {
  return await getStoreSettings()
}

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

export async function getStoreProducts(params: {
  sort?: string;
  min?: number;
  max?: number;
  inStock?: boolean;
  categoryId?: string;
  query?: string;
}) {
  const { sort = "newest", min, max, inStock, categoryId, query } = params;

  try {
    const whereClause: any = {
      status: "PUBLISHED",
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    if (min !== undefined || max !== undefined) {
      whereClause.basePrice = {};
      if (min !== undefined) whereClause.basePrice.gte = min;
      if (max !== undefined) whereClause.basePrice.lte = max;
    }

    if (inStock) {
      whereClause.stock = { gt: 0 };
    }

    let orderByClause: any = { createdAt: "desc" };
    if (sort === "price_asc") {
      orderByClause = { basePrice: "asc" };
    } else if (sort === "price_desc") {
      orderByClause = { basePrice: "desc" };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: {
        category: true,
        variants: true,
        images: true,
      },
    });

    return products;
  } catch (error) {
    console.error("Failed to fetch store products:", error);
    return [];
  }
}

export async function searchStoreProducts(query: string) {
  return getStoreProducts({ query });
}
