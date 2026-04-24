"use server"

import prisma from "./prisma"
import { getStoreSettings } from "./settings"
import { client, urlFor } from "./sanity"

export async function getPublicSettings() {
  return await getStoreSettings()
}

export async function getStoreCategories() {
  try {
    const categories = await (client as any).fetch(`*[_type == "category"] | order(name asc) {
      "id": _id,
      name,
      "slug": slug.current,
      "image": image.asset->url,
      imageUrl
    }`)
    return categories
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return []
  }
}

export interface BaseProduct {
  id: string
  title: string
  basePrice: number
  categoryId: string | null
  categoryName?: string
  image: any
  status: string
}

export interface DetailedProduct extends BaseProduct {
  description: string
  artistry: string
  shippingInfo: string
  images: any[]
  variants: any[]
  categoryName: string
  categorySlug: string | null
  relatedProducts: BaseProduct[]
  stock: number
  sizeChart?: string
  sku?: string | null
  freeShipping?: boolean
}

export interface ProductFilters {
  categoryId?: string
  sort?: string
  min?: number
  max?: number
  inStock?: boolean
}

export async function getStoreProducts(filters: ProductFilters = {}): Promise<BaseProduct[]> {
  const { categoryId, sort, min, max, inStock } = filters

  // 1. Source of Truth: Prisma for Status and Metadata
  const dbProducts = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      ...(categoryId ? { categoryId } : {}),
      ...(min !== undefined || max !== undefined ? {
        basePrice: {
          ...(min !== undefined ? { gte: min } : {}),
          ...(max !== undefined ? { lte: max } : {}),
        }
      } : {}),
      ...(inStock ? { stock: { gt: 0 } } : {}),
    },
    orderBy: sort === "newest" ? { createdAt: "desc" } : sort === "price_desc" ? { basePrice: "desc" } : { basePrice: "asc" },
    select: {
      id: true,
      title: true,
      basePrice: true,
      categoryId: true,
      status: true,
      category: { select: { name: true } }
    },
  })

  if (dbProducts.length === 0) return []

  // 2. Optimization: Batch fetch Sanity images for active products in ONE roundtrip
  try {
    const ids = dbProducts.map(p => p.id)
    const sanityData = await (client as any).fetch(`*[_id in $ids] { _id, images }`, { ids })

    return dbProducts.map((p) => {
      const sanityProduct = sanityData.find((s: any) => s._id === p.id)
      return {
        id: p.id,
        title: p.title,
        basePrice: p.basePrice,
        categoryId: p.categoryId,
        categoryName: (p as any).category?.name,
        image: sanityProduct?.images?.[0] || null,
        status: p.status,
      }
    })
  } catch (error) {
    console.error("Sanity merge error:", error)
    // Fallback to Prisma data if Sanity fails
    return dbProducts.map((p) => ({
      id: p.id,
      title: p.title,
      basePrice: p.basePrice,
      categoryId: p.categoryId,
      categoryName: (p as any).category?.name,
      image: null,
      status: p.status,
    }))
  }
}

export async function searchStoreProducts(query: string) {
  const dbProducts = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      title: true,
      basePrice: true,
      categoryId: true,
      status: true,
      category: { select: { name: true } }
    },
  })

  if (dbProducts.length === 0) return []

  try {
    const ids = dbProducts.map(p => p.id)
    const sanityData = await (client as any).fetch(`*[_id in $ids] { _id, images }`, { ids })

    return dbProducts.map((p) => {
      const sanityProduct = sanityData.find((s: any) => s._id === p.id)
      return {
        id: p.id,
        title: p.title,
        basePrice: p.basePrice,
        categoryId: p.categoryId,
        categoryName: (p as any).category?.name,
        image: sanityProduct?.images?.[0] || null,
        status: p.status,
      }
    })
  } catch (error) {
    return dbProducts.map((p) => ({
      id: p.id,
      title: p.title,
      basePrice: p.basePrice,
      categoryId: p.categoryId,
      categoryName: (p as any).category?.name,
      image: null,
      status: p.status,
    }))
  }
}

export async function getDetailedProduct(id: string): Promise<DetailedProduct | null> {
  const product = await client.fetch(`*[_type == "product" && (_id == $id || slug.current == $id)][0]{
    _id,
    title,
    basePrice,
    description,
    artistry,
    shippingInfo,
    "category": category->{name, _id, "slug": slug.current},
    images[]{
      _key,
      _type,
      asset,
      "ratio": asset->metadata.dimensions.aspectRatio
    }
  }`, { id })

  if (!product) return null

  // Run secondary DB and Sanity queries concurrently
  const [dbProduct, dbVariants, relatedProductsRes] = await Promise.all([
    prisma.product.findUnique({ where: { id: product._id } }),
    prisma.productVariant.findMany({ where: { productId: product._id } }),
    client.fetch(
      `*[_type == "product" && category._ref == $categoryId && _id != $id][0...8]{
        _id, title, "slug": slug.current, basePrice, "images": images[0...1]{_key, _type, asset}, "category": category->{name}
      }`, 
      { categoryId: product.category?._id || "", id: product._id }
    )
  ])

  let relatedProductsRaw = relatedProductsRes;
  if (relatedProductsRaw.length === 0) {
    relatedProductsRaw = await client.fetch(
      `*[_type == "product" && _id != $id][0...8]{
        _id, title, "slug": slug.current, basePrice, "images": images[0...1]{_key, _type, asset}, "category": category->{name}
      }`, 
      { id: product._id }
    )
  }

  const relatedProducts = relatedProductsRaw.map((p: any) => ({
    id: p._id,
    title: p.title,
    basePrice: p.basePrice,
    categoryId: product.category?._id || null,
    image: p.images[0]?.url || p.imageUrl || null,
    status: "PUBLISHED"
  }))

  return {
    id: product._id,
    title: product.title,
    basePrice: product.basePrice,
    image: product.images?.[0] || null,
    status: dbProduct?.status || "PUBLISHED",
    description: product.description,
    artistry: product.artistry,
    shippingInfo: product.shippingInfo,
    images: product.images,
    variants: dbVariants,
    categoryId: product.category?._id || null,
    categoryName: product.category?.name || "Pret",
    categorySlug: product.category?.slug || null,
    relatedProducts,
    stock: dbProduct?.stock ?? 0,
    sizeChart: dbProduct?.sizeChart ?? undefined,
    sku: dbProduct?.sku || null,
    freeShipping: dbProduct?.freeShipping ?? false
  }
}
