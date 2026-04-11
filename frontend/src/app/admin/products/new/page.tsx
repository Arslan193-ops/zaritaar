import { ProductForm } from "../ProductForm"
import { BackButton } from "@/components/admin/BackButton"

export default function NewProductPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <BackButton href="/admin/products" label="Back to Products" />
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Product</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Create a new listing in your store catalog.</p>
      </div>
      <ProductForm />
    </div>
  )
}
