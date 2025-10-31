import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.routes.js'
import productsRoutes from './routes/products.routes.js'
import userRoutes from './routes/users.routes.js'

const app = express()

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://app.nicolavirgilio.cloud',
  'https://backend-armeria.nicolavirgilio.cloud',
]

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true)
    if (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }
    console.warn('[CORS] Origin no permitido:', origin)
    return callback(null, false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'Accept', 'Content-Type', 'Authorization', 'x-role', 'X-Requested-With'],
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

app.use(express.json())

app.use('/api', authRoutes)
app.use('/api', productsRoutes)
app.use('/api', userRoutes)

const PORT = process.env.PORT || 4567
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`)
})
