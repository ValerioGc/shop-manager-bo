import { defineStore } from 'pinia';
import apiClient, { encrypt, decrypt, handleApiError } from '@/axios.ts';
import router from '@/router/index';

interface User {
    username: string | null;
    img: string | null;
}

interface AuthError {
    message: string;
    icon: string;
    field?: string;
}

interface LoginData {
    username: string;
    password: string;
    remember: boolean;
}

interface BoUserStoreState {
    authDebug: boolean;
    loading: boolean;
    loadingType: string;
    authenticated: boolean;
    loggedInUser: User;
    sessionToken: string | null;
    localToken: string | null;
    errors: AuthError[];
    initialized: boolean;
}

export const useBoUserStore = defineStore('boUserStore', {
    state: (): BoUserStoreState => ({
        authDebug: true,
        loading: false,
        loadingType: '',
        authenticated: sessionStorage.getItem('authenticated') === 'true',
        loggedInUser: JSON.parse(sessionStorage.getItem('loggedInUser') as string) ||
            JSON.parse(localStorage.getItem('loggedInUser') as string) || {
                username: null,
                img: null,
            },
        sessionToken: sessionStorage.getItem('token'),
        localToken: localStorage.getItem('token'),
        errors: [],
        initialized: false,
    }),
    actions: {
        async initializeStore(): Promise<void> {
            console.log('🔹 Initializing store...');

            const localToken = localStorage.getItem('token');
            const sessionToken = sessionStorage.getItem('token');
            const authenticated = sessionStorage.getItem('authenticated') === 'true';

            const loggedInUser =
                JSON.parse(sessionStorage.getItem('loggedInUser') as string) ||
                JSON.parse(localStorage.getItem('loggedInUser') as string);

            if (loggedInUser && (localToken || sessionToken)) {
                this.sessionToken = sessionToken ? decrypt(sessionToken) : null;
                this.localToken = localToken ? decrypt(localToken) : null;
                this.authenticated = authenticated;
                this.loggedInUser = loggedInUser;
            } else {
                console.log('❌ No valid session found, forcing logout.');
                this.authenticated = false;
            }
            this.initialized = true;

            console.log(`✅ Store initialized | Authenticated: ${this.authenticated}`);
        },
        setLoading(value: boolean): void {
            this.loading = value;
        },
        // ############## AUTH ##############
        async login(loginData: LoginData): Promise<string | void> {
            this.errors = [];
            console.log('Login data:', loginData);

            try {
                const response = await apiClient.post('/auth/login', {
                    email: loginData.username,
                    password: loginData.password,
                });

                console.log('Login response:', response);

                if (response.status === 200) {
                    const { token, name: username, image_url: img } = response.data;
                    const encryptedToken = encrypt(token);
                    const loggedInUser: User = { username, img };

                    this._setAuthData(loggedInUser, encryptedToken, loginData.remember);

                    console.log('Waiting for private routes to load...');

                    router.push('/backoffice/console');
                    return 'ok';
                } else if (response.status === 401) {
                    this._handleLoginError({ response: 'Credenziali errate', status: '401' });
                } else {
                    this._handleApiError({
                        response: 'Errore comunicazione server',
                        status: '500',
                    });
                }
            } catch (error) {
                console.log('Login error:', error);
                this._handleApiError(error);
            }
        },
        async refreshToken(
            context: string = 'default',
            remember: boolean = false,
        ): Promise<boolean> {
            try {
                const response = await apiClient.post('/auth/refresh');

                if (response.status === 200 && response.data.token) {
                    const { token } = response.data;
                    const encryptedToken = encrypt(token);

                    const loggedInUser = this.loggedInUser;

                    if (context === 'default') {
                        console.log('Refresh token default:', encryptedToken);
                        this._setAuthData(loggedInUser, encryptedToken, remember);
                    } else {
                        console.log('Refresh token check:', encryptedToken);
                        this._setAuthData(loggedInUser, encryptedToken, false);
                    }

                    return true;
                }
                return false;
            } catch (error) {
                console.error('Refresh token error:', error);
                return false;
            }
        },
        async logout(): Promise<void> {
            try {
                if (!this.sessionToken && !this.localToken) {
                    await apiClient.post('/auth/logout', {
                        token: this.sessionToken || this.localToken,
                    });
                }
                this._clearAuthData();
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                await router.push('/backoffice/login');
            }
        },
        getDecryptedToken(): string | null {
            const token = this.localToken || this.sessionToken;
            if (token) {
                return decrypt(token);
            }
            return null;
        },
        _setAuthData(loggedInUser: User, token: string, remember: boolean): void {
            this.loggedInUser = loggedInUser;
            this.sessionToken = token;
            this.authenticated = true;
            this.localToken = token;

            sessionStorage.setItem('authenticated', 'true');
            sessionStorage.setItem('token', token);

            console.log('token: ' + token);
            console.log('Token set: ' + sessionStorage.getItem('token'));

            console.log('Session user:', loggedInUser);
            sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));

            if (remember) {
                console.log('Remember me:', token);
                this.localToken = token;
                localStorage.setItem('token', token);
                localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
            }
        },
        _clearAuthData(): void {
            this.authenticated = false;
            sessionStorage.removeItem('authenticated');
            this.sessionToken = null;
            sessionStorage.removeItem('token');
            this.localToken = null;
            localStorage.removeItem('token');
            sessionStorage.removeItem('loggedInUser');
            localStorage.removeItem('loggedInUser');
        },
        // ############## Error handling ##############
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _handleLoginError(message: any): void {
            this.errors.push({ message, icon: 'exclamation' });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _handleApiError(error: any): void {
            const { error: errorMessage } = handleApiError(error);
            if (error.response && error.response.status === 422) {
                const errors = error.response.data.message;
                console.warn('errors: ' + errors);
                if (errors) {
                    Object.keys(errors).forEach((key: string) => {
                        errors[key].forEach((err: string) => {
                            this.errors.push({
                                field: key,
                                message: err,
                                icon: 'success',
                            });
                        });
                    });
                }
            } else {
                let mess: string | null = null;
                if (errorMessage === 'Network Error') {
                    mess = 'Comunicazione con il server assente';
                }

                this.errors.push({ message: mess || errorMessage, icon: 'exclamation' });
            }
        },
    },
});
