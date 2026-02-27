import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-env';
const REFRESH_SECRET = process.env.REFRESH_SECRET || process.env.JWT_SECRET || 'your-refresh-secret-key';

export interface TokenPayload {
  userId: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

// Access token - short lived (15 minutes)
export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

// Refresh token - long lived (7 days)
export function signRefreshToken(userId: string): { token: string; tokenId: string; expiresAt: Date } {
  const tokenId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const token = jwt.sign(
    { userId, tokenId } as RefreshTokenPayload,
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { token, tokenId, expiresAt };
}

// Legacy function for backward compatibility
export function signToken(payload: TokenPayload): string {
  return signAccessToken(payload);
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);
    return decoded as RefreshTokenPayload;
  } catch (error) {
    return null;
  }
}

// Legacy function for backward compatibility
export function verifyToken(token: string): TokenPayload | null {
  return verifyAccessToken(token);
}
