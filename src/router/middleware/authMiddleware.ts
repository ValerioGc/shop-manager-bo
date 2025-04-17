// router/middleware/authMiddleware.ts
import { useBoUserStore } from '@/stores/boUserStore';
import type { RouteLocationNormalized } from 'vue-router';

const loginUrl: string = '/backoffice/login';

export async function authMiddleware(to: RouteLocationNormalized): Promise<string> {
    const store = useBoUserStore();

    const isAuthenticated = store.authenticated;
    const token = store.localToken;
    const sessionToken = store.sessionToken;

    console.log(`🔹 Checking auth for route: ${to.fullPath}`);
    console.log(
        `🔹 Authenticated: ${isAuthenticated} | Token: ${token ? '✔' : '❌'} | Session Token: ${sessionToken ? '✔' : '❌'}`,
    );

    if (to.name === 'login' && isAuthenticated) {
        console.log('🔹 Already logged in, redirecting to console...');
        return '/backoffice/console';
    }

    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (sessionToken) {
            if (isAuthenticated) {
                console.log('✅ AUTH-GUARD | Authenticated');
                return '';
            } else {
                console.log(
                    '🟡 Session token not found, but the user is autenticated, trying to validate token',
                );
                try {
                    const refreshed = await store.refreshToken('check');
                    if (refreshed) {
                        console.log('✅ Valid Token, access granted.');
                        return '';
                    } else {
                        console.log('❌ Token not valid, redirecting to login.');
                        return loginUrl;
                    }
                } catch (error) {
                    console.error('❌ Error validating token:', error);
                    return loginUrl;
                }
            }
        } else if (token) {
            console.log('🟡 Session token not found, using local token...');
            try {
                const refreshed = await store.refreshToken('default');
                if (refreshed) {
                    console.log('✅ Local token valid, access granted.');
                    return '';
                } else {
                    console.log('❌ Local token invalid, redirecting to login.');
                    return loginUrl;
                }
            } catch (error) {
                console.error('❌ Error validating local token:', error);
                return loginUrl;
            }
        } else {
            console.log('❌ No token found, redirecting to login.');
            return loginUrl;
        }
    }

    return '';
}
