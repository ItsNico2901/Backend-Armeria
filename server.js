import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.routes.js'
import productsRoutes from './routes/products.routes.js'
import userRoutes from './routes/users.routes.js'

const app = express()

app.use(
  cors({
    origin: true, // o reemplaza por tu origen: 'http://localhost:5173'
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-role', 'X-Requested-With'],
    credentials: false,
  })
)
app.use(express.json())

app.use('/api', authRoutes)
app.use('/api', productsRoutes)
app.use('/api', userRoutes)

const PORT = process.env.PORT || 4567
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`)
})
