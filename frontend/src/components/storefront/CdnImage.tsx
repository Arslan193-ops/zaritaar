import Image, { ImageProps } from "next/image"
import { urlForImage } from "@/lib/sanity-image"

export interface CdnImageProps extends Omit<ImageProps, "src"> {
  source: any
  alt: string
  width?: number
  height?: number
}

export function CdnImage({ source, alt, width, height, ...rest }: CdnImageProps) {
  if (!source) return null

  const cdnWidth = width || 1200
  const imageUrl = urlForImage(source, cdnWidth)

  if (!imageUrl) return null

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={!rest.fill ? width : undefined}
      height={!rest.fill ? height : undefined}
      unoptimized={true}
      {...rest}
    />
  )
}
