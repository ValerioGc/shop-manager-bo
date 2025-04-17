<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import { boStore } from "@/stores/boStore";

import MainLayout from "@/components/layout/MainLayout.vue";
import CommonTable from "@/components/tables/CommonTable.vue";
import BoSectionTitle from "@/components/layout/layout_elements/BoSectionTitle.vue";
import ErrorBanner from "@/components/messages/ErrorBanner.vue";
import RouterPager from "@/components/utils_components/pagers/RouterPager.vue";
import MsgToast from "@/components/messages/MsgToast.vue";
import ResultsPlaceholder from "@/components/utils_components/placeholders/ResultsPlaceholder.vue";


const store = boStore();
const route = useRoute();
const router = useRouter();

interface Props {
    mode: string;
    entity: string;
    be_query: string;
    text_query?: string;
    type?: string;
    fields: string[];
    details: string[];
}

const props = defineProps<Props>();

// *************** Pagination Management ***************
const sct = ref('formatted_updated_at');
interface SortDetails {
    field: string;
    direction: string;
}
const currentSort = ref<SortDetails>({ field: 'updated_at', direction: 'desc' });
const currentPage = ref<number>(Number(route.query.page) || 1);
const perPageOptions = ref<number[]>([5, 10, 15, 25, 50]);
const perPage = ref<number>((route.query.limit as unknown as number) || store.latest_limit || perPageOptions.value[0]);

/**
 * Get the current entity 
 * Used to determine the entity to be used in the router link
 * @returns {string} - The current entity
 */
function getCurrentEntity(): string {
    if (props.be_query === 'category' && route.name !== 'search') {
        switch (props.entity) {
            case 'Macro Categorie':
                return 'macro-category';
            case 'Sotto Categorie':
                return 'sub-category';
            case 'Categorie':
                return 'category';
        }
    }
    return props.be_query;
}

// *************** Items Management ***************
const itemList = ref<unknown[]>([{}, {}, {}, {}, {}, {}, {}]);
const totalItems = ref<number>(0);
let isFetching = false; // Flag to avoid duplicate calls
let currentRequest: string | null = null; // Track the current request

/**
 * Get the items from the API
 * Check if the items are already being fetched.
 * Build the URL based on the current page, per-page value, and sort details.
 * @param {SortDetails | null} payload - The sort details
 * @returns {Promise<void>}
 */
async function getItems(payload: SortDetails | null): Promise<void> {
    if (isFetching) return;
    isFetching = true;

    let select: string | null = null;
    if (payload) {
        if (payload.field === 'formatted_updated_at') {
            payload.field = 'updated_at';
        }
        select = `&orderBy=${payload.field}&order=${payload.direction}`;
    }

    let select2: string | null = null;
    let tp: number | null = null;
    let prefix: string | null = null;
    if (props.entity === 'Macro Categorie' || props.entity === 'Categorie' || props.entity === 'Sotto Categorie') {
        switch (props.entity) {
            case 'Macro Categorie':
                tp = 0;
                break;
            case 'Categorie':
                tp = 1;
                break;
            case 'Sotto Categorie':
                tp = 2;
                break;
        }
        select2 = `&type=${tp}`;
        prefix = '/type';
    }

    let select3: string | null = null;
    if (props.entity === 'Bozze Prodotti') {
        select3 = '&draft=true';
    } else if (props.entity === 'Prodotti non categorizzati') {
        select3 = '&uncat=true';
    }

    let select4: string | null = null;
    console.log(categories_options_selected.value);
    if (categories_options_selected.value) {
        select4 = `&category=${categories_options_selected.value.value}`;
        console.log(select4);
    }

    const url = `/${props.be_query}` +
        `/paginate${prefix ? prefix : ''}?` +
        `page=${currentPage.value}` +
        `&limit=${perPage.value}` +
        `${select}` +
        `${select2 ? select2 : ''}` +
        `${select3 ? select3 : ''}` +
        `${select4 ? select4 : ''}`;

    console.log('url:', url);

    currentRequest = url;

    try {
        const method = 'GET';
        await store.apiDispatcher(url, method, props.be_query)
            .then((res) => {
                if (url !== currentRequest) return;

                if (
                    res != null &&
                    res.data != null &&
                    res.data.data != null &&
                    res.data.length === 0 &&
                    res.data.data.length === 0
                ) {
                    store.apiStatus = 'empty';
                } else {
                    if (
                        props.entity === 'Prodotti' ||
                        props.entity === 'Prodotti venduti' ||
                        props.entity === 'Cestino Prodotti' ||
                        props.entity === 'Bozze Prodotti' ||
                        props.entity === 'Macro Categorie' ||
                        props.entity === 'Categorie' ||
                        props.entity === 'Sotto Categorie' ||
                        props.entity === 'Prodotti non categorizzati'
                    ) {
                        console.log('res:', res);
                        totalItems.value = res.total;
                        itemList.value = res.data;

                        if (itemList.value.length === 0 && currentPage.value > 1) {
                            currentPage.value = currentPage.value - 1;
                            router.push({ query: { ...route.query, page: 1 } });
                        }
                    } else {
                        totalItems.value = res.data.total;
                        itemList.value = res.data.data;
                    }
                    store.apiStatus = 'success';
                }
            });
    } catch (error) {
        if (url === currentRequest) {
            store.apiStatus = 'error';
            console.log(error);
        }
    } finally {
        isFetching = false;
        if (url === currentRequest) {
            currentRequest = null;
        }
    }
}

