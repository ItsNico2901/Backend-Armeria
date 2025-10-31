import { Router } from 'express'
import { pool } from '../db.js'
import { roleCheck } from '../middleware/auth.js'
import { validateProduct, validatePartialProduct } from '../validation/schema.js'

const router = Router()

const TYPE_DB_MAP = {
  FUEGO: 'Fuego',
  BLANCO: 'Blanco',
  ELECTRO: 'Electro',
}

const ESTADO_DB_MAP = {
  NUEVO: 'Nuevo',
  USADO: 'Usado',
  COLECCION: 'Colección',
}

function toDbValue(value, map) {
  if (!value || typeof value !== 'string') return value
  return map[value] ?? value
}

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
    const validation = validateProduct(req.body)
    if (!validation.success) {
      return res.status(400).json({ msg: 'Datos del producto inválidos', errors: validation.error.errors })
    }

    const { data } = validation
    const dbType = toDbValue(data.type, TYPE_DB_MAP)
    const dbEstado = toDbValue(data.estado, ESTADO_DB_MAP)
    const [dbResult] = await pool.query(sqlquery, [data.code, data.name, dbType, data.caliber, data.quantity, dbEstado, data.description])

    res.status(201).json({ msg: 'Producto creado', id: dbResult.insertId, code: data.code, type: data.type, estado: data.estado })
  } catch (error) {
    res.status(500).json({ msg: 'Error al crear el producto', error: error.message })
  }
})

router.put('/productos/:code', roleCheck('ADMIN', 'USER'), async (req, res) => {
  const sqlquery = 'UPDATE products SET name = ?, type = ?, caliber = ?, quantity = ?, estado = ?, description = ? WHERE code = ?'
  try {
    const validation = validatePartialProduct(req.body)
    if (!validation.success) {
      return res.status(400).json({ msg: 'Datos del producto inválidos', errors: validation.error.errors })
    }

    const { name, type, caliber, quantity, estado, description } = validation.data
    const codeParam = req.params.code ?? validation.data.code
    const dbType = toDbValue(type, TYPE_DB_MAP)
    const dbEstado = toDbValue(estado, ESTADO_DB_MAP)

    const [dbResult] = await pool.query(sqlquery, [name, dbType, caliber, quantity, dbEstado, description, codeParam])
    if (dbResult.affectedRows === 0) {
      return res.status(404).json({ msg: 'Producto no encontrado' })
    }
    res.json({ msg: 'Producto actualizado', type, estado })
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
