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
  NUEVO: ['Nuevo'],
  USADO: ['Usado'],
  COLECCION: ['Colección', 'Coleccion'],
}

function toDbValue(value, map) {
  if (!value || typeof value !== 'string') return value
  const entry = map[value]
  if (!entry) return value
  return Array.isArray(entry) ? entry[0] : entry
}

function resolveEstadoCandidates(value) {
  if (!value || typeof value !== 'string') return []
  const entry = ESTADO_DB_MAP[value]
  if (!entry) return [value]
  return Array.isArray(entry) ? entry : [entry]
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
    const estadoCandidates = resolveEstadoCandidates(data.estado)
    let dbResult
    let usedEstado = null

    for (const candidate of estadoCandidates) {
      try {
        ;[dbResult] = await pool.query(sqlquery, [data.code, data.name, dbType, data.caliber, data.quantity, candidate, data.description])
        usedEstado = candidate
        break
      } catch (error) {
        const message = String(error?.message || '')
        const isEstadoError = message.includes("Data truncated for column 'estado'")
        const isLast = estadoCandidates.indexOf(candidate) === estadoCandidates.length - 1
        if (!isEstadoError || isLast) {
          throw error
        }
        // intenta siguiente candidato
      }
    }
    if (!dbResult) {
      return res.status(500).json({ msg: 'Error al crear el producto', error: 'No se pudo determinar valor válido para estado' })
    }

    res.status(201).json({ msg: 'Producto creado', id: dbResult.insertId, code: data.code, type: data.type, estado: data.estado, estadoDb: usedEstado })
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
    const estadoCandidates = resolveEstadoCandidates(estado)
    let dbResult
    for (const candidate of estadoCandidates) {
      try {
        ;[dbResult] = await pool.query(sqlquery, [name, dbType, caliber, quantity, candidate, description, codeParam])
        break
      } catch (error) {
        const message = String(error?.message || '')
        const isEstadoError = message.includes("Data truncated for column 'estado'")
        const isLast = estadoCandidates.indexOf(candidate) === estadoCandidates.length - 1
        if (!isEstadoError || isLast) {
          throw error
        }
      }
    }
    if (!dbResult) {
      return res.status(500).json({ msg: 'Error al actualizar el producto', error: 'No se pudo determinar valor válido para estado' })
    }
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
