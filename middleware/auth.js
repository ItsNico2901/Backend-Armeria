// middleware/auth.js  (PARCHE TEMPORAL - debug)
export function roleCheck(...allowedRoles) {
  // Devuelve middleware que solo registra la cabecera y permite la petición.
  return (req, res, next) => {
    try {
      const raw = req.headers['x-role'] || req.headers['x-rol'] || ''
      const normalized = String(raw || '')
        .trim()
        .toUpperCase()
      console.log('[ROLECHECK DEBUG] raw=', raw, 'normalized=', normalized, 'allowed=', allowedRoles)
    } catch (e) {
      console.warn('[ROLECHECK DEBUG] parse error', e)
    }
    // No bloquear nada en el parche temporal.
    next()
  }
}
