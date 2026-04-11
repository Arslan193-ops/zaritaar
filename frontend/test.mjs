import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ log: ['info', 'query', 'warn', 'error'] })

async function main() {
  console.log("Connecting...")
  const users = await prisma.user.findMany()
  console.log("Users:", users.length)
}

main().catch(console.error).finally(() => prisma.$disconnect())
