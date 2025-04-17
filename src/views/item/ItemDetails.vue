<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, ref, watch, defineAsyncComponent, shallowRef } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { boStore } from "@/stores/boStore";


import MainLayout from "@/components/layout/MainLayout.vue";
import BoSectionTitle from "@/components/layout/layout_elements/BoSectionTitle.vue";
import ModalComponent from "@/components/utils_components/modals/ModalComponent.vue";
import MsgToast from "@/components/messages/MsgToast.vue";
import CommonSpinner from "@/components/utils_components/placeholders/CommonSpinner.vue";

import ProductField from "@/components/form_fields/ProductField.vue";
const ContactField = defineAsyncComponent(() => import('@/components/form_fields/ContactField.vue'));
const UserField = defineAsyncComponent(() => import('@/components/form_fields/UserField.vue'));
const CategoryCommonField = defineAsyncComponent(() => import('@/components/form_fields/CategoryCommonField.vue'));
const ConditionField = defineAsyncComponent(() => import('@/components/form_fields/ConditionField.vue'));
const FaqField = defineAsyncComponent(() => import('@/components/form_fields/FaqField.vue'));
const ShowField = defineAsyncComponent(() => import('@/components/form_fields/ShowField.vue'));
const CategoryProductField = defineAsyncComponent(() => import('@/components/form_fields/CategoryProductField.vue'));
const ImageModal = defineAsyncComponent(() => import('@/components/utils_components/modals/ImageModal.vue'));

import erase from '@/assets/icons/buttons/eraser.svg';
import repeat from '@/assets/icons/buttons/repeat.svg';

interface Props {
    mode: string;
    be_query: string;
    entity: string;
    entityName: string;
    id?: string;
}

const props = defineProps<Props>();

const store = boStore();
const router = useRouter();
const route = useRoute();

// ************ Parameters ************
const mode = ref<string>(props.mode);
const entity = ref<string>(props.entity);
const entityName = ref<string>(props.entityName);
const id = ref<string>(props.id ?? '');

// ********** Product Update Management **********
/**
 * Update the selected product and set the action to perform.
 * @param updatedProduct - The updated product object.
 * @param act_type - Optional action type.
 */
const handleProductUpdate = (updatedProduct: object, act_type: string | null = null): void => {
    store.setSelectedItem(updatedProduct);

    if (act_type != null) {
        switch (act_type) {
            case 'publish':
                selAction.value = 'publish';
                break;
            case 'delete':
                selAction.value = 'delete';
                break;
            case 'soft-delete':
                selAction.value = 'soft-delete';
                break;
            case 'uncat':
                selAction.value = 'uncat';
                break;
            case 'duplicate':
                selAction.value = 'duplicate';
                break;
        }
    }
};

// ********** Dynamic Component Management **********
const componentMap: Record<string, any> = {
    'Prodotti': ProductField,
    'Utenti': UserField,
    'Contatti': ContactField,
    'Macro Categorie': CategoryCommonField,
    'Categorie': CategoryCommonField,
    'Sotto Categorie': CategoryCommonField,
    'Condizioni': ConditionField,
    'Faqs': FaqField,
    'Fiere': ShowField,
    'Categorie Prodotti': CategoryProductField,
    'Prodotti Categorie': CategoryProductField
};

const DynamicComponent = shallowRef(componentMap[entity.value]);

// ********** Title Management **********
const modeTitle = computed((): string => {
    switch (props.mode) {
        case 'new':
            if (entity.value === 'Categorie Prodotti' || entity.value === 'Prodotti Categorie') {
                return `Associa ${entityName.value}`;
            } else if (entity.value === 'Contatti') {
                return `Aggiungi ${entityName.value}`;
            } else {
                return `Crea ${entityName.value}`;
            }
        case 'edit':
            return `Modifica ${entityName.value}`;
        default:
            return `Dettagli ${entityName.value}`;
    }
});

const title = ref<string>(modeTitle.value);
function setTitle(): string {
    switch (props.mode) {
        case 'new':
            if (props.entity === 'Categorie Prodotti' || props.entity === 'Prodotti Categorie') {
                return `Associa ${props.entityName}`;
            } else if (props.entity === 'Contatti') {
                return `Aggiungi ${props.entityName}`;
            } else {
                return `Crea ${props.entityName}`;
            }
        case 'edit':
            return `Modifica ${props.entityName}`;
        default:
            return `Dettagli ${props.entityName}`;
    }
}

