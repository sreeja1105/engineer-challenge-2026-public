import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Read the signing secret from the environment. We refuse to start without it,
// so a missing/placeholder secret can never silently weaken auth in production.
const secret = process.env.JWT_SECRET
if (!secret) {
  throw new Error('JWT_SECRET is not set. Add it to server/.env before starting.')
}
export const JWT_SECRET: string = secret

/**
 * Verify a JWT and return its payload, or null if the token is missing/invalid.
 * Uses jwt.verify (not jwt.decode) so a forged or tampered token is rejected.
 */
export function verifyToken(authHeader: string | undefined): jwt.JwtPayload | null {
  const header = authHeader || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : header
  if (!token) return null

  try {
    return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
  } catch {
    return null
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const user = verifyToken(req.headers.authorization)
  if (!user) {
    return res.status(401).json({ error: 'Invalid or missing token' })
  }
  ;(req as any).user = user
  next()
}
