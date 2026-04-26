import { unstable_cache } from "next/cache"
import prisma from "@/lib/prisma"

export const getStoreSettings = unstable_cache(
  async () => {
    const settings = await (prisma.storeSettings as any).upsert({
      where: { id: "global" },
      update: {},
      create: { id: "global", storeName: "My Store" },
      select: {
        id: true,
        storeName: true,
        heroHeadline: true,
        showHeroHeadline: true,
        heroButtonText: true,
        heroButtonLink: true,
        showHeroButton: true,
        desktopHeroImage: true,
        heroSliderImages: true,
        heroBadge: true,
        whatsappNumber: true,
        logoUrl: true,
        logoDarkUrl: true,
        announcementsText: true,
        enableScrollingAnnouncements: true,
        facebookPixelId: true,
        tiktokPixelId: true
      }
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
