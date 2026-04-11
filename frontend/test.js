const { PrismaClient } = require('@prisma/client');

async function test() {
  try {
    const prisma = new PrismaClient({ log: ['query'] });
    const users = await prisma.user.findMany();
    console.log("Success");
  } catch(e) {
    console.log("CAUGHT MESSAGE:", e.message);
  }
}
test();

main().catch(console.error).finally(() => prisma.$disconnect());
