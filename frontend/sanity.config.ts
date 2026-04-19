import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

export default defineConfig({
  basePath: '/studio',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "x5f1k8p3",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  title: "MyStore Content Studio",
  plugins: [structureTool()],
  schema: {
    types: [
      {
        name: 'product',
        title: 'Product (Assets & Sync)',
        type: 'document',
        fields: [
          { name: 'title', title: 'Title', type: 'string' },
          { name: 'slug', title: 'Slug', type: 'slug' },
          { name: 'description', title: 'Description', type: 'text' },
          { name: 'basePrice', title: 'Base Price', type: 'number' },
          { name: 'discountedPrice', title: 'Discounted Price', type: 'number' },
          { name: 'stock', title: 'Stock', type: 'number' },
          { name: 'sku', title: 'SKU', type: 'string' },
          { name: 'status', title: 'Status', type: 'string' },
          { name: 'images', title: 'Images', type: 'array', of: [{ type: 'image' }] },
          { name: 'sizeCharts', title: 'Size Charts', type: 'array', of: [{ type: 'image' }] },
        ]
      }
    ],
  },
})
