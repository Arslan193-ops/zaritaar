import { getStoreProducts } from "@/lib/storefront-actions"
import ProductGrid from "@/components/storefront/ProductGrid"

export const revalidate = 60

export default async function StorefrontPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; sort?: string; view?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const products = await getStoreProducts({ 
    categoryId: resolvedSearchParams.categoryId, 
    sort: resolvedSearchParams.sort 
  })

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Storefront</h1>
      <ProductGrid products={products} />
    </main>
  )
}