const selectTitleUncat = (): boolean => {
    return store.selectedItem.products.length > 0;
};

function selectBtnIcon(): string {
    return props.mode === 'new' ? erase : repeat;
}

/*
    * Clear the form data and reload the page
*/
function clearData(): void {
    if (props.mode === 'new')
        store.setSelectedItem({});

    window.location.reload();
}

const validatorErrorsvalue = ref<any>({});

/**
 * Save the entity data to the API.
 * @returns {Promise<void>}
 */
const saveEntity = async (): Promise<void> => {
    if (isValid.value === false)
        return;

    if (store.debug) console.log('Saving entity with data:', store.selectedItem);

    const formData = new FormData();

    // Filter fields that are not part of the entity or are not modifiable
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const entityFields = Object.entries(store.selectedItem).filter(([key, value]) => {
        return !['id', 'created_at', 'updated_at', 'images_url', 'image_url'].includes(key);
    });

    // Product condition management
    if (entity.value === 'Prodotti' && mode.value === 'edit') {
        store.selectedItem.condition = store.selectedItem.condition ? store.selectedItem.condition.id : null;
    }

    // ****** Multipart request FormData management ********
    entityFields.forEach(([key, value]) => {
        if (entity.value === 'Prodotti' && key === 'condition')
            value = store.selectedItem.condition_id;

        if (key === 'categories' || key === 'products')
            value = JSON.stringify(value);

        if (value !== undefined && value !== null)
            formData.append(key, value.toString());
    });

    // ************ IMAGES MANAGEMENT ************
    if (entity.value === 'Prodotti' || entity.value === 'Fiere') {
        // Product Creator management
        if (entity.value === 'Prodotti' && mode.value === 'new') {
            const vame = sessionStorage.getItem('loggedInUser') || sessionStorage.getItem('loggedInUser');
            if (vame) {
                const vam = JSON.parse(vame);
                formData.append('creator', vam.username);
            }
        }

        // Remove images
        if (Array.isArray(store.selectedItem.images.removed) && store.selectedItem.images.removed.length > 0) {
            store.selectedItem.images.removed.forEach((imageUrl: string, index: number) => {
                formData.append(`remove_images[${index}]`, imageUrl);
            });
        }

        // Images Order Management
        const imagesOrder = (store.selectedItem.images.images_order || []).map((image: any) => ({
            url: image.url,
            filename: image.filename,
            order: image.order
        }));
        formData.append('images_order', JSON.stringify(imagesOrder));

        if (store.selectedItem.images.new.length > 0) {
            store.selectedItem.images.new.forEach((image: any) => {
                formData.append('images[]', image.file);
                console.log('images[]');
                console.table(image.file);
            });
        }
    }

    // Image management for contacts or shows
    if (store.selectedItem.image && store.selectedItem.image instanceof File) {
        formData.append('image', store.selectedItem.image);
    }

    if (store.debug) {
        for (const [key, value] of formData.entries())
            console.log(`${key}: ${value}`);
    }

    let endpoint: string | null = null;
    if (entity.value === 'Categorie Prodotti' || entity.value === 'Prodotti Categorie') {
        endpoint = `/${props.be_query}/${entity.value === 'Categorie Prodotti' ? 'category' : 'product'}/${entity.value === 'Categorie Prodotti' ? 'product' : 'category'
            }/${entity.value === 'Categorie Prodotti' ? store.selectedItem.category_id : store.selectedItem.product}`;
    } else {
        endpoint = `/${props.be_query}/${mode.value}`;
        if (mode.value === 'edit') endpoint += `/${store.selectedItem.id}`;
    }

    if (store.debug) console.log('Endpoint:', endpoint);

    await store.apiDispatcher(endpoint, 'POST', `${props.be_query}`, formData)
        .then((response: any) => {
            if ([500, 422, 404, 401, 'error'].includes(response.status)) {
                if (response.status === 422) {
                    validatorErrorsvalue.value = response.error;
                    if (typeof response.error === 'object') {
                        Object.keys(response.error).forEach(key => {
                            response.error[key].forEach((errorMessage: string) => {
                                store.showMessage(errorMessage, 7000, 'error');
                            });
                        });
                    } else if (typeof response.error === 'string') {
                        store.showMessage(response.error, 7000, 'error');
                    }
                } else {
                    store.showMessage(response.error, 7000, 'error');
                }
            }
            else if (response && (response.status === 'successo' || response.status === 'success' || response.status === 200)) {
                if (props.entity === 'Categorie Prodotti') {
                    const newParams = { ...route.params };
                    delete newParams.id;
                    delete newParams.label;

                    const newQuery = { success: 'true' };

                    router.replace({ name: 'categoryProduct', params: newParams, query: newQuery }).then(() => {
                        store.showMessage('Categoria associata con successo', 5000, 'success');

                        setTimeout(() => {
                            router.go(0);
                        }, 3000);
                    });
                }
                else if (props.entity === 'Prodotti Categorie') {
                    const newParams = { ...route.params };
                    delete newParams.id;
                    delete newParams.label;

                    const newQuery = { success: 'true' };

                    router.replace({ name: 'productCategory', params: newParams, query: newQuery }).then(() => {
                        store.showMessage('Prodotto inserito con successo', 5000, 'success');

                        setTimeout(() => {
                            router.go(0);
                        }, 3000);
                    });
                }
                else if (props.entity === 'Macro Categorie') {
                    router.push({ name: `macro-category-all`, query: { success: 'true' } });
                }
                else if (props.entity === 'Sotto Categorie') {
                    router.push({ name: `sub-category-all`, query: { success: 'true' } });
                }
                else if (props.entity === 'Cestino Prodotti') {
                    router.push({ name: `product-trash`, query: { success: 'true' } });
                }
                else if (props.entity === 'Prodotti') {
                    if (store.selectedItem.draft != null && store.selectedItem.draft)
                        router.push({ name: `product-draft`, query: { success: 'true' } });
                    else
                        router.push({ name: `product-all`, query: { success: 'true' } });
                }
                else {
                    router.push({ name: `${props.be_query}-all`, query: { success: 'true' } });
                    store.showMessage('Elemento salvato con successo', 5000, 'success');
                }
            }
        });
};

