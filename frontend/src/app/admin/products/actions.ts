"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"
import { client } from "@/lib/sanity"

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: "asc" }
  })
}

export async function getPaginatedProducts({ 
  page = 1, 
  pageSize = 10, 
  search = "", 
  status = "all" 
}: { 
  page?: number, 
  pageSize?: number, 
  search?: string, 
  status?: string 
}) {
  const skip = (page - 1) * pageSize
  
  const where: any = {}
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { sku: { contains: search } }
    ]
  }
  if (status !== "all") {
    where.status = status.toUpperCase()
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: true,
        images: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.product.count({ where })
  ])

  return {
    products,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: page
  }
}

export async function getProduct(id: string) {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: true,
      images: { orderBy: { order: "asc" } }
    }
  })
}

export async function createProduct(formData: FormData) {
  try {
    const session = await getSession()
    if (!hasPermission(session?.user?.role?.permissions || null, PERMISSIONS.PRODUCTS_CREATE)) {
      return { success: false, error: "Unauthorized: Missing 'products:create' capability." }
    }

    const title = formData.get("title") as string
    const slug = formData.get("slug") as string || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    const description = formData.get("description") as string || ""
    const basePrice = parseFloat(formData.get("basePrice") as string) || 0
    const discountedPriceStr = formData.get("discountedPrice") as string
    const discountedPrice = discountedPriceStr ? parseFloat(discountedPriceStr) : null
    const costPriceStr = formData.get("costPrice") as string
    const costPrice = costPriceStr ? parseFloat(costPriceStr) : null
    const stock = parseInt(formData.get("stock") as string) || 0
    const sku = formData.get("sku") as string || null
    const status = (formData.get("status") as string) || "DRAFT"
    const categoryId = (formData.get("categoryId") as string) || null
    const sizeChart = formData.get("sizeChart") as string || null
    const attributes = formData.get("attributes") as string || null
    const tags = formData.get("tags") as string || null
    const metaTitle = formData.get("metaTitle") as string || null
    const metaDescription = formData.get("metaDescription") as string || null
    const keywords = formData.get("keywords") as string || null
    
    const showSizeSelector = formData.get("showSizeSelector") === "true"
    const showColorSelector = formData.get("showColorSelector") === "true"
    const freeShipping = formData.get("freeShipping") === "true"
    const isFeatured = formData.get("isFeatured") === "true"
    
    // 1. Upload Images to Sanity First
    const imageAssetIds = await handleImageUploadsToSanity(formData)
    
    // 2. Create Product in Sanity (The "Content" Database)
    const sanityProduct = await client.create({
      _type: 'product',
      title,
      slug: { _type: 'slug', current: slug },
      description,
      basePrice,
      discountedPrice,
      stock,
      sku,
      status,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      showSizeSelector,
      showColorSelector,
      freeShipping,
      isFeatured,
      images: imageAssetIds.map((id, index) => ({
        _key: `img_${Date.now()}_${index}`,
        _type: 'image',
        asset: { _type: 'reference', _ref: id }
      })),
      // Store the Prisma Category ID if needed, or link to Sanity category
      category: categoryId ? { _type: 'string', value: categoryId } : null 
    })

    // 3. Keep a "Lite" version in Prisma for lightning-fast relational lookups (optional but recommended for checkout)
    const product = await prisma.product.create({
      data: {
        id: sanityProduct._id, // Sync IDs
        title,
        slug,
        description,
        basePrice,
        discountedPrice,
        sku,
        stock,
        status,
        categoryId,
      }
    })
    
    // Create variants
    await handleVariantSync(product.id, formData)

    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: any) {
    console.error("CREATE_PRODUCT_ERROR:", error)
    return { success: false, error: error.message || "Unknown error occurred" }
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const session = await getSession()
    if (!hasPermission(session?.user?.role?.permissions || null, PERMISSIONS.PRODUCTS_EDIT)) {
      return { success: false, error: "Unauthorized: Missing 'products:edit' capability." }
    }

    const title = formData.get("title") as string
    const slug = formData.get("slug") as string || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    const description = formData.get("description") as string || ""
    const basePriceStr = formData.get("basePrice") as string
    const basePrice = basePriceStr ? parseFloat(basePriceStr) : 0
    const discountedPriceStr = formData.get("discountedPrice") as string
    const discountedPrice = discountedPriceStr ? parseFloat(discountedPriceStr) : null
    const costPriceStr = formData.get("costPrice") as string
    const costPrice = costPriceStr ? parseFloat(costPriceStr) : null
    const stock = parseInt(formData.get("stock") as string) || 0
    const sku = formData.get("sku") as string || null
    const status = (formData.get("status") as string) || "DRAFT"
    const categoryId = (formData.get("categoryId") as string) || null
    const sizeChart = formData.get("sizeChart") as string || null
    const attributes = formData.get("attributes") as string || null
    const tags = formData.get("tags") as string || null
    const metaTitle = formData.get("metaTitle") as string || null
    const metaDescription = formData.get("metaDescription") as string || null
    const keywords = formData.get("keywords") as string || null
    
    const showSizeSelector = formData.get("showSizeSelector") === "true"
    const showColorSelector = formData.get("showColorSelector") === "true"
    const freeShipping = formData.get("freeShipping") === "true"
    const isFeatured = formData.get("isFeatured") === "true"

    if (isNaN(basePrice)) throw new Error("Invalid Price format")

    await prisma.product.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        basePrice: parseFloat(basePrice.toFixed(2)),
        discountedPrice,
        costPrice,
        sku,
        stock,
        status,
        categoryId,
        sizeChart,
        attributes,
        tags,
        metaTitle,
        metaDescription,
        keywords,
        showSizeSelector,
        showColorSelector,
        freeShipping,
        isFeatured,
      }
    })
    
    console.log("UPDATE_SUCCESSFUL:", id)

    // Handle NEW images to Sanity
    const imageAssetIds = await handleImageUploadsToSanity(formData)
    
    // Update Sanity Document
    await client.patch(id)
      .set({
        title,
        description,
        basePrice,
        discountedPrice,
        stock,
        sku,
        status,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        showSizeSelector,
        showColorSelector,
        freeShipping,
        isFeatured,
      })
      .append('images', imageAssetIds.map((assetId, index) => ({
        _key: `img_${Date.now()}_${index}`,
        _type: 'image',
        asset: { _ref: assetId, _type: 'reference' }
      })))
      .commit()

    // Sync Variants (Delete all and recreate)
    await prisma.productVariant.deleteMany({ where: { productId: id } })
    await handleVariantSync(id, formData)

    revalidatePath("/admin/products")
    revalidatePath(`/product/${id}`)
    revalidatePath("/", "layout")
    return { success: true }
  } catch (error: any) {
    console.error("UPDATE_PRODUCT_ERROR:", error)
    return { success: false, error: error.message || "Unknown error occurred" }
  }
}

