import { unstable_cache } from "next/cache"
import prisma from "@/lib/prisma"

export const getStoreSettings = unstable_cache(
  async () => {
    const settings = await prisma.storeSettings.upsert({
      where: { id: "global" },
      update: {},
      create: { id: "global", storeName: "My Store" }
    })
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
