import { client } from "./sanity"

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
  
  // Format: image-assetId-dimensions-extension -> https://cdn.sanity.io/images/projectId/dataset/assetId-dimensions.extension
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "x5f1k8p3" // Fallback if needed, but should be in env
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"
  
  // assetId looks like "image-70233480fe372c3d5e2361ac4a8637651a1a5b82-200x200-png"
  const cleanId = assetId.replace('image-', '').replace(/-([^-]+)$/, '.$1')
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${cleanId}`
}