/**
 * Search products by query.
 * @returns {Promise<void>}
 */
async function search(): Promise<void> {
    const url = `/search?entity=${props.type}&query=${props.text_query}&page=${currentPage.value}&limit=${perPage.value}&orderBy=created_at&order=asc`;

    currentRequest = url;

    await store.searchApi(url)
        .then((res: any) => {
            if (url !== currentRequest) return;

            if (res != null) {
                itemList.value = res.data || [];
                totalItems.value = res ? res.total : 0;
            } else {
                itemList.value = [];
            }
        })
        .catch((error) => {
            if (url === currentRequest) {
                store.apiStatus = 'error';
                console.log(error);
            }
        })
        .finally(() => {
            if (url === currentRequest) {
                currentRequest = null;
            }
        });
}

/**
 * Fetch the items from the API.
 * Manage the API call method based on the mode.
 * @param {SortDetails} sortDetails - The sort details.
 * @returns {Promise<void>}
 */
async function fetchItems(sortDetails: SortDetails): Promise<void> {
    if (props.mode === 'search')
        search();
    else
        getItems(sortDetails);
}

// *************** Table methods ***************
/**
 * Handle the sort of the table.
 * Update the sort field and fetch the items.
 * @param {SortDetails} sortDetails - The sort details.
 * @returns {void}
 */
function handleSort(sortDetails: SortDetails): void {
    sct.value = sortDetails.field;
    currentSort.value = sortDetails;
    fetchItems(sortDetails);
}

/**
 * Handle the change of the page from the table.
 * Update the current page in the store and the route.
 * @param {number} page - The new page number.
 * @returns {void}
 */
function handlePageChangeFromTable(page: number): void {
    currentPage.value = page;
    router.push({ query: { ...route.query, page: page } });
    fetchItems(currentSort.value);
}

/**
 * Handle the change of the per-page value.
 * Reset the current page to 1 and update the limit in the store.
 * @returns {void}
 */
function handlePerPageChange(): void {
    currentPage.value = 1;
    store.setLatestLimit(perPage.value);
    router.push({ query: { ...route.query, page: 1, limit: perPage.value } });
    fetchItems(currentSort.value);
}

// *************** Watcher event Handlers ***************
/**
 * Watch for changes in the route.
 * Reset the current page and the per-page value.
 */
watch(route, (newRoute, oldRoute) => {
    if (newRoute.path !== oldRoute.path) {
        currentPage.value = 1;
        perPage.value = perPageOptions.value[0];
    }
});

/**
 * Watch for changes in the route and the query.
 * Fetch the items if the route has changed.
 */
watch([route, () => props.be_query], async () => {
    if (!isFetching) {
        fetchItems(currentSort.value);
    }
});

onMounted(async () => {
    fetchItems(currentSort.value);
});

/**
 * Reset the current request and the fetching flag when leaving the route.
 */
onBeforeRouteLeave((to, from, next) => {
    if (currentRequest) {
        currentRequest = null;
        isFetching = false;
    }
    next();
});

const associationType = ref<number | null>(null);
const categories_options = ref<any[]>([]);
const categories_options_selected = ref<any>(null);

function getAllCategories(): void {
    store.apiDispatcher('/category/all/' + associationType.value, 'GET', 'category')
        .then((res) => {
            categories_options.value = res.data.map((item: { id: number; label_ita: string; }) => ({ value: item.id, label: item.label_ita }));
        });
}

watch(() => associationType.value, () => {
    categories_options_selected.value = null;
    getAllCategories();
});

watch(() => categories_options_selected.value, () => {
    getItems(currentSort.value);
});

</script>

