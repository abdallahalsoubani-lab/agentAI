import { z } from 'zod'

// ============================================================================
// CART & ORDER SCHEMAS
// ============================================================================

/**
 * Valid weight options
 */
export const WeightSchema = z.enum(['250g', '500g', '1kg'])

/**
 * Valid cardamom levels
 */
export const CardamomSchema = z.enum(['none', 'light', 'medium', 'strong'])

/**
 * Product schema for cart operations
 */
export const ProductSchema = z.object({
  id: z.string().optional(), // Menu item ID (optional for name-based lookup)
  name: z.string(), // Menu item name (English key)
  category: z.string().optional(),
  weight: WeightSchema.optional().nullable(),
  cardamom: CardamomSchema.optional().nullable(),
  quantity: z.number().int().positive().default(1),
  ready: z.boolean().default(false), // True when all required fields are complete
})

/**
 * Add Product Action
 */
export const AddProductActionSchema = z.object({
  action: z.literal('add_product'),
  product: ProductSchema,
})

/**
 * Update Product Action
 */
export const UpdateProductActionSchema = z.object({
  action: z.literal('update_product'),
  lineItemId: z.string(),
  patch: z.object({
    weight: WeightSchema.optional(),
    cardamom: CardamomSchema.optional(),
    quantity: z.number().int().positive().optional(),
  }),
})

/**
 * Remove Product Action
 */
export const RemoveProductActionSchema = z.object({
  action: z.literal('remove_product'),
  lineItemId: z.string(),
})

/**
 * Clear Cart Action
 */
export const ClearCartActionSchema = z.object({
  action: z.literal('clear_cart'),
})

/**
 * Order Batch Action (Checkout)
 */
export const OrderBatchActionSchema = z.object({
  action: z.literal('order_batch'),
  items: z.array(ProductSchema).optional(),
  checkout: z.boolean().default(false),
})

/**
 * Navigation Action (for page transitions)
 */
export const NavigationActionSchema = z.object({
  page: z.string(),
  params: z.record(z.any()).optional(),
})

/**
 * Union of all action schemas
 */
export const ActionSchema = z.discriminatedUnion('action', [
  AddProductActionSchema,
  UpdateProductActionSchema,
  RemoveProductActionSchema,
  ClearCartActionSchema,
  OrderBatchActionSchema,
])

// ============================================================================
// CHAT SCHEMAS
// ============================================================================

/**
 * Chat message schema
 */
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
})

/**
 * Chat request schema
 */
export const ChatRequestSchema = z.object({
  mode: z.string(),
  sessionId: z.string(),
  message: z.string(),
  includeHistory: z.boolean().default(true),
})

// ============================================================================
// ADMIN SCHEMAS
// ============================================================================

/**
 * Admin authentication schema
 */
export const AdminAuthSchema = z.object({
  password: z.string().min(1),
})

/**
 * Menu item creation/update schema
 */
export const MenuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  displayNameAr: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string(),
  priceType: z.enum(['weighted', 'fixed']),
  priceFixed: z.number().optional(),
  pricesByWeight: z.record(z.number()).optional(),
  enabled: z.boolean().default(true),
  inStock: z.boolean().default(true),
  imageUrl: z.string().optional(),
  sortOrder: z.number().default(0),
})

/**
 * Prompt update schema
 */
export const PromptUpdateSchema = z.object({
  mode: z.string(),
  content: z.string().min(1),
  notes: z.string().optional(),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Weight = z.infer<typeof WeightSchema>
export type Cardamom = z.infer<typeof CardamomSchema>
export type Product = z.infer<typeof ProductSchema>
export type AddProductAction = z.infer<typeof AddProductActionSchema>
export type UpdateProductAction = z.infer<typeof UpdateProductActionSchema>
export type RemoveProductAction = z.infer<typeof RemoveProductActionSchema>
export type ClearCartAction = z.infer<typeof ClearCartActionSchema>
export type OrderBatchAction = z.infer<typeof OrderBatchActionSchema>
export type Action = z.infer<typeof ActionSchema>
export type NavigationAction = z.infer<typeof NavigationActionSchema>
export type ChatMessage = z.infer<typeof ChatMessageSchema>
export type ChatRequest = z.infer<typeof ChatRequestSchema>
export type AdminAuth = z.infer<typeof AdminAuthSchema>
export type MenuItem = z.infer<typeof MenuItemSchema>
export type PromptUpdate = z.infer<typeof PromptUpdateSchema>
