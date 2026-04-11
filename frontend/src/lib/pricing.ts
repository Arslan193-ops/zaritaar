import { Product, ProductVariant } from "@prisma/client"

export type ProductWithVariants = Product & { variants: ProductVariant[] }

/**
 * Calculates the dynamic display price range or exact price for a product,
 * taking into account its variants and base prices (falling back to base
 * when variant prices are missing).
 */
export function calculateProductPriceDisplay(product: any) {
  // If no variants, just use base properties
  if (!product.variants || product.variants.length === 0) {
    return {
      isRange: false,
      hasAnySale: !!product.discountedPrice && product.discountedPrice < product.basePrice,
      regularPrice: product.basePrice,
      discountedPrice: product.discountedPrice || null,
      
      displayText: product.discountedPrice 
        ? `$${product.discountedPrice.toFixed(2)}` 
        : `$${product.basePrice.toFixed(2)}`,
        
      regularText: `$${product.basePrice.toFixed(2)}`
    }
  }

  // Product has variants
  let minRegular = Infinity
  let maxRegular = -Infinity
  let minEffective = Infinity
  let maxEffective = -Infinity
  let hasAnySale = false

  product.variants.forEach((v: any) => {
    // Determine the regular price for this specific variant
    const vReg = v.price !== null ? v.price : product.basePrice
    
    // Determine if it has a discount
    const vSale = v.discountedPrice !== null ? v.discountedPrice : product.discountedPrice

    if (vReg < minRegular) minRegular = vReg
    if (vReg > maxRegular) maxRegular = vReg

    // The price the user actually pays for this variant
    const effectivePrice = vSale ?? vReg
    
    if (vSale && vSale < vReg) {
      hasAnySale = true
    }

    if (effectivePrice < minEffective) minEffective = effectivePrice
    if (effectivePrice > maxEffective) maxEffective = effectivePrice
  })

  // Normalize Infinity (in case of empty map arrays or edge cases)
  if (minRegular === Infinity) minRegular = product.basePrice
  if (maxRegular === -Infinity) maxRegular = product.basePrice
  if (minEffective === Infinity) minEffective = minRegular
  if (maxEffective === -Infinity) maxEffective = maxRegular

  const isRange = minEffective !== maxEffective || minRegular !== maxRegular

  return {
    isRange,
    hasAnySale,
    minRegular,
    maxRegular,
    minEffective,
    maxEffective,
    
    // Formatted strings for the frontend
    displayText: isRange 
      ? `$${minEffective.toFixed(2)} - $${maxEffective.toFixed(2)}`
      : `$${minEffective.toFixed(2)}`,
    
    regularText: isRange
      ? `$${minRegular.toFixed(2)} - $${maxRegular.toFixed(2)}`
      : `$${minRegular.toFixed(2)}`
  }
}
