"use server"
import { cookies } from "next/headers"
import prisma from "./prisma"

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const sessionId = crypto.randomUUID()
  
  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
    },
  })

  const cookieStore = await cookies()
  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value
  if (!sessionId) return null

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        include: { role: true },
      },
    },
  })

  // If session is expired or deleted
  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: sessionId } }).catch(() => {})
    return null
  }

  return session
}

export async function deleteSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value
  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {})
  }
  cookieStore.delete("session")
}
