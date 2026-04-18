import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: false, // Set to true for fast, cached edge delivery (Production)
  token: process.env.SANITY_API_TOKEN, // Needed for write access in Server Actions
});

const builder = createImageUrlBuilder(client);

export const urlFor = (source: any) => {
  return builder.image(source);
}
