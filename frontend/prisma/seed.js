const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding data...");

  const catNames = ["Casual Wear", "Formal Wear", "Activewear", "Accessories"];
  const categories = [];

  for (const name of catNames) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const cat = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug }
    });
    categories.push(cat);
  }

  const productsData = [
    { title: "Everyday Basic Tee", basePrice: 19.99, catIndex: 0 },
    { title: "Relaxed Fit Denim", basePrice: 49.99, catIndex: 0 },
    { title: "Cotton Chino Shorts", basePrice: 34.99, catIndex: 0 },
    
    { title: "Classic White Oxford", basePrice: 59.99, catIndex: 1 },
    { title: "Tailored Trousers", basePrice: 79.99, catIndex: 1 },
    { title: "Silk Tie Selection", basePrice: 24.99, catIndex: 1 },
    
    { title: "Performance Running Top", basePrice: 29.99, catIndex: 2 },
    { title: "Compression Tights", basePrice: 39.99, catIndex: 2 },
    { title: "Lightweight Windbreaker", basePrice: 69.99, catIndex: 2 },
    
    { title: "Minimalist Leather Belt", basePrice: 35.00, catIndex: 3 },
    { title: "Polarized Sunglasses", basePrice: 85.00, catIndex: 3 },
    { title: "Canvas Tote Bag", basePrice: 20.00, catIndex: 3 },
  ];

  for (const p of productsData) {
    await prisma.product.create({
      data: {
        title: p.title,
        description: `Testing product for ${catNames[p.catIndex]}. Features high-quality materials.`,
        basePrice: p.basePrice,
        status: "PUBLISHED",
        categoryId: categories[p.catIndex].id,
      }
    });
  }

  console.log("Seeded 4 categories and 12 products successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
