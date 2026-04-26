"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"
import { client } from "@/lib/sanity"
import { uploadMultipleFilesToSanity, getSanityUrl } from "@/lib/sanity-upload"

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
  const validPage = Math.max(1, page)
  const skip = (validPage - 1) * pageSize
  
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
      select: {
        id: true,
        title: true,
        status: true,
        stock: true,
        basePrice: true,
        createdAt: true,
        category: {
          select: { name: true }
        },
        images: {
          select: { url: true },
          orderBy: { order: 'asc' },
          take: 1
        },
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
    if (basePrice < 0) throw new Error("Base price cannot be negative.")
    const discountedPriceStr = formData.get("discountedPrice") as string
    const discountedPrice = discountedPriceStr ? parseFloat(discountedPriceStr) : null
    const costPriceStr = formData.get("costPrice") as string
    const costPrice = costPriceStr ? parseFloat(costPriceStr) : null
    const stock = parseInt(formData.get("stock") as string) || 0
    const sku = formData.get("sku") as string || null
    const status = (formData.get("status") as string) || "PUBLISHED"
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
    
    const product = await prisma.product.create({
      data: {
        title,
        slug,
        description,
        basePrice,
        discountedPrice,
        costPrice,
        sku,
        stock,
        status,
        categoryId,
        sizeChart: JSON.stringify([]), // Will update after upload
      }
    })

    // 1. Upload Product Images to Sanity
    const imageAssetIds = await uploadMultipleFilesToSanity(formData, "imageFiles")
    
    // 2. Upload Size Chart Images to Sanity
    const sizeChartAssetIds = await uploadMultipleFilesToSanity(formData, "sizeChartFiles")
    
    // 3. Update Product in Sanity
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
      images: imageAssetIds.map((id: string, index: number) => ({
        _key: `img_${Date.now()}_${index}`,
        _type: 'image',
        asset: { _type: 'reference', _ref: id }
      })),
      sizeCharts: sizeChartAssetIds.map((id: string, index: number) => ({
        _key: `sc_${Date.now()}_${index}`,
        _type: 'image',
        asset: { _type: 'reference', _ref: id }
      })),
      category: categoryId ? { _type: 'string', value: categoryId } : null 
    })

    // 4. Final Sync to Prisma with URLs
    const sizeChartUrls = sizeChartAssetIds.map((id: string) => getSanityUrl(id))
    
    await prisma.product.update({
      where: { id: product.id },
      data: { 
        id: sanityProduct._id,
        sizeChart: JSON.stringify(sizeChartUrls) 
      }
    })
    
    // Create variants
    await handleVariantSync(product.id, formData)

    revalidatePath("/admin/products", "page")
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
    if (basePrice < 0) throw new Error("Base price cannot be negative.")
    const discountedPriceStr = formData.get("discountedPrice") as string
    const discountedPrice = discountedPriceStr ? parseFloat(discountedPriceStr) : null
    const costPriceStr = formData.get("costPrice") as string
    const costPrice = costPriceStr ? parseFloat(costPriceStr) : null
    const stock = parseInt(formData.get("stock") as string) || 0
    const sku = formData.get("sku") as string || null
    const status = (formData.get("status") as string) || "PUBLISHED"
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
    const imageAssetIds = await uploadMultipleFilesToSanity(formData, "imageFiles")
    const sizeChartAssetIds = await uploadMultipleFilesToSanity(formData, "sizeChartFiles")
    
    // Resolve existing images
    const existingImagesJson = formData.get("existingImages") as string
    const existingImages = JSON.parse(existingImagesJson || "[]")

    const existingChartsJson = formData.get("existingSizeChartInfo") as string
    const existingCharts = JSON.parse(existingChartsJson || "[]")

    // Update Sanity
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
      .set({
        images: [
          ...existingImages.map((img: any, idx: number) => ({
            _key: img._key || img.id || `img_ext_${idx}_${Date.now()}`,
            _type: 'image',
            asset: { _ref: img.assetId, _type: 'reference' }
          })).filter((img: any) => !!img.asset._ref),
          ...imageAssetIds.map((assetId: string, index: number) => ({
            _key: `img_new_${Date.now()}_${index}`,
            _type: 'image',
            asset: { _ref: assetId, _type: 'reference' }
          }))
        ],
        sizeCharts: [
          ...existingCharts.map((img: any, idx: number) => ({
            _key: img._key || img.id || `sc_ext_${idx}_${Date.now()}`,
            _type: 'image',
            asset: { _ref: img.assetId, _type: 'reference' }
          })).filter((img: any) => img.asset?._ref),
          ...sizeChartAssetIds.map((assetId: string, index: number) => ({
            _key: `sc_new_${Date.now()}_${index}`,
            _type: 'image',
            asset: { _ref: assetId, _type: 'reference' }
          }))
        ]
      })
      .commit()

    // Build the final size chart URL list for Prisma sync
    const newScUrls = sizeChartAssetIds.map((assetId: string) => getSanityUrl(assetId))
    const finalScUrls = [...existingCharts.map((c: any) => c.url), ...newScUrls]

    await prisma.product.update({
      where: { id },
      data: { sizeChart: JSON.stringify(finalScUrls) }
    })

    // Sync Variants (Delete all and recreate)
    await prisma.productVariant.deleteMany({ where: { productId: id } })
    await handleVariantSync(id, formData)

    revalidatePath("/admin/products", "page")
    revalidatePath(`/product/${id}`, "page")
    revalidatePath("/", "layout")
    return { success: true }
  } catch (error: any) {
    console.error("UPDATE_PRODUCT_ERROR:", error)
    return { success: false, error: error.message || "Unknown error occurred" }
  }
}

async function handleImageUploadsToSanity(formData: FormData, fieldName: string = "imageFiles") {
  const images = (formData.getAll(fieldName) as File[]).filter(img => img.size > 0)
  
  if (images.length === 0) return []

  // Run all uploads in parallel
  const uploadPromises = images.map(image => 
    client.assets.upload('image', image, {
      filename: image.name,
      contentType: image.type
    })
  )

  const assets = await Promise.all(uploadPromises)
  return assets.map(a => a._id)
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
          price: v.price ? Math.max(0, parseFloat(v.price)) : null,
          discountedPrice: v.discountedPrice ? Math.max(0, parseFloat(v.discountedPrice)) : null,
          stock: v.stock ? Math.max(0, parseInt(v.stock)) : 0,
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
    for (const id of ids) {
      await client.delete(id)
      await prisma.product.delete({
        where: { id }
      })
    }
    console.log("CRITICAL_DELETE_SUCCESSFUL")
    revalidatePath("/admin/products", "page")
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
    revalidatePath("/admin/products", "page")
    revalidatePath("/", "layout")
    return { success: true }
  } catch (error: any) {
    console.error("BULK_STATUS_ERROR:", error)
    return { success: false, error: error.message }
  }
}

