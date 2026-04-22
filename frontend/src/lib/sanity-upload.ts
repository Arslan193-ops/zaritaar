import { client, urlFor } from "./sanity"

/**
 * Uploads a single file to Sanity and returns the asset ID.
 */
export async function uploadFileToSanity(file: File): Promise<string | null> {
  if (!file || file.size === 0 || file.name === "undefined") return null

  try {
    const asset = await client.assets.upload('image', file, {
      filename: file.name,
      contentType: file.type
    })
    return asset._id
  } catch (error) {
    console.error("SANITY_UPLOAD_ERROR:", error)
    return null
  }
}

/**
 * Uploads multiple files from a FormData field to Sanity.
 */
export async function uploadMultipleFilesToSanity(formData: FormData, fieldName: string): Promise<string[]> {
  const images = formData.getAll(fieldName) as File[]
  
  if (images.length === 0) return []

  // Run all uploads in parallel
  const uploadPromises = images
    .filter(file => file.size > 0 && file.name !== "undefined")
    .map(file => uploadFileToSanity(file))

  const assetIds = await Promise.all(uploadPromises)
  return assetIds.filter((id): id is string => id !== null)
}

/**
 * Generates a stable Sanity CDN URL for a given asset ID.
 */
export function getSanityUrl(assetId: string): string {
  if (!assetId) return ""
  
  try {
    // Using the official Sanity Image URL builder
    return urlFor(assetId).auto('format').url() || "";
  } catch (error) {
    console.error("SANITY_URL_GEN_ERROR:", error);
    return "";
  }
}