// ********** Category - Product Association Management **********
function editCategories(): void {
    if (props.entity === 'Prodotti') {
        router.push({
            name: 'productCategory',
            params: { id: store.selectedItem.id, label: store.selectedItem.label_ita },
            query: { mode: 'edit' }
        }).catch((err) => console.error('Navigation error:', err));
    } else if (props.entity === 'Categorie' || props.entity === 'Macro Categorie' || props.entity === 'Sotto Categorie') {
        router.push({
            name: 'categoryProduct',
            params: { id: store.selectedItem.id, label: store.selectedItem.label_ita },
            query: { mode: 'edit' }
        }).catch((err) => console.error('Navigation error:', err));
    }
}

// ********** Watchers **********
watch(() => props.entity, (newEntity: string) => {
    entity.value = newEntity;
    DynamicComponent.value = componentMap[newEntity];
    title.value = setTitle();
});

watch(() => props.mode, (newMode: string) => {
    mode.value = newMode;
    title.value = setTitle();
});

/**
 * Publish or unpublish a product
 * And update the draft status of the product
 * @param id - Product id
 */
function publish(id: string): void {
    const endpoint = `/product/draft/${id}`;
    store.apiDispatcher(endpoint, 'POST', 'product')
        .then((response: any) => {
            if (response && (response.status === 'successo' || response.status === 'success' || response.status === 200)) {
                console.log('Publish response:', response);
                const newDraftStatus = !store.selectedItem.draft;
                const successMessage = newDraftStatus ? 'Prodotto spostato in bozza!' : 'Prodotto pubblicato con successo!';

                store.selectedItem.draft = newDraftStatus;
                store.showMessage(successMessage, 5000, 'success');
            } else {
                store.showMessage('Errore durante la pubblicazione del prodotto', 5000, 'error');
            }
        })
        .catch((error: any) => {
            router.push({ name: (props.entity === 'Categorie Prodotti' ? 'categoryProduct' : 'productCategory'), query: { success: 'false', draft: !store.selectedItem.draft as unknown as string } }).catch(() => { });
            store.showMessage(error.message, 5000, 'error');
        });
}

// ********** Confirmation Modal Management **********
const shwActions = ref<boolean>(false);
const selAction = ref<string>('');

