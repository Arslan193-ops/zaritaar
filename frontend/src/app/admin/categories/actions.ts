"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { client } from "@/lib/sanity"

export async function getCategories() {
  return await client.fetch(`*[_type == "category"] | order(name asc)`)
}

export async function createCategory(formData: FormData) {
  try {
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

    revalidatePath("/admin/categories")
    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: any) {
    console.error("CREATE_CATEGORY_ERROR:", error)
    return { success: false, error: error.message || "Unknown error occurred" }
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
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

    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({ where: { id } })
    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteCategories(ids: string[]) {
  try {
    await Promise.all(ids.map(id => client.delete(id)))
    await prisma.category.deleteMany({
      where: { id: { in: ids } }
    })
    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
