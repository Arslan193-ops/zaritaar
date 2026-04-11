"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: {
  name: string
  email: string
  password?: string
}) {
  const session = await getSession()
  if (!session || !session.user) throw new Error("Unauthorized")

  // 1. Email collision check (if changing email)
  if (data.email.toLowerCase() !== session.user.email.toLowerCase()) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    })
    if (existing) throw new Error("This email is already in use by another account.")
  }

  const updateData: any = {
    name: data.name,
    email: data.email.toLowerCase(),
  }

  // 2. Hash password ONLY if provided
  if (data.password && data.password.trim() !== "") {
    updateData.password = await bcrypt.hash(data.password, 10)
  }

  // 3. Perform update strictly on own ID
  await prisma.user.update({
    where: { id: session.user.id },
    data: updateData
  })

  // Revalidate Admin dashboard to refresh user name in header/sidebar
  revalidatePath("/admin", "layout")
  
  return { success: true }
}