function manageModal(action: string): void {
    if (action === 'ok') {
        if (selAction.value === 'publish') {
            publish(store.selectedItem.id);
        }
        else if (selAction.value === 'delete') {
            store.apiDispatcher(`/${props.be_query}/delete/${store.selectedItem.id}`, 'POST', props.be_query)
                .then((response: any) => {
                    if (response && (response.status === 'successo' || response.status === 'success')) {
                        router.push({ name: `${props.be_query}-all`, query: { success: 'true' } });
                    } else {
                        store.showMessage('Errore durante l\'eliminazione dell\'elemento', 7000, 'error');
                    }
                })
                .catch((error) => {
                    if (store.debug) console.error('Error during delete:', error);
                    store.showMessage('Errore durante l\'eliminazione dell\'elemento', 7000, 'error');
                });
        }
        else if (selAction.value === 'soft-delete') {
            store.apiDispatcher(`/product/soft/delete/${store.selectedItem.id}`, 'POST', 'product')
                .then((response: any) => {
                    if (response && (response.status === 'successo' || response.status === 'success')) {
                        router.push({ name: `${props.be_query}-all`, query: { success: 'true' } });
                    } else {
                        store.showMessage('Errore durante l\'eliminazione dell\'elemento', 7000, 'error');
                    }
                })
                .catch((error) => {
                    if (store.debug) console.error('Error during soft delete:', error);
                    store.showMessage('Errore durante l\'eliminazione dell\'elemento', 7000, 'error');
                });
        }
        else if (selAction.value === 'uncat') {
            try {
                store.apiDispatcher(`/category/${store.selectedItem.id}/product/unlink`, 'POST', 'category')
                    .then((response: any) => {
                        if (response && (response.status === 'successo' || response.status === 'success')) {
                            store.showMessage('Associazioni eliminate con successo', 4000, 'success');

                            setTimeout(() => {
                                location.reload();
                            }, 2000);
                        } else {
                            if (response.status === 422) {
                                store.showMessage("Errore durante l'eliminazione delle associazioni", 7000, 'error');
                                return;
                            }
                            store.showMessage(response.error, 7000, 'error');
                        }
                    });
            }
            catch (error) {
                if (store.debug) console.error('Error during unlinking products:', error);
                store.showMessage('Errore durante l\'eliminazione delle associazioni', 7000, 'error');
            }
        }
        else if (selAction.value === 'duplicate') {
            try {
                store.apiDispatcher(`/product/clone/${store.selectedItem.id}`, 'POST', 'product')
                    .then((response: any) => {
                        if (response && (response.status === 'successo' || response.status === 'success')) {
                            store.showMessage('Prodotto duplicato con successo', 4000, 'success');

                            setTimeout(() => {
                                router.push({ name: 'product-edit', params: { id: response.product_id } })
                                    .then(() => {
                                        location.reload();
                                    });
                            }, 1500);
                        } else {
                            store.showMessage(response.error, 7000, 'error');
                        }
                    });
            } catch (error) {
                if (store.debug) console.error('Error during product duplication:', error);
                store.showMessage('Errore durante la duplicazione de prodotto', 7000, 'error');
            }
        }
    }
    showCommonModal.value = false;
}

function toggleCommonModal(): void {
    showCommonModal.value = !showCommonModal.value;
}

// *************** Validation ***************
const isValid = ref<boolean>(false);
const handleValidation = (result: boolean): void => {
    isValid.value = result;
};

// ********** Image Modal Management **********
const showModal = ref<boolean>(false);
const showCommonModal = ref<boolean>(false);
const currentImage = ref<string>('');
const modalImages = ref<string[]>([]);

/**
 * Open the image modal.
 * @param image - The current image URL.
 * @param images - Array of images.
 */
function handleOpenModal(image: string, images: string[]): void {
    currentImage.value = image;
    modalImages.value = images;
    showModal.value = true;
}

/**
 * Close the image modal.
 */
function closeModal(): void {
    showModal.value = false;
}
</script>

