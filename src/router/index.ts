/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    createRouter,
    createWebHistory,
    type RouteRecordRaw,
    type NavigationGuardNext,
    type RouteLocationNormalized,
} from 'vue-router';
import { authMiddleware } from './middleware/authMiddleware';

import { useBoUserStore } from '@/stores/boUserStore';

const publicRoutes: Array<RouteRecordRaw> = [
    // Redirects
    {
        path: '/:pathMatch(.*)*',
        redirect: '/backoffice/login',
    },
    {
        path: '/',
        redirect: '/backoffice/login',
    },
    {
        path: '/backoffice',
        redirect: '/backoffice/login',
    },
    // Login Page
    {
        path: '/backoffice/login',
        name: 'login',
        component: () => import('@/views/LoginView.vue'),
        meta: { requiresAuth: false },
    },
    {
        path: '/backoffice/console',
        name: 'console',
        component: () => import('@/views/HomeView.vue'),
        meta: { requiresAuth: true },
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: publicRoutes,
});

let privateRoutesAdded = false;
export async function loadPrivateRoutes() {
    if (privateRoutesAdded) return;

    console.log('📦 Loading private routes...');
    const privateRoutesModule = await import('./privateRoutes.ts');
    privateRoutesModule.default.forEach((route) => {
        router.addRoute(route);
    });

    privateRoutesAdded = true;
    if (typeof window !== 'undefined') (window as any).privateRoutesAdded = true;
}

export async function setupRouter() {
    const store = useBoUserStore();

    if (!store.initialized) {
        await store.initializeStore();
    }

    if (store.authenticated && !privateRoutesAdded) {
        await loadPrivateRoutes();
    }

    return router;
}

// Auth middleware
router.beforeEach(
    async (
        to: RouteLocationNormalized,
        from: RouteLocationNormalized,
        next: NavigationGuardNext,
    ) => {
        console.log('Auth middleware going from: ', from.path);
        console.log('Auth middleware going to: ', to.path);

        const store = useBoUserStore();
        if (store.authenticated && !(window as any).privateRoutesAdded) {
            await loadPrivateRoutes();
        }

        const auth = await authMiddleware(to);
        if (auth != null && auth !== '') {
            next(auth);
        } else {
            next();
        }
    },
);

export default router;
