import { cookies } from 'next/headers';
import { verifyAccessToken, TokenPayload } from './jwt';

/**
 * Get authenticated user from HttpOnly cookie
 * Use this in your API routes to protect endpoints
 */
export async function getAuthUser(): Promise<TokenPayload | null> {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;

        if (!accessToken) {
            return null;
        }

        const payload = verifyAccessToken(accessToken);
        return payload;

    } catch (error) {
        return null;
    }
}

/**
 * Middleware helper to require authentication
 * Returns user payload or throws error response
 */
export async function requireAuth(): Promise<TokenPayload> {
    const user = await getAuthUser();

    if (!user) {
        throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return user;
}
