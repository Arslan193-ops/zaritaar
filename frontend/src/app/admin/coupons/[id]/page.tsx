import { CouponForm } from "../CouponForm"
import { getCoupon } from "../actions"
import { notFound } from "next/navigation"

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const coupon = await getCoupon(id)
  
  if (!coupon) {
    notFound()
  }

  return <CouponForm initialData={coupon} />
}
