"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getSession, deleteSession } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"

export async function getUsers() {
  const session = await getSession()
  if (!hasPermission(session?.user?.role?.permissions || null, PERMISSIONS.USERS_VIEW)) {
    throw new Error("Unauthorized: Users view permission required.")
  }

  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: {
        select: {
          id: true,
          name: true,
          permissions: true
        }
      },
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  })
}

export async function createAdminUser(data: {
  email: string
  name: string
  passwordHash: string
  roleId: string
}) {
  const session = await getSession()
  if (!session || session.user.role?.name !== "SUPER_HOST") {
    throw new Error("Only Super Host can create admins")
  }

  const hashedPassword = await bcrypt.hash(data.passwordHash, 10)

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      roleId: data.roleId
    }
  })

  revalidatePath("/admin/users")
  redirect("/admin/users")
}

export async function deleteUser(userId: string) {
  const session = await getSession()
  if (!session || session.user.role?.name !== "SUPER_HOST") {
    throw new Error("Only Super Host can delete users")
  }

  if (session.user.id === userId) {
    throw new Error("You cannot delete yourself")
  }

  await prisma.user.delete({ where: { id: userId } })
  
  revalidatePath("/admin/users")
  return { success: true }
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}

export async function getRoles() {
  const session = await getSession()
  if (!hasPermission(session?.user?.role?.permissions || null, PERMISSIONS.ROLES_VIEW)) {
    throw new Error("Unauthorized: Roles view permission required.")
  }
  return await prisma.role.findMany()
}