<template>
    <MainLayout>

        <MsgToast :errors="[]" type="info" />

        <div class="item_list_head_container"
            :class="{ 'split': props.entity !== 'Cestino Prodotti' || route.name !== 'search' }">

            <!-- Section title -->
            <BoSectionTitle>
                <h1 class="page_title" v-if="props.mode === 'search'">
                    Ricerca {{ props.type }} per "<strong><em> {{ props.text_query }}</em></strong>"
                </h1>
                <h1 class="page_title" v-else>Lista {{ props.entity }}</h1>
            </BoSectionTitle>

            <!-- Select per page and add item -->
            <div class="list_stock_selector">
                <div class="pageSelector">
                    <label for="perPage" class="lblSelector form_label"
                        :class="{ 'splo': props.entity !== 'Cestino Prodotti' && route.name !== 'search' }">
                        Elementi
                    </label>
                    <div class="form_select_wrapper">
                        <select class="form_select" name="perPage" v-model="perPage"
                            :disabled="store.apiStatus === 'loading' || totalItems === 0"
                            @change.prevent="handlePerPageChange">
                            <option v-for="option in perPageOptions" :key="option" :value="option">{{ option }}</option>
                        </select>
                        <div class="icon"></div>
                    </div>
                </div>

                <!-- Add new item button -->
                <div class="new_item_btn" v-if="props.entity !== 'Cestino Prodotti' && route.name !== 'search'"
                    :class="{ 'dis_cont': store.apiStatus === 'loading' }">
                    <RouterLink class="btn_custom btn_cust_primary"
                        :to="'/backoffice/console/' + getCurrentEntity() + '/new'"
                        :class="{ 'dis': store.apiStatus === 'loading' }">
                        <img src="@/assets/icons/aside/plus.svg" alt="plus" loading="eager" />
                        <span>Aggiungi</span>
                    </RouterLink>
                </div>
            </div>
        </div>

        <hr />

        <div class="common_table_container">

            <CommonTable class="common_table" :query="props.be_query" :list="itemList" :entity="props.entity"
                :fields="props.fields" :details="props.details" :sct="sct" @updateSort="handleSort"
                @update:currentPage="handlePageChangeFromTable" @refresh="fetchItems(currentSort)" />

            <!-- Results placeholder -->
            <ResultsPlaceholder
                v-if="itemList === null && store.apiStatus !== 'loading' || itemList != null && itemList.length === 0 && store.apiStatus !== 'loading'"
                :btn="false" />

            <!-- Error banner -->
            <ErrorBanner v-if="store.apiStatus === 'error'" />

            <!-- Pagination -->
            <RouterPager v-if="totalItems > perPage" :listSize="totalItems" :perPage="Number(perPage)"
                @update:currentPage="handlePageChangeFromTable" />
        </div>
    </MainLayout>
</template>


<style lang="scss">
.multiselect_container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .5rem;
    margin: 1rem 0;
    flex-direction: column;

    @media screen and (min-width: 480px) {
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        gap: 1.25rem;
    }

    button {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
}

.multiselect__single {
    position: absolute;
    top: .5rem;
    left: .5rem;
}

.multiselect__content {
    width: 100%;
    padding: 0;
}

.multiselect__tags-wrap {
    display: none;
}

.multiselect__element {
    width: 100%;

    span {
        width: 100%;
        display: block;
        padding: .5rem;
    }

    cursor:pointer;

    &:hover {
        background-color: var(--secondary-color);
        color: white;
    }
}

#multiselect {
    width: 100% !important;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.multiselect__placeholder {
    display: none;
}

.multiselect {
    position: relative;
}

.multiselect__content-wrapper {
    position: absolute;
    top: 100%;
    z-index: 99999;
    background: #f5f5f5;
    overflow-y: scroll;
    max-height: 200px !important;
    padding-bottom: 0 !important;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    width: 100%;

}

.multiselect__input {
    width: 100%;
    position: unset !important;

    cursor: pointer;
    text-overflow: ellipsis;
    display: block;
    width: 100%;
    padding: .5rem 2.25rem .35rem .5rem !important;

    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #000;
    appearance: none;
    background-color: #ffffff;
    background-position: right .75rem center;
    background-size: 16px 12px;
    border: 1px solid #dedede;
    border-radius: 6px;
    transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;

    &:focus-visible {
        outline: auto .2px var(--secondary-color);
        box-shadow: 0 0 6px .10rem var(--secondary-color-light);
    }

    option::first-letter {
        text-transform: capitalize !important;
    }
}
</style>

<style lang="scss" scoped>
.a {
    &:deep(.input_container) {
        margin-bottom: 0 !important;
    }
}

hr {
    margin: 0;
}

.dis_cont {
    cursor: not-allowed;

    .dis {
        pointer-events: none !important;
        opacity: 0.8;
    }
}

// ********** Page head Container **********
.item_list_head_container {
    @extend %full_wh;
    @extend %fx_between_center;
    padding: 1rem 0;
    gap: .75rem;

    &.split {
        @media screen and (max-width: 480px) {
            flex-direction: column;
        }
    }

    .page_title {
        padding-top: .35rem;
    }

    .list_stock_selector {
        @extend %fx_between_center;

        .pageSelector {
            display: flex;
        }

        .new_item_btn {
            text-align: right;
            padding: 1rem 0;

            .btn_custom {
                display: inline-block;
                margin-left: .35rem;

                img {
                    width: 1.5rem;
                    filter: invert(1);
                }

                span {
                    vertical-align: middle;
                    padding-left: .35rem;
                }
            }
        }
    }

    .lblSelector {
        margin-bottom: 0 !important;
        justify-content: flex-end;
        align-self: center;
        font-weight: bold;
        padding-right: .35rem;

        &.splo {
            display: none;

            @media screen and (min-width: 620px) {
                display: block;
                justify-content: center;
            }
        }
    }
}

// ********** Table container **********
.common_table_container {
    position: relative;
    border-radius: 5px !important;
    margin: 1.8rem auto 2.5rem;
    padding-bottom: 2rem;
}
</style>
