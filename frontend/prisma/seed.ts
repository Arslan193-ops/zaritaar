import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create SUPER_HOST Role
  const superHostRole = await prisma.role.upsert({
    where: { name: "SUPER_HOST" },
    update: {
      permissions: JSON.stringify(["*"]) // All permissions
    },
    create: {
      name: "SUPER_HOST",
      permissions: JSON.stringify(["*"])
    }
  })

  // Create Standard Admin Role
  await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      permissions: JSON.stringify(["dashboard:view", "products:full", "orders:full"])
    }
  })

  // Create Default Super Host User
  const hashedPassword = await bcrypt.hash("admin123", 10)
  
  await prisma.user.upsert({
    where: { email: "admin@mystore.com" },
    update: {},
    create: {
      email: "admin@mystore.com",
      password: hashedPassword,
      name: "Super Host",
      roleId: superHostRole.id
    }
  })

  console.log("Seed successful: Super Host created with admin@mystore.com / admin123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