async function handleImageUploadsToSanity(formData: FormData) {
  const images = formData.getAll("imageFiles") as File[]
  const assetIds: string[] = []

  for (const image of images) {
    if (image.size === 0) continue
    
    // Sanity handles the shrinking/optimization automatically here!
    const asset = await client.assets.upload('image', image, {
      filename: image.name,
      contentType: image.type
    })
    assetIds.push(asset._id)
  }
  return assetIds
}

async function handleVariantSync(productId: string, formData: FormData) {
  const variantsStr = formData.get("variants") as string
  if (!variantsStr) return

  const variants = JSON.parse(variantsStr)
  const attributesStr = formData.get("attributes") as string
  const attributes = JSON.parse(attributesStr || "[]")

  for (const v of variants) {
    const variantAttributes: Record<string, string> = {}
    attributes.forEach((attr: any) => {
      if (v[attr.name]) variantAttributes[attr.name] = v[attr.name]
    })

    if (Object.keys(variantAttributes).length > 0) {
      await prisma.productVariant.create({
        data: {
          productId: productId,
          attributes: JSON.stringify(variantAttributes),
          sku: v.sku || null,
          price: v.price ? parseFloat(v.price) : null,
          discountedPrice: v.discountedPrice ? parseFloat(v.discountedPrice) : null,
          stock: v.stock ? parseInt(v.stock) : 0,
          imageUrl: v.imageUrl || null
        }
      })
    }
  }
}

export async function deleteProducts(ids: string[]) {
  try {
    const session = await getSession()
    if (!hasPermission(session?.user?.role?.permissions || null, PERMISSIONS.PRODUCTS_DELETE)) {
      return { success: false, error: "Unauthorized: Missing 'products:delete' capability." }
    }

    console.log("CRITICAL_DELETE_INITIATED:", ids)
    // Sequential deletion in a loop to guarantee SQLite stability and trigger all cascades
    for (const id of ids) {
      await prisma.product.delete({
        where: { id }
      })
    }
    console.log("CRITICAL_DELETE_SUCCESSFUL")
    revalidatePath("/admin/products")
    revalidatePath("/", "layout")
    return { success: true }
  } catch (error: any) {
    console.error("CRITICAL_DELETE_ERROR:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      ids
    })
    return { success: false, error: `Deletion failed: ${error.message}` }
  }
}

export async function updateProductsStatus(ids: string[], status: string) {
  try {
    const session = await getSession()
    if (!hasPermission(session?.user?.role?.permissions || null, PERMISSIONS.PRODUCTS_EDIT)) {
      return { success: false, error: "Unauthorized: Missing 'products:edit' capability." }
    }

    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { status }
    })
    revalidatePath("/admin/products")
    revalidatePath("/", "layout")
    return { success: true }
  } catch (error: any) {
    console.error("BULK_STATUS_ERROR:", error)
    return { success: false, error: error.message }
  }
}

