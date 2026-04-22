"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { createSession } from "@/lib/auth"

export async function registerHost(formData: FormData) {
  if (process.env.ALLOW_REGISTRATION !== "true") {
    return { error: "Host registration is currently disabled by the system administrator." }
  }

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  if (!email || !password || !name) {
    return { error: "All fields are required." }
  }

  // Only allow one host to be registered via this simple form
  // Or at least, check if they exist
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: "User already exists." }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  // Check if Host role exists
  let hostRole = await prisma.role.findUnique({ where: { name: "Host" } })
  if (!hostRole) {
    // Create the super admin host role with all permissions
    hostRole = await prisma.role.create({
      data: {
        name: "Host",
        permissions: JSON.stringify(["admin_access", "manage_products", "manage_orders", "manage_roles", "manage_users"]),
      }
    })
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      roleId: hostRole.id
    }
  })

  await createSession(user.id)
  return { success: true }
}
