import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export const JWT_SECRET = 'pulse-dev-secret-2024'

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : header

  if (!token) {
    return res.status(401).json({ error: 'Missing token' })
  }

  try {
    const payload = jwt.decode(token)
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    ;(req as any).user = payload
    next()
  } catch (err) {
    console.error(header, err)
    res.status(401).json({ error: 'Invalid token' })
  }
}
