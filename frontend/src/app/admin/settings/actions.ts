"use server"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"
import { uploadFileToSanity, getSanityUrl } from "@/lib/sanity-upload"

export async function updateStoreSettings(formData: FormData) {
  try {
    const session = await getSession()
    if (!hasPermission(session?.user?.role?.permissions || null, PERMISSIONS.SETTINGS_EDIT)) {
      throw new Error("Unauthorized: Missing 'settings:edit' capability.")
    }

    const storeName = formData.get("storeName") as string || undefined
    const heroHeadline = formData.get("heroHeadline") as string || undefined
    const showHeroHeadline = formData.has("showHeroHeadline") ? formData.get("showHeroHeadline") === "true" : undefined
    const heroButtonText = formData.get("heroButtonText") as string || undefined
    const heroButtonLink = formData.get("heroButtonLink") as string || undefined
    const showHeroButton = formData.has("showHeroButton") ? formData.get("showHeroButton") === "true" : undefined
    const whatsappNumber = formData.get("whatsappNumber") as string || undefined

    const enableScrollingAnnouncements = formData.has("enableScrollingAnnouncements") ? formData.get("enableScrollingAnnouncements") === "true" : undefined
    const announcementsText = formData.get("announcementsText") as string || undefined

    // Process File Uploads (Desktop Hero, Mobile Hero, Features 1-3)
    const desktopHeroImageFile = formData.get("desktopHeroImageFile") as File | null
    const mobileHeroImageFile = formData.get("mobileHeroImageFile") as File | null
    const feature1File = formData.get("feature1File") as File | null
    const feature2File = formData.get("feature2File") as File | null
    const feature3File = formData.get("feature3File") as File | null

    // Process Branding (Logos & Slider)
    const logoFile = formData.get("logoFile") as File | null
    const logoDarkFile = formData.get("logoDarkFile") as File | null
    const sliderCount = parseInt(formData.get("sliderCount") as string || "0")

    const updates: any = {}
    if (storeName) updates.storeName = storeName
    if (heroHeadline) updates.heroHeadline = heroHeadline
    if (showHeroHeadline !== undefined) updates.showHeroHeadline = showHeroHeadline
    if (heroButtonText) updates.heroButtonText = heroButtonText
    if (heroButtonLink) updates.heroButtonLink = heroButtonLink
    if (showHeroButton !== undefined) updates.showHeroButton = showHeroButton
    if (whatsappNumber !== undefined) updates.whatsappNumber = whatsappNumber
    if (enableScrollingAnnouncements !== undefined) updates.enableScrollingAnnouncements = enableScrollingAnnouncements
    if (announcementsText !== undefined) updates.announcementsText = announcementsText

    // Helper for Sanity Cloud uploading
    const attemptUpload = async (file: File | null) => {
      if (file && file.size > 0 && file.name !== "undefined") {
        const assetId = await uploadFileToSanity(file)
        return assetId ? getSanityUrl(assetId) : undefined
      }
      return undefined
    }

    // Logo Uploads
    const logoUrl = await attemptUpload(logoFile)
    if (logoUrl) updates.logoUrl = logoUrl

    const logoDarkUrl = await attemptUpload(logoDarkFile)
    if (logoDarkUrl) updates.logoDarkUrl = logoDarkUrl

    // Slider Reconstruction
    const sliderImages: string[] = []
    for (let i = 0; i < sliderCount; i++) {
       const newFile = formData.get(`sliderFile_${i}`) as File | null
       const existingUrl = formData.get(`existingSliderUrl_${i}`) as string | null

       if (newFile && newFile.size > 0) {
          const url = await attemptUpload(newFile)
          if (url) sliderImages.push(url)
       } else if (existingUrl) {
          sliderImages.push(existingUrl)
       }
    }
    updates.heroSliderImages = JSON.stringify(sliderImages)

    const deskUrl = await attemptUpload(desktopHeroImageFile)
    if (deskUrl) updates.desktopHeroImage = deskUrl

    const mobileUrl = await attemptUpload(mobileHeroImageFile)
    if (mobileUrl) updates.mobileHeroImage = mobileUrl

    const f1Url = await attemptUpload(feature1File)
    if (f1Url) updates.featureImage1 = f1Url

    const f2Url = await attemptUpload(feature2File)
    if (f2Url) updates.featureImage2 = f2Url

    const f3Url = await attemptUpload(feature3File)
    if (f3Url) updates.featureImage3 = f3Url

    // Upsert the singleton "global" row
    const settings = await prisma.storeSettings.update({
      where: { id: "global" },
      data: updates
    }).catch(async (e: any) => {
      // Create if it doesn't exist
      return await prisma.storeSettings.create({
        data: { id: "global", ...updates }
      })
    })

    // CRITICAL: NextJS Performance Purge - This wipes the caches globally
    revalidatePath("/", "layout")

    return { success: true, settings }
  } catch (error: any) {
    console.error("UPDATE_SETTINGS_ERROR:", error)
    return { success: false, error: error.message }
  }
}

export async function updateShippingMethods(methodsJson: string) {
  try {
    const session = await getSession()
    if (!hasPermission(session?.user?.role?.permissions || null, PERMISSIONS.SETTINGS_EDIT)) {
      throw new Error("Unauthorized: Missing 'settings:edit' capability.")
    }

    const methods = JSON.parse(methodsJson)

    // Delete all existing to avoid complex diff logic - then recreate them sorted
    await prisma.shippingMethod.deleteMany({})

    const created = await prisma.shippingMethod.createMany({
      data: methods.map((m: any, i: number) => ({
        name: m.name,
        duration: m.duration,
        price: Math.max(0, parseFloat(m.price || 0)),
        isFree: m.isFree,
        orderIndex: i
      }))
    })

    revalidatePath("/", "layout")
    return { success: true, count: created.count }
  } catch (error: any) {
    console.error("UPDATE_SHIPPING_ERROR:", error)
    return { success: false, error: error.message }
  }
}

export async function updateAdsSettings(facebookPixelId: string, tiktokPixelId: string) {
  try {
    const session = await getSession()
    if (!hasPermission(session?.user?.role?.permissions || null, PERMISSIONS.ADS_EDIT)) {
      throw new Error("Unauthorized: Missing 'ads:edit' capability.")
    }

    await prisma.storeSettings.update({
      where: { id: "global" },
      data: {
        facebookPixelId,
        tiktokPixelId
      }
    }).catch(async () => {
      return await prisma.storeSettings.create({
        data: { id: "global", facebookPixelId, tiktokPixelId }
      })
    })

    revalidatePath("/", "layout")
    return { success: true }
  } catch (error: any) {
    console.error("UPDATE_ADS_ERROR:", error)
    return { success: false, error: error.message }
  }
}
