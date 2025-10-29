import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

// Ruta de inicio de sesión
router.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {}

  if (!username || !password) {
    return res.status(400).json({ message: 'Falta alguna credencial' })
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ? AND password_plain = ?', [username, password])

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    res.json({ message: 'Inicio de sesión exitoso' })
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

export default router
