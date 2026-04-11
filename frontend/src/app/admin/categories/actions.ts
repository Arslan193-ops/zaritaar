"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: "asc" }
  })
}

export async function createCategory(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string
    
    // Handle local file upload for category thumbnail
    const file = formData.get("image") as File
    let imageUrl = null

    if (file && file.size > 0) {
      const uploadDir = join(process.cwd(), "public", "uploads", "categories")
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`
      const path = join(uploadDir, uniqueName)
      await writeFile(path, buffer)
      imageUrl = `/uploads/categories/${uniqueName}`
    }

    await prisma.category.create({
      data: {
        name,
        slug,
        description,
        imageUrl
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
    
    // Handle image upload
    const file = formData.get("image") as File
    let data: any = { name, slug, description }

    if (file && file.size > 0) {
      const uploadDir = join(process.cwd(), "public", "uploads", "categories")
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`
      const path = join(uploadDir, uniqueName)
      await writeFile(path, buffer)
      data.imageUrl = `/uploads/categories/${uniqueName}`
    }

    await prisma.category.update({
      where: { id },
      data
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
    await prisma.category.deleteMany({
      where: { id: { in: ids } }
    })
    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
