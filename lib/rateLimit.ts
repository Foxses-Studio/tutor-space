/**
 * Simple in-memory rate limiter for auth endpoints.
 * Production-এ Redis-based implementation ব্যবহার করুন।
 */

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number }
}

const store: RateLimitStore = {}

export function rateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const key = identifier

  if (!store[key] || now > store[key].resetTime) {
    store[key] = {
      count: 1,
      resetTime: now + windowSeconds * 1000,
    }
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetIn: windowSeconds,
    }
  }

  store[key].count++

  const allowed = store[key].count <= maxRequests
  const resetIn = Math.ceil((store[key].resetTime - now) / 1000)

  return {
    allowed,
    remaining: Math.max(0, maxRequests - store[key].count),
    resetIn,
  }
}

// Clean up expired entries every 30 seconds
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (now > store[key].resetTime) {
      delete store[key]
    }
  })
}, 30000)
