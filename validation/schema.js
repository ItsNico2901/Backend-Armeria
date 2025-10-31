import z from 'zod'

function normalizeToUpper(value) {
  if (typeof value !== 'string') return value
  return value.trim().toUpperCase()
}

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(3),
})

const user = z.object({
  username: z.string().min(3),
  password: z.string().min(4),
  role: z.enum(['ADMIN', 'USUARIO']),
  active: z.boolean(),
})

const product = z.object({
  code: z.string().min(3),
  name: z.string().min(1),
  type: z.preprocess(normalizeToUpper, z.enum(['FUEGO', 'BLANCO', 'ELECTRO'])),
  estado: z.preprocess(normalizeToUpper, z.enum(['NUEVO', 'USADO', 'COLECCION'])),
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

export function validateUser(userData) {
  return user.safeParse(userData)
}

export function validatePartialUser(userData) {
  return user.partial().safeParse(userData)
}
