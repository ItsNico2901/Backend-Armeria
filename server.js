import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', authRoutes)

const PORT = process.env.PORT || 4567
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`)
})