<template>
    <MainLayout>

        <transition name="modal">
            <div v-if="showModal" class="modal-overlay">
                <ImageModal :images="modalImages" :currentImage="currentImage" @close="closeModal()" />
            </div>
        </transition>

        <!-- Modal for delete confirmation -->
        <ModalComponent modal-title="Attenzione!" :ok-btn="true" v-if="showCommonModal" @outputAction="manageModal">
            <p v-if="selAction === 'delete'">Sei sicuro di voler eliminare questo elemento?</p>
            <p v-if="selAction === 'soft-delete'">Sei sicuro di voler spostare questo elemento nel cestino?</p>
            <p v-if="selAction === 'uncat'">Sei sicuro di voler eliminare i prodotti associati alla cateogria
                selezionata?</p>
            <p v-if="selAction === 'publish' && store.selectedItem.draft">Conferma publicazione prodotto</p>


            <p v-if="selAction === 'publish' && !store.selectedItem.draft">Conferma spostamento in bozza</p>
            <p v-if="selAction === 'duplicate'"
                v-html="'I dati testuali del prodotto verranno duplicati. <br/> Sei sicuro di voler procedere?'"></p>
        </ModalComponent>

        <!-- Message box for errors -->
        <MsgToast :errors="[]" type="error" />

        <div>

            <!-- Section Title -->
            <div class="item_details_header">
                <BoSectionTitle>
                    <h1>{{ title }}</h1>
                </BoSectionTitle>

                <button v-if="props.mode !== 'read'" type="button" class="btn_custom btn_cust_primary empty_data_btn"
                    @click.prevent="clearData" :disabled="store.apiStatus === 'loading'">
                    <img :src="selectBtnIcon()" alt="Back" loading="lazy" />
                    <span>{{ props.mode === 'new' ? 'Svuota dati' : 'Ricarica dati' }}</span>
                </button>
            </div>

            <hr />

            <!-- Form -->
            <form class="frm custom_form" @submit.prevent="saveEntity"
                :class="{ 'disabled_form_container': store.api_statuses[props.be_query] === 'loading' }">
                <div v-if="props.mode === 'read'">

                    <div class="btn_action_container">
                        <h3 class="form_label">
                            Mostra Azioni
                        </h3>
                        <a href="#" :disabled="store.apiStatus === 'loading'" @click.prevent="shwActions = !shwActions"
                            class="btn_custom btn_cust_primary">
                            <img src="@/assets/icons/aside/plus.svg" alt="Add" loading="lazy" />
                        </a>
                    </div>

                    <hr v-if="shwActions" />

                    <!-- Action Container -->
                    <div class="action_container" v-if="shwActions">

                        <!-- Relation Link button -->
                        <a href="#" :disabled="store.apiStatus === 'loading'" class="btn_custom btn_cust_success"
                            @click.prevent="editCategories" v-if="props.entity === 'Prodotti' || props.entity === 'Macro Categorie'
                                || props.entity === 'Categorie' || props.entity === 'Sotto Categorie'">
                            <img src="@/assets/icons/aside/plus.svg" alt="Add" loading="lazy">
                            <span>
                                <span class="l1">
                                    Associa
                                </span>
                                <span class="l2">
                                    {{ props.entity === 'Prodotti' ? ' Categoria' : ' Prodotti' }}
                                </span>
                            </span>
                        </a>

                        <!-- Publish button -->
                        <a href="#" v-if="props.entity === 'Prodotti'" class="btn_custom btn_cust_primary publish"
                            :disabled="store.apiStatus === 'loading'"
                            @click.prevent="handleProductUpdate(store.selectedItem, 'publish'); toggleCommonModal()">
                            <div v-if="store.selectedItem.draft">
                                <img src="@/assets/icons/aside/draft-t.svg" alt="eye" loading="lazy" />
                                <span>Publica</span>
                            </div>
                            <div v-else>
                                <img src="@/assets/icons/aside/draft-f.svg" alt="eye" loading="lazy" />
                                <span>Bozza</span>
                            </div>
                        </a>

                        <!-- Delete association button -->
                        <a href="#"
                            v-if="props.entity === 'Categorie' || props.entity === 'Macro Categorie' || props.entity === 'Sotto Categorie'"
                            class="btn_custom btn_cust_primary rem_association"
                            :disabled="store.apiStatus === 'loading' || store.selectedItem.products.length === 0"
                            :title="selectTitleUncat() ? 'Elimina associazioni prodotti della categoria' : 'Nessun Prodotto associato alla categoria'"
                            @click.prevent="handleProductUpdate(store.selectedItem, 'uncat'); toggleCommonModal()">
                            <div>
                                <img src="@/assets/icons/aside/draft-t.svg" alt="eye" loading="lazy" />
                                <span class="l2">
                                    Elimina associazioni
                                </span>
                            </div>
                        </a>

                        <!-- Duplicate entity button  -->
                        <a href="#" v-if="props.entity === 'Prodotti'" class="btn_custom btn_cust_primary duplicate"
                            :disabled="store.apiStatus === 'loading'"
                            @click.prevent="handleProductUpdate(store.selectedItem, 'duplicate'); toggleCommonModal()">
                            <div>
                                <img src="@/assets/icons/buttons/duplicate.svg" alt="duplicate" loading="lazy"
                                    width="16px" height="16px" />
                                <span class="l2">
                                    Duplica
                                </span>
                            </div>
                        </a>

                        <!-- Edit buttons -->
                        <RouterLink :class="{ 'disabled': store.apiStatus === 'loading' }"
                            :to="'/backoffice/console/' + props.be_query + '/edit/' + store.selectedItem.id"
                            @click.prevent="handleProductUpdate(store.selectedItem)"
                            class="btn_custom btn_cust_primary">
                            <img src="@/assets/icons/buttons/edit.svg" alt="Edit" loading="lazy" />
                            <span class="l2">
                                Modifica
                            </span>
                        </RouterLink>

                        <!-- Delete buttons -->
                        <a href="#" :disabled="store.apiStatus === 'loading'" class="btn_custom btn_cust_danger"
                            @click.prevent="handleProductUpdate(store.selectedItem, 'soft-delete'); toggleCommonModal()">
                            <img src="@/assets/icons/buttons/trash.svg" alt="Delete" loading="lazy" />
                            <span class="l2">
                                Elimina
                            </span>
                        </a>
                    </div>

                    <hr />
                </div>

                <!-- Dynamic Component -->
                <div class="dynamic_component">
                    <KeepAlive>
                        <component :is="DynamicComponent" :entity="entity" :mode="mode" :id="id"
                            @validate="handleValidation" @openModal="handleOpenModal" />
                    </KeepAlive>
                </div>

                <!-- Save/Edit Button -->
                <div v-if="mode === 'edit' || mode === 'new'" class="submit_container">
                    <button id="sub-btn" class="btn_custom btn_cust_primary" type="submit"
                        :disabled="store.apiStatus === 'loading' || !isValid"
                        :title="!isValid ? 'Dati non validi' : ''">
                        <CommonSpinner v-if="store.apiStatus === 'loading'" mode="loader" :size="'sm'" />
                        <span role="status">
                            {{ mode === 'edit' ? 'Modifica' : 'Salva' }}
                        </span>
                    </button>
                </div>

            </form>
        </div>
    </MainLayout>
