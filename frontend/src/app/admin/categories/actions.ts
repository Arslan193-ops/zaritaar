"use server"

import prisma from "@/lib/prisma"
import { revalidatePath, revalidateTag } from "next/cache"
import { client } from "@/lib/sanity"
import { getSession } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"

export async function getCategories() {
  const session = await getSession()
  if (!hasPermission(session?.user?.role?.permissions || null, PERMISSIONS.CATEGORIES_VIEW)) {
    throw new Error("Unauthorized: Categories view permission required.")
  }
  return await client.fetch(`*[_type == "category"] | order(name asc) {
    "id": _id,
    name,
    "slug": slug.current,
    description,
    image
  }`)
}

export async function createCategory(formData: FormData) {
  try {
    const session = await getSession()
    if (!hasPermission(session?.user?.role?.permissions || null, PERMISSIONS.CATEGORIES_CREATE)) {
      return { success: false, error: "Unauthorized: Missing 'categories:create' capability." }
    }

    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string
    
    // 1. Upload to Sanity
    const file = formData.get("image") as File
    let imageAsset = null

    if (file && file.size > 0) {
      imageAsset = await client.assets.upload('image', file, {
        filename: file.name,
        contentType: file.type
      })
    }

    // 2. Create Category in Sanity
    const sanityCategory = await client.create({
      _type: 'category',
      name,
      slug: { _type: 'slug', current: slug },
      description,
      image: imageAsset ? {
        _type: 'image',
        asset: { _type: 'reference', _ref: imageAsset._id }
      } : undefined
    })

    // 3. Keep sync in Prisma (Lite)
    await prisma.category.create({
      data: {
        id: sanityCategory._id,
        name,
        slug,
        description,
        imageUrl: null // Images are now in Sanity
      }
    })

    revalidatePath("/admin/categories", "page")
    revalidatePath("/admin/products", "page")
    revalidatePath("/", "layout")
    return { success: true }
  } catch (error: any) {
    console.error("CREATE_CATEGORY_ERROR:", error)
    return { success: false, error: error.message || "Unknown error occurred" }
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    const session = await getSession()
    if (!hasPermission(session?.user?.role?.permissions || null, PERMISSIONS.CATEGORIES_EDIT)) {
      return { success: false, error: "Unauthorized: Missing 'categories:edit' capability." }
    }

    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string
    
    // Update Sanity
    const file = formData.get("image") as File
    let patchData: any = { name, slug: { _type: 'slug', current: slug }, description }

    if (file && file.size > 0) {
      const imageAsset = await client.assets.upload('image', file, {
        filename: file.name,
        contentType: file.type
      })
      patchData.image = {
        _type: 'image',
        asset: { _type: 'reference', _ref: imageAsset._id }
      }
    }

    await client.patch(id).set(patchData).commit()

    // Sync Prisma
    await prisma.category.update({
      where: { id },
      data: { name, slug, description }
    })

    revalidatePath("/admin/categories", "page")
    revalidatePath("/", "layout")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteCategory(id: string) {
  try {
    const session = await getSession()
    if (!hasPermission(session?.user?.role?.permissions || null, PERMISSIONS.CATEGORIES_DELETE)) {
      return { success: false, error: "Unauthorized: Missing 'categories:delete' capability." }
    }

    const productCount = await prisma.product.count({ where: { categoryId: id } })
    if (productCount > 0) {
      return { success: false, error: "Cannot delete category: It contains products. Please reassign them first." }
    }

    await client.delete(id)
    await prisma.category.delete({ where: { id } })
    revalidatePath("/admin/categories", "page")
    revalidatePath("/", "layout")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteCategories(ids: string[]) {
  try {
    const session = await getSession()
    if (!hasPermission(session?.user?.role?.permissions || null, PERMISSIONS.CATEGORIES_DELETE)) {
      return { success: false, error: "Unauthorized: Missing 'categories:delete' capability." }
    }

    const productCount = await prisma.product.count({ where: { categoryId: { in: ids } } })
    if (productCount > 0) {
      return { success: false, error: "Cannot delete categories: Some contain products. Please reassign them first." }
    }

    await Promise.all(ids.map(id => client.delete(id)))
    await prisma.category.deleteMany({
      where: { id: { in: ids } }
    })
    revalidatePath("/admin/categories", "page")
    revalidatePath("/", "layout")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
