// src/axios.ts

import axios, { type AxiosResponse, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useBoUserStore } from '@/stores/boUserStore';
import type { ApiError } from '@/types/api/ApiError';

// ************ AXIOS ************
(window as typeof window & { axios: typeof axios }).axios = axios;
(window as typeof window & { axios: typeof axios }).axios.defaults.headers.common[
    'X-Requested-With'
] = 'XMLHttpRequest';

// CSRF Token from meta
const csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
const csrfToken = csrfMetaTag ? csrfMetaTag.getAttribute('content') : null;

axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken || '';

// ************ API CLIENT ************
const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_ENDPOINT}/api`,
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
    },
});

// ************ REQEUST INTERCEPTORS ************
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        // token CSRF header
        if (csrfToken) {
            config.headers['X-CSRF-TOKEN'] = csrfToken;
        }

        // Token Bearer autHnticazione
        const token = getDecryptedToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Content-Type
        if (config.data instanceof FormData) {
            if (config.headers) {
                config.headers['Content-Type'] = 'multipart/form-data';
            }
        } else {
            if (config.headers) {
                config.headers['Content-Type'] = 'application/json';
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// ************ RESPONSE INTERCEPTORS ************
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            console.warn('🔐 Unauthorized 401: redirecting to login');

            try {
                const store = useBoUserStore();

                if (store.authenticated) {
                    await store.logout();
                }
                store.authenticated = false;
            } catch (logoutError) {
                console.error('❌ Logout after 401 failed:', logoutError);
            }

            return Promise.reject(error);
        }

        return Promise.reject(error);
    },
);

// ************ API ERROR HANDLER ************
interface AppError {
    error: string;
    status: number;
}

function handleApiError(error: ApiError): AppError {
    let message = '⚠️ An unknown error occurred';

    if (error.code === 'ERR_CANCELED') {
        console.warn('⚠️ Request was canceled');
        return { error: 'Request was canceled', status: 200 };
    }

    if (error.response) {
        if (error.response.data && error.response.data.error) {
            message = Array.isArray(error.response.data.error)
                ? error.response.data.error.join(', ')
                : error.response.data.error;
        } else {
            message = Array.isArray(error.response.data.message)
                ? error.response.data.message.join(', ')
                : error.response.data.message || message;
        }
    } else if (error.message) {
        message = error.message;
    }

    console.error('❌ API Error:', message);
    return {
        error: message,
        status: error.response ? (error.response.status ? error.response.status : 500) : 500,
    };
}

// ************ ENCRYPT/DECRYPT ************
function encrypt(data: string): string {
    return btoa(data);
}

function decrypt(data: string): string {
    return atob(data);
}

function getDecryptedToken(): string | null {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
        return decrypt(token);
    }
    return null;
}

export default apiClient;
export { encrypt, decrypt, getDecryptedToken, handleApiError };
