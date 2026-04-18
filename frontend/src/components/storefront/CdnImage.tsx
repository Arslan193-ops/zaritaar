import Image, { type ImageProps } from "next/image"

/**
 * Sanity (and similar CDNs) already serve resized WebP/AVIF via urlFor.
 * Next.js dev/prod optimizer fetches the remote file with a 7s timeout, which
 * often fails on very large sources — load the CDN URL directly instead.
 */
export function CdnImage(props: ImageProps) {
  const { unoptimized: _ignored, ...rest } = props
  return <Image {...rest} unoptimized />
}
