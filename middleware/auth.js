// middleware/auth.js
export function roleCheck(...allowedRoles) {
  // allowedRoles ej: ['ADMIN','USER','INVITADO'] ó ['ADMIN','USER']
  const allowedSet = new Set(allowedRoles.map((r) => String(r).toUpperCase()))

  return (req, res, next) => {
    // leer cabecera x-role (case-insensitive)
    const raw = req.headers['x-role'] || req.get('x-role') || ''
    const header = String(raw).trim()

    // mapping de alias comunes del frontend / BBDD
    const map = {
      ADMIN: 'ADMIN',
      USER: 'USER',
      USUARIO: 'USER',
      GUEST: 'INVITADO',
      INVITADO: 'INVITADO',
    }

    const normalized = map[header.toUpperCase()] || header.toUpperCase()

    // debug: opcional — imprime cabecera cuando fallan accesos
    // console.log('roleCheck: raw=', raw, 'normalized=', normalized);

    if (allowedSet.has(normalized)) {
      return next()
    }

    return res.status(403).json({ message: 'Forbidden - role not allowed', role: normalized })
  }
}
