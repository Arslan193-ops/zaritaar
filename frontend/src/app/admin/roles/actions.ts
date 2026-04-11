"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function getRoles() {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  return await prisma.role.findMany({
    include: {
      _count: {
        select: { users: true }
      }
    },
    orderBy: { createdAt: "asc" }
  })
}

export async function getRole(id: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  return await prisma.role.findUnique({
    where: { id }
  })
}

export async function upsertRole(id: string | null, data: { name: string, permissions: string[] }) {
  const session = await getSession()
  if (!session || session.user.role?.name !== "SUPER_HOST") {
    throw new Error("Only Super Host can manage roles")
  }

  const permissionsJson = JSON.stringify(data.permissions)

  if (id) {
    await prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        permissions: permissionsJson
      }
    })
  } else {
    await prisma.role.create({
      data: {
        name: data.name,
        permissions: permissionsJson
      }
    })
  }

  revalidatePath("/admin/roles")
  revalidatePath("/admin/users")
  redirect("/admin/roles")
}

export async function deleteRole(roleId: string) {
  const session = await getSession()
  if (!session || session.user.role?.name !== "SUPER_HOST") {
    throw new Error("Only Super Host can delete roles")
  }

  // Check if role has users
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: { _count: { select: { users: true } } }
  })

  if (role?._count.users && role._count.users > 0) {
    throw new Error("Cannot delete a role that has assigned users")
  }

  await prisma.role.delete({ where: { id: roleId } })
  
  revalidatePath("/admin/roles")
  return { success: true }
}
