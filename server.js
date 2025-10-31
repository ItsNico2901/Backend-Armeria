import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.routes.js'
import productsRoutes from './routes/products.routes.js'
import userRoutes from './routes/users.routes.js'

const app = express()

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://backend-armeria.nicolavirgilio.cloud',
]

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin
  if (requestOrigin && (ALLOWED_ORIGINS.includes(requestOrigin) || ALLOWED_ORIGINS.includes('*'))) {
    res.header('Access-Control-Allow-Origin', requestOrigin)
  }
  res.header('Vary', 'Origin')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-role, X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  next()
})
app.use(express.json())

app.use('/api', authRoutes)
app.use('/api', productsRoutes)
app.use('/api', userRoutes)

const PORT = process.env.PORT || 4567
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`)
})
