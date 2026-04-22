import imageUrlBuilder from "@sanity/image-url"
import { client } from "./sanity"

const builder = imageUrlBuilder(client)

export function urlForImage(source: any, width: number) {
  return builder.image(source).width(width).quality(80).auto("format").fit("max").url()
}
