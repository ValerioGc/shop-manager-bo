// router/middleware/redirect.ts
import type { Router } from 'vue-router';

let router: Router | undefined;

export function setRouter(newRouter: Router): void {
    router = newRouter;
}

export function redirectToLogin(): void {
    if (router) {
        console.log('Redirecting to login, router not set');
        router.push('/backoffice/login');
    } else {
        console.error('Router not set!');
    }
}
