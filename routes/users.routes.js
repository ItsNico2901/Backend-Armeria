import { Router } from 'express'
import { roleCheck } from '../middleware/auth.js'
import { pool } from '../db.js'

import { validatePartialUser, validateUser } from '../validation/schema.js'

const router = Router()

router.get('/users', roleCheck('ADMIN'), async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, username, role FROM users')
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios' })
  }
})

router.post('/users', roleCheck('ADMIN'), async (req, res) => {
  const sqlquery = 'INSERT INTO users (username, password_plain, role , active) VALUES (?, ?, ?, ?)'

  const { username, password, role, active } = req.body
  try {
    const validation = validateUser(req.body)
    if (!validation.success) {
      return res.status(400).json({ message: 'Datos de usuario inválidos', errors: validation.error.errors })
    }

    const { data } = validation
    const [result] = await pool.query(sqlquery, [data.username, data.password, data.role, data.active])
    res.status(201).json({ id: result.insertId, ...data })
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario', error: error.message })
  }
})

router.put('/users/:username', roleCheck('ADMIN'), async (req, res) => {
  const sqlquery = 'UPDATE users SET password_plain = ?, role = ?, active = ? WHERE username = ?'
  try {
    const validation = validatePartialUser(req.body)
    if (!validation.success) {
      return res.status(400).json({ message: 'Datos de usuario inválidos', errors: validation.error.errors })
    }

    const { password, role, active } = validation.data
    const { username } = req.params

    const [result] = await pool.query(sqlquery, [password, role, active, username])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    res.json({ message: 'Usuario actualizado' })
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message })
  }
})

router.delete('/users/:username', roleCheck('ADMIN'), async (req, res) => {
  const { username } = req.params
  try {
    const [result] = await pool.query('DELETE FROM users WHERE username = ?', [username])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    res.json({ message: 'Usuario eliminado' })
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message })
  }
})

export default router
