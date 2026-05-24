import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'tutor-space-development-secret-key-1234567890'

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: any): string {
  return jwt.sign(payload, PAYLOAD_SECRET, { expiresIn: '2h' })
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, PAYLOAD_SECRET)
  } catch (error) {
    return null
  }
}
