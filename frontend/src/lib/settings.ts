import { unstable_cache } from "next/cache"
import prisma from "@/lib/prisma"

export const getStoreSettings = unstable_cache(
  async () => {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: "global" }
    })
    
    // Auto-prepare global settings instance if the database is fresh
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: { id: "global", storeName: "My Store" }
      })
    }
    return settings
  },
  ["global-store-settings"],
  { tags: ["settings"], revalidate: 3600 } // Keep cached strongly to avoid DB trips
)

export const getShippingMethods = unstable_cache(
  async () => {
    return prisma.shippingMethod.findMany({
      orderBy: { orderIndex: "asc" }
    })
  },
  ["global-shipping-methods"],
  { tags: ["settings"], revalidate: 3600 }
)
