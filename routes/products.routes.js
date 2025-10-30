import { Router } from 'express'
import { pool } from '../db.js'
import { roleCheck } from '../middleware/auth.js'

const router = Router()

router.get('/productos', roleCheck('ADMIN', 'USER', 'INVITADO'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener los productos', error: error.message })
  }
})

router.post('/productos', roleCheck('ADMIN', 'USER'), async (req, res) => {
  const sqlquery = 'INSERT INTO products (code, name, type, caliber, quantity, estado, description) VALUES (?, ?, ?, ?, ?, ?, ?)'
  try {
    const { code, name, type, caliber, quantity, estado, description } = req.body
    const [result] = await pool.query(sqlquery, [code, name, type, caliber, quantity, estado, description])
    res.status(201).json({ msg: 'Producto creado', id: result.insertId })
  } catch (error) {
    res.status(500).json({ msg: 'Error al crear el producto', error: error.message })
  }
})

router.put('/productos/:code', roleCheck('ADMIN', 'USER'), async (req, res) => {
  const sqlquery = 'UPDATE products SET  name = ?, type = ?, caliber = ?, quantity = ?, estado = ?, description = ? WHERE code = ?'
  try {
    const { code, name, type, caliber, quantity, estado, description } = req.body
    const [result] = await pool.query(sqlquery, [name, type, caliber, quantity, estado, description, code])
    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'Producto no encontrado' })
    }
    res.json({ msg: 'Producto actualizado' })
  } catch (error) {
    res.status(500).json({ msg: 'Error al actualizar el producto', error: error.message })
  }
})

router.delete('/productos/:code', roleCheck('ADMIN', 'USER'), async (req, res) => {
  const sqlquery = 'DELETE FROM products WHERE code = ?'
  try {
    const { code } = req.params
    const [result] = await pool.query(sqlquery, [code])
    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'Producto no encontrado' })
    }
    res.json({ msg: 'Producto eliminado' })
  } catch (error) {
    res.status(500).json({ msg: 'Error al eliminar el producto', error: error.message })
  }
})

export default router
