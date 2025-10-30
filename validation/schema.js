import z from 'zod'

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(3),
})

const product = z.object({
  code: z.string().min(3),
  name: z.string().min(1),
  type: z.string(),
  estado: z.string(),
  quantity: z.number().min(0),
  caliber: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
})

export function validateProduct(productData) {
  return product.safeParse(productData)
}

export function validatePartialProduct(productData) {
  return product.partial().safeParse(productData)
}
