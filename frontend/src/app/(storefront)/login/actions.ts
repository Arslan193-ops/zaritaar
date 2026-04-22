"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { createSession } from "@/lib/auth"

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password) {
    return { error: "Invalid credentials." }
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return { error: "Invalid credentials." }
  }

  await createSession(user.id)
  return { success: true }
}
