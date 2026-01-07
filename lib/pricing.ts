import { prisma } from './prisma'
import type { Weight, Cardamom } from './schemas'

/**
 * Calculate unit price for a menu item with selected options
 */
export async function calculateUnitPrice(
  menuItemId: string,
  weight: Weight | null,
  cardamom: Cardamom | null
): Promise<number> {
  // Get menu item
  const item = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
  })

  if (!item) {
    throw new Error(`Menu item not found: ${menuItemId}`)
  }

  if (!item.enabled || !item.inStock) {
    throw new Error(`Menu item not available: ${item.name}`)
  }

  let basePrice = 0

  // Calculate base price
  if (item.priceType === 'fixed') {
    basePrice = item.priceFixed || 0
  } else if (item.priceType === 'weighted') {
    if (!weight) {
      throw new Error('Weight is required for weighted items')
    }

    if (!item.pricesByWeight) {
      throw new Error(`No pricing data for item: ${item.name}`)
    }

    try {
      const priceMap = JSON.parse(item.pricesByWeight) as Record<string, number>
      basePrice = priceMap[weight]

      if (basePrice === undefined) {
        throw new Error(`No price for weight ${weight} on item: ${item.name}`)
      }
    } catch (error) {
      throw new Error(`Invalid pricing data for item: ${item.name}`)
    }
  }

  // Add cardamom extra
  let cardamomExtra = 0

  if (cardamom && cardamom !== 'none') {
    const cardamomPricing = await prisma.cardamomPricing.findUnique({
      where: { level: cardamom },
    })

    if (cardamomPricing) {
      cardamomExtra = cardamomPricing.price
    }
  }

  return basePrice + cardamomExtra
}

/**
 * Calculate line total for a cart item
 */
export function calculateLineTotal(unitPrice: number, quantity: number): number {
  return Number((unitPrice * quantity).toFixed(2))
}

/**
 * Calculate cart totals (subtotal, tax, discount, total)
 */
export async function calculateCartTotals(cartId: string): Promise<{
  subtotal: number
  tax: number
  discount: number
  total: number
}> {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: true },
  })

  if (!cart) {
    throw new Error('Cart not found')
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.lineTotal, 0)

  // Get tax rate from settings
  const taxSetting = await prisma.adminSetting.findUnique({
    where: { key: 'tax_rate' },
  })

  const taxEnabled = await prisma.adminSetting.findUnique({
    where: { key: 'tax_enabled' },
  })

  let tax = 0

  if (taxEnabled?.value === 'true' && taxSetting) {
    const taxRate = parseFloat(taxSetting.value) || 0
    tax = Number((subtotal * taxRate).toFixed(2))
  }

  // Discount logic can be added here
  const discount = 0

  const total = Number((subtotal + tax - discount).toFixed(2))

  return { subtotal, tax, discount, total }
}

/**
 * Get menu item by name (English key)
 */
export async function getMenuItemByName(name: string) {
  return prisma.menuItem.findUnique({
    where: { name },
    include: { category: true },
  })
}

/**
 * Validate product configuration
 */
export function validateProductConfig(
  priceType: string,
  weight: Weight | null,
  cardamom: Cardamom | null
): void {
  if (priceType === 'weighted' && !weight) {
    throw new Error('Weight is required for weighted items')
  }

  // Cardamom is optional but must be valid if provided
  if (cardamom && !['none', 'light', 'medium', 'strong'].includes(cardamom)) {
    throw new Error('Invalid cardamom level')
  }
}
