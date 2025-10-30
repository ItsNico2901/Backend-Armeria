import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.routes.js'
import productsRoutes from './routes/products.routes.js'
import userRoutes from './routes/users.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', authRoutes)
app.use('/api', productsRoutes)
app.use('/api', userRoutes)

const PORT = process.env.PORT || 4567
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`)
})
