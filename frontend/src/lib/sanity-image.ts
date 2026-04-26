import { createImageUrlBuilder } from "@sanity/image-url"
import { client } from "./sanity"

const builder = createImageUrlBuilder(client as any)

function isSanityAsset(source: any): boolean {
  if (!source) return false
  if (typeof source === "string") {
    return source.startsWith("image-") && !source.startsWith("http") && !source.startsWith("/")
  }
  if (typeof source === "object") {
    const ref = source._ref || source.asset?._ref || source.asset?.url
    if (!ref) return false
    return typeof ref === "string" && ref.startsWith("image-")
  }
  return false
}

export function isSanitySource(source: any): boolean {
  return isSanityAsset(source)
}

export function urlForImage(source: any, width: number): string {
  if (!source) return ""
  if (typeof source === "string" && (source.startsWith("http") || source.startsWith("/"))) {
    return source
  }
  if (!isSanityAsset(source)) return ""
  return builder.image(source).width(width).quality(80).auto("format").fit("max").url()
}
