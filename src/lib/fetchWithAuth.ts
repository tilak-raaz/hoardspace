/**
 * Enhanced fetch wrapper that automatically handles token refresh
 * Use this instead of regular fetch for authenticated API calls
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    // Ensure credentials are included
    const fetchOptions: RequestInit = {
        ...options,
        credentials: 'include',
    };

    // First attempt with current access token
    let response = await fetch(url, fetchOptions);

    // If unauthorized, try to refresh token
    if (response.status === 401) {
        const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
        });

        if (refreshResponse.ok) {
            // Token refreshed successfully, retry original request
            response = await fetch(url, fetchOptions);
        }
    }

    return response;
}

/**
 * Check if user is authenticated
 * This will automatically refresh token if needed
 */
export async function checkAuth(): Promise<{ authenticated: boolean; user?: any }> {
    try {
        const response = await fetchWithAuth('/api/auth/me');

        if (response.ok) {
            const data = await response.json();
            return { authenticated: true, user: data.user };
        }

        return { authenticated: false };
    } catch (error) {
        console.error('Auth check failed:', error);
        return { authenticated: false };
    }
}

/**
 * Logout user and clear all tokens
 */
export async function logout(): Promise<void> {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
    } catch (error) {
        console.error('Logout failed:', error);
    }
}
