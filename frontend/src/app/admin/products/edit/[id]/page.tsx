import { notFound } from "next/navigation"
import { getProduct } from "../../actions"
import { ProductForm } from "../../ProductForm"
import { ShoppingBag } from "lucide-react"
import { BackButton } from "@/components/admin/BackButton"

export const dynamic = "force-dynamic"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) return notFound()

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <BackButton href="/admin/products" label="Back to Catalog" />
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Modify Product</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Editing serial <span className="text-slate-900 font-bold">#{id.slice(-6).toUpperCase()}</span>
        </p>
      </div>

      <ProductForm product={product} />
    </div>
  )
}
