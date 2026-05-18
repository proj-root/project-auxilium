import type { CookieOptions as CookieOptionsType } from "express"

export const AuthConfig = {
  jwtSecret: process.env.JWT_SECRET || 'auxilium_secret',
  jwtExpiry: parseInt(process.env.JWT_EXPIRY || '900'), // default 15 minutes
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'auxilium_refresh_secret',
  jwtRefreshExpiry: parseInt(process.env.JWT_REFRESH_EXPIRY || '2592000'), // default 30 days

  saltRounds: parseInt(process.env.SALT_ROUNDS || '10'),
}

export const CookieConfig = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: parseInt(process.env.COOKIE_MAXAGE || '2592000000'), // default 30 days
} satisfies CookieOptionsType;