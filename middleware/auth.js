export function roleCheck(...rolesAllowed) {
  const permitidos = rolesAllowed.map((role) => String(role).toUpperCase())
  return (req, res, next) => {
    const roleHeader = req.header('x-role') || ''
    const role = String(roleHeader).toUpperCase()

    if (!role) {
      return res.status(401).json({ msg: 'No se proporcionó el role en la cabecera' })
    }
    if (!permitidos.includes(role)) {
      return res.status(403).json({ msg: `El role ${role} no tiene permiso para realizar esta acción` })
    }
    req.role = role
    next()
  }
}