</template>

<style lang="scss" scoped>
.disabled_form_container {
    opacity: .5;
    cursor: wait;

    &>* {
        pointer-events: none;
    }
}

.item_details_header {
    @extend %fx_between_center;
    gap: .5rem;

    .empty_data_btn {
        flex-shrink: 0;
        margin: 0;

        img {
            filter: invert(1);
            margin-right: .35rem;
            width: 1.5rem;
            height: 1.5rem;
        }
    }
}

.frm {
    margin-top: 0.75rem;

    @include breakpoint('md') {
        margin-top: 1.25rem;
        margin-bottom: 5rem !important;
    }

    .btn_action_container {
        @extend %fx_between_center;
        padding: 0 1rem;
        width: 100%;

        .form_label {
            font-size: 1.45rem;
            color: var(--secondary-color);
            font-weight: bold;
            margin-bottom: 0;
        }

        .btn_custom {
            margin: 0 !important;
            vertical-align: middle;

            img {
                width: 16px;
                height: 16px;
            }
        }
    }

    .action_container {
        @include flexmin(space-between, center, null, wrap, .2rem);
        padding: 0 .5rem;

        .duplicate {
            background-color: #0098be;
        }

        .publish {
            background-color: #dbc100;
        }

        .btn_custom img {
            margin-right: .35rem;
        }

        .l1 {
            display: none;
            font-size: 0.9rem;

            @media screen and (min-width: 460px) {
                font-size: 1rem;
                display: inline;
            }
        }

        .l2 {
            display: inline;
        }
    }

    .dynamic_component {
        padding: .25rem .5rem;

        @include breakpoint('xs') {
            padding: .25rem .75rem;
        }

        @include breakpoint('sm') {
            padding: .35rem 1rem;
        }

        @include breakpoint('md') {
            padding: .35rem 1.25rem;
        }

        @include breakpoint('lg') {
            padding: .45rem 1.25rem;
        }
    }

    .submit_container {
        text-align: center;
    }
}

.btn_custom {
    display: flex;
    align-items: center;

    &:disabled {
        filter: opacity(.5);
    }

    img {
        filter: invert(1);
    }
}

.disabled,
button.disabled {
    cursor: not-allowed !important;
    opacity: .6 !important;
}

.dynamic_component {
    display: flex;
    flex-direction: column;
    gap: .55rem;
    justify-content: center;
    align-items: stretch;
}
</style>