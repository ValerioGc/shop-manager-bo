/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient, { handleApiError } from '@/axios';

import type { ApiStatuses } from '@/types/api/ApiStatuses';
import type { ApiError } from '@/types/api/ApiError';

import type { Faq } from '@/types/entity/Faq';
import type { Show } from '@/types/entity/Show';
import type { Contact } from '@/types/entity/Contact';
import type { Condition } from '@/types/entity/Condition';
import type { Category } from '@/types/entity/Category';
import type { Product } from '@/types/entity/Product';

interface CachedResponse {
    faq: Faq[];
    shows: Show[];
    contact: Contact[];
    condition: Condition[];
    category: Category[];
    product: Product[];
}

interface BoStoreState {
    //################## DEBUG ##################
    logging: boolean;
    debug: boolean;
    //################## MENU ##################
    closingMenu: boolean;
    // ################ API ####################
    controllers: Record<string, AbortController>;
    notifications: { message: string; level: string }[];
    host: string;
    baseBoPath: string;
    endpointPrefix: string;
    apiStatus: string;
    api_statuses: ApiStatuses;
    // ################ Items ####################
    selectedItem: any;
    perPage: number;
    latest_limit: number;
    // ################ Items caching ####################
    cachedResponse: CachedResponse;
}

export const boStore = defineStore('boStore', {
    state: (): BoStoreState => ({
        //################## DEBUG ##################
        logging: false,
        debug: true,
        //################## MENU ##################
        closingMenu: ref(false) as unknown as boolean,
        // ################ API ####################
        controllers: {} as Record<string, AbortController>, // AbortController
        notifications: [],
        host: import.meta.env.VITE_API_ENDPOINT as string,
        baseBoPath: '/backoffice/console',
        endpointPrefix: '/api/private',
        apiStatus: ref('success') as unknown as string,
        api_statuses: {
            condition: 'success',
            category_products: 'success',
            product_categories: 'success',
            product: 'success',
            category: 'success',
            faq: 'success',
            contact: 'success',
            aside_menu: 'success',
            config: 'success',
        },
        // ################ Items ####################
        selectedItem: JSON.parse(sessionStorage.getItem('selectedItem') as string) || {},
        perPage: 8,
        latest_limit:
            (localStorage.getItem('limit') as unknown as number) ||
            (sessionStorage.getItem('limit') as unknown as number) ||
            10,
        // ################ Items caching ####################
        cachedResponse: {
            faq: [],
            shows: [],
            contact: [],
            condition: [],
            category: [],
            product: [],
        },
    }),
    getters: {
        getSelectedItem(state): unknown {
            return state.selectedItem;
        },
        getApiStatus(state): string {
            return state.apiStatus;
        },
    },
    actions: {
        setLatestLimit(limit: number) {
            this.latest_limit = limit;
            localStorage.setItem('limit', String(limit));
            sessionStorage.setItem('limit', String(limit));
        },
        // ************* NOTIFICATIONS ***********
        showMessage(successMessage: string, timeout: number = 7000, type: string = 'error') {
            this.notifications.push({ message: successMessage, level: type });

            setTimeout(() => {
                this.notifications.pop();
            }, timeout);
        },
        handleRemoveToast(index: number) {
            this.notifications.splice(index, 1);
        },
        // ************* ITEMS ***********
        setSelectedItem(item: object) {
            this.selectedItem = item;
            sessionStorage.setItem('selectedItem', JSON.stringify(item));
        },
        clearSelectedItem() {
            this.selectedItem = {};
            sessionStorage.removeItem('selectedItem');
        },
        // ************* Validation ***********
        validateFields(
            object: Record<string, any>,
            fieldsToValidate: string[] = [],
        ): { isValid: boolean; validationErrors: Record<string, string> } {
            let isValid = true;
            const validationErrors: Record<string, string> = {};

            const fields = fieldsToValidate.length ? fieldsToValidate : Object.keys(object);

            for (const field of fields) {
                const value = object[field];

                switch (field) {
                    case 'label_ita':
                    case 'label_eng':
                        if (!value || value.length === 0) {
                            validationErrors[field] = 'Il campo è obbligatorio';
                            isValid = false;
                        } else if (value.length > 255) {
                            validationErrors[field] = 'Il testo è troppo lungo';
                            isValid = false;
                        }
                        break;

                    case 'link_value':
                        if (!value || value.length === 0) {
                            validationErrors[field] = 'Il campo è obbligatorio';
                            isValid = false;
                        } else if (value.length > 1000) {
                            validationErrors[field] = 'Il testo è troppo lungo';
                            isValid = false;
                        }
                        break;

                    case 'image':
                    case 'image_url':
                        if (fields.includes('image') || fields.includes('image_url')) {
                            if (!object.image && !object.image_url) {
                                validationErrors[field] = "L'immagine è obbligatoria";
                                isValid = false;
                            }
                        }
                        break;

                    case 'answer_ita':
                    case 'answer_eng':
                        if (!value || value.length === 0) {
                            validationErrors[field] = 'Il campo è obbligatorio';
                            isValid = false;
                        } else if (value.length < 5) {
                            validationErrors[field] = 'Il testo è troppo corto';
                            isValid = false;
                        } else if (value.length > 1000) {
                            validationErrors[field] = 'Il testo è troppo lungo';
                            isValid = false;
                        }
                        break;

                    case 'start_date':
                        if (!value || value.length === 0) {
                            validationErrors[field] = 'La data di inizio è obbligatoria';
                            isValid = false;
                        } else if (!/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(value)) {
                            validationErrors[field] = 'La data non è valida';
                            isValid = false;
                        }
                        break;

                    case 'end_date':
                        if (value && !/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(value)) {
                            validationErrors[field] = 'La data di fine non è valida';
                            isValid = false;
                        }
                        break;

                    case 'price':
                        if (value === null || value === undefined) {
                            validationErrors[field] = 'Il campo è obbligatorio';
                            isValid = false;
                        } else if (value < 0) {
                            validationErrors[field] = 'Il prezzo non può essere negativo';
                            isValid = false;
                        }
                        break;

                    case 'quantity':
                        if (value === null || value === undefined) {
                            validationErrors[field] = 'Il campo è obbligatorio';
                            isValid = false;
                        } else if (value < 0) {
                            validationErrors[field] = 'La quantità non può essere negativa';
                            isValid = false;
                        }
                        break;

                    case 'name':
                        if (value == null || value.length === 0) {
                            validationErrors[field] = 'Il campo è obbligatorio';
                            isValid = false;
                        } else if (value.length > 255) {
                            validationErrors[field] = 'Il testo è troppo lungo';
                            isValid = false;
                        }
                        break;

                    case 'email':
                        if (value == null || value.length === 0) {
                            validationErrors[field] = 'Il campo è obbligatorio';
                            isValid = false;
                        } else if (value.length > 255) {
                            validationErrors[field] = 'Il testo è troppo lungo';
                            isValid = false;
                        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                            validationErrors[field] = 'Email non valida';
                            isValid = false;
                        }
                        break;

                    case 'password':
                        if (value == null || value.length === 0) {
                            validationErrors[field] = 'Il campo è obbligatorio';
                            isValid = false;
                        } else if (value.length < 6) {
                            validationErrors[field] =
                                'La password deve essere di almeno 6 caratteri';
                            isValid = false;
                        } else if (value.length > 30) {
                            validationErrors[field] = 'Il testo è troppo lungo';
                            isValid = false;
                        }
                        break;

                    case 'password_confirmation':
                        if (value == null || value.length === 0) {
                            validationErrors[field] = 'Il campo è obbligatorio';
                            isValid = false;
                        } else if (value.length > 30 && object.password > 0) {
                            validationErrors[field] = 'La password è troppo lunga';
                            isValid = false;
                        } else if (object.password !== value && object.password.length > 0) {
                            validationErrors[field] = 'Le password non corrispondono';
                            isValid = false;
                        }
                        break;

                    case 'description_ita':
                    case 'description_eng':
                        if (!value || value.length === 0) {
                            validationErrors[field] = 'Il campo è obbligatorio';
                            isValid = false;
                        } else if (value.length > 1000) {
                            validationErrors[field] = 'Il testo è troppo lungo';
                            isValid = false;
                        }
                        break;

                    case 'location':
                        if (!value || value.length === 0) {
                            validationErrors[field] = 'Il campo è obbligatorio';
                            isValid = false;
                        }
                        break;

                    case 'condition_id':
                        if (value === null || value === undefined) {
                            validationErrors[field] = 'Il campo è obbligatorio';
                            isValid = false;
                        }
                        break;

                    default:
                        break;
                }
            }

            return { isValid, validationErrors };
        },
        // ************* API METHODS ***********
        async apiDispatcher(
            uri: string,
            httpMethod: string,
            callName: string,
            object?: object,
        ): Promise<any> {
            // Cancel previous request if still pending
            if (this.controllers[callName]) {
                this.controllers[callName].abort();
            }

            const controller = new AbortController(); // Create new AbortController
            this.controllers[callName] = controller;

            this.apiStatus = 'loading';
            this.api_statuses[callName] = 'loading';

            let result = null;
            const url = this.host + this.endpointPrefix + uri;
            console.info('calling: ', url);
            try {
                switch (httpMethod) {
                    case 'GET':
                        result = await apiClient.get(url, { signal: controller.signal });
                        break;
                    case 'POST':
                        result = await apiClient.post(url, object, { signal: controller.signal });
                        break;
                    case 'DELETE':
                        result = await apiClient.delete(url, { signal: controller.signal });
                        break;
                    default:
                        throw new Error(`Unsupported HTTP method: ${httpMethod}`);
                }

                await this.manageApiStatus(result, callName);
            } catch (error) {
                if ((error as ApiError).name === 'AbortError') {
                    console.warn('Request was aborted');
                    this.apiStatus = 'success';
                    await this.manageApiStatus({ response: { status: 200, data: [{}] } }, callName);
                } else {
                    await this.manageApiStatus(error, callName);
                    return handleApiError(error as ApiError);
                }
            }

            if (callName === 'saveFaqs') {
                return result;
            }

            return result ? result.data : null;
        },
        async manageApiStatus(response: any, callName: string): Promise<void> {
            if (response.code === 'ERR_CANCELED') {
                console.warn('Request was aborted');
                return;
            }
            if (
                response &&
                response.status === 200 &&
                response.data &&
                response.data.length === 0
            ) {
                this.apiStatus = 'empty';
                this.api_statuses[callName] = 'empty';
            } else if (response && response.status === 200) {
                this.apiStatus = 'success';
                this.api_statuses[callName] = 'success';
            } else {
                this.apiStatus = 'error';
                this.api_statuses[callName] = 'error';
            }
        },
        async getDataApi(url: string): Promise<object | null> {
            try {
                const uri = url;
                const response = await apiClient.get(url);
                console.info('Data fetched from:' + uri + ' | response: ' + response);
                return response;
            } catch (error) {
                return handleApiError(error as ApiError);
            }
        },
        async postDataApi(uri: string, object: object): Promise<object | null> {
            try {
                const response = await apiClient.post(uri, object);
                console.info('Response: ' + response);
                return response;
            } catch (error) {
                console.warn('Error fetching data:', error);
                if ((error as ApiError).response && (error as ApiError).response.status === 422) {
                    return { status: 422, data: (error as ApiError).response.data };
                }
                return handleApiError(error as ApiError);
            }
        },
        async deleteDataApi(uri: string): Promise<object | null> {
            try {
                const response = await apiClient.delete(uri);
                console.log('Data fetched:', response);
                return response;
            } catch (error) {
                return handleApiError(error as ApiError);
            }
        },
        // ************* SEARCH API ***********
        async searchApi(url: string): Promise<object | null> {
            this.apiStatus = 'loading';
            const uri = this.host + this.endpointPrefix + url;
            try {
                const response = await apiClient.get(uri);
                console.log(response.data);
                if (response.data && response.data.data.length > 0) {
                    this.apiStatus = 'success';
                    console.log('Data fetched:', response.data);
                    return response.data;
                } else {
                    this.apiStatus = 'empty';
                    return null;
                }
            } catch (error) {
                this.apiStatus = 'error';
                console.error('Error fetching data:', error);
                return null;
            }
        },
        // ************* TRANSLATE API ***********
        async translateText(text: string): Promise<string> {
            const parsedText = text.replace(/<[^>]*>/g, '');
            try {
                const url = this.host + this.endpointPrefix + '/translate';

                const response = await apiClient.post(url, { q: parsedText });

                if (response.status === 200) {
                    this.showMessage('Traduzione effettuata con successo', 5000, 'success');
                    return response.data.data.translations[0].translatedText;
                } else {
                    this.showMessage('Errore nella traduzione', 5000, 'error');
                    console.error('Error fetching data:', response);
                    return 'error';
                }
            } catch (error) {
                this.showMessage('Errore nella traduzione', 5000, 'error');
                console.error('Error fetching data:', error);
                return 'error';
            }
        },
    },
});
