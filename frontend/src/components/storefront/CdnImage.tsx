import Image, { ImageProps } from "next/image"
import { urlForImage } from "@/lib/sanity-image"

export interface CdnImageProps extends Omit<ImageProps, "src"> {
  source: any
  alt: string
  width?: number
  height?: number
  quality?: number
  cdnWidth?: number
}

export function CdnImage({ source, alt, width, height, quality = 80, cdnWidth, ...rest }: CdnImageProps) {
  if (!source) return null

  // If fill is true, we don't have a fixed width/height for the URL builder
  // We'll default to a high enough resolution but let Next.js handle the display
  const finalCdnWidth = cdnWidth || width || (rest.fill ? 1200 : 800)
  const imageUrl = urlForImage(source, finalCdnWidth)

  if (!imageUrl) return null

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={!rest.fill ? width : undefined}
      height={!rest.fill ? height : undefined}
      {...rest}
    />
  )
}
