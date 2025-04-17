<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { boStore } from "@/stores/boStore";

import InputText from "./partials/InputText.vue";
import InputSelect from "./partials/InputSelect.vue";
import InputCheckbox from "./partials/InputCheckbox.vue";

import RelationTable from "@/components/tables/RelationTable.vue";
import MultiRelationTable from '@/components/tables/MultiRelationTable.vue';
import ResultsPlaceholder from '@/components/utils_components/placeholders/ResultsPlaceholder.vue';
import TextPlaceholder from '@/components/utils_components/placeholders/TextPlaceholder.vue';
import CommonSpinner from '@/components/utils_components/placeholders/CommonSpinner.vue';
import EngTextWrapper from "@/components/utils_components/EngTextWrapper.vue";


interface Props {
    mode: string;
    entity: string;
    id: string;
}

const props = defineProps<Props>();

const store = boStore();
const route = useRoute();

const category = ref<Category>({
    label_ita: '',
    label_eng: '',
    type: null,
    parent: null,
    parent_id: null,
    products: []
});

// ********** Pagination **********
const currentPage = ref<number>(Number(route.query.page) || 1);
const limit = 5;
const totalElements = ref<number>(0);

const paginatedProducts = ref<Product[]>([]);

function handlePageUpdate(page: number): void {
    currentPage.value = page;
    const start = (currentPage.value - 1) * limit;
    const end = start + limit;
    paginatedProducts.value = products.value.slice(start, end);
}

// ********** Validation **********
const emit = defineEmits<{ (e: 'validate', isValid: boolean): void }>();
const validationErrors = ref<Record<string, string>>({});

watch(category, (newVal) => {
    store.setSelectedItem(newVal);
    if (props.mode === 'edit' || props.mode === 'new') {
        const { isValid, validationErrors: errors } = store.validateFields(newVal, ['label_ita', 'label_eng']);
        validationErrors.value = errors;
        emit('validate', isValid);
    }
}, { deep: true });

/**
 * Get the category object from the API
 * @returns {Promise<void>}
 */
async function getCategory(): Promise<void> {
    const url = '/category/get/' + props.id;
    await store.apiDispatcher(url, 'GET', 'category')
        .then((arr) => {
            category.value = arr.data;
            products.value = arr.data.products.data || [];
            totalElements.value = arr.data.products.total;
        });
}

// **************** Parent Association *****************
interface Option {
    value: number;
    label: string;
}

const opt = ref<Option[]>([]);
const cat_association = ref<boolean>(false);
const associationType = ref<number | null>(null);

watch(associationType, (newVal) => {
    if (newVal === 0 || newVal === null) {
        category.value.parent_id = null;
    } else {
        category.value.parent_id = newVal;
    }
});

/**
 * Set the category type based on the entity
*/
function setCategoryType(): void {
    opt.value = [];
    if (props.entity === 'Macro Categorie') {
        category.value.type = 0;
    } else if (props.entity === 'Categorie') {
        category.value.type = 1;
        opt.value.push({ value: 0, label: 'Macro Categoria' });
    } else {
        category.value.type = 2;
        opt.value.push({ value: 0, label: 'Macro Categoria' });
        opt.value.push({ value: 1, label: 'Categoria' });
    }
}

// ********** Product Association management **********
const show_product_association = ref<boolean>(false);
const prod_association = ref<boolean>(false);
const products = ref<Product[]>([]);

/**
 * Watch the products array and update the category object
 */
watch(products, () => {
    category.value.products = products.value.map(product => product.id);
    handlePageUpdate(currentPage.value);
});

/**
 * Remove a product from the products array
 * @param id {number} - The id of the product to remove
 */
const removeElement = (id: number): void => {
    products.value = products.value.filter(product => product.id !== id);
    handlePageUpdate(currentPage.value);
};

/**
 * Reset the component data
 */
watch(() => route.name, () => {
    resetComponentData();
    setCategoryType();
});

watch(() => props.mode, (newVal) => {
    resetComponentData();
    if (newVal === 'edit')
        getCategory();
});

function resetComponentData(): void {
    show_product_association.value = false; // flag for showing associated products
    products.value = []; // associated products
    cat_association.value = false; // flag for showing associated categories
    associationType.value = null; // associated category type
    prod_association.value = false; // flag for showing associated products
    currentPage.value = 1; // current page

    category.value = {
        label_ita: '',
        label_eng: '',
        type: null,
        parent: null,
        parent_id: null,
        products: []
    };
}

/**
 * Remove the parent category from the category object
*/
function removeParent(): void {
    if (props.mode !== 'edit') {
        category.value.parent_id = null;
    } else {
        category.value.parent_id = -1;
    }
    category.value.parent = null;
}

onMounted(async () => {
    setCategoryType();
    if (props.mode === 'edit' || props.mode === 'read')
        await getCategory();
});

import type { Product } from '@/types/entity/Product';
import type { Category } from '@/types/entity/Category';
</script>

<template>

    <!-- Read mode -->
    <div v-if="props.mode === 'read'" class="read">

        <div>
            <div class="_read_block">
                <p class="form_label read_label">
                    Nome
                </p>
                <span v-if="category.label_ita">
                    {{ category.label_ita }}
                </span>
                <TextPlaceholder v-else-if="store.api_statuses.category === 'loading'" mode="block" />
            </div>
            <div class="_read_block">
                <EngTextWrapper class="form_label read_label">Nome </EngTextWrapper>
                <span v-if="category.label_eng">
                    {{ category.label_eng }}
                </span>
                <TextPlaceholder v-else-if="store.api_statuses.category === 'loading'" mode="block" />
            </div>
        </div>

        <div v-if="category.type !== 0" class="parent_container">
            <h4 class="form_label">Categoria contenitore: </h4>
            <p v-if="category.parent">{{ category.parent }}</p>
            <TextPlaceholder v-else-if="store.api_statuses.category === 'loading'" mode="block" alig="0" />
            <span v-else-if="!category.parent || category.parent === ''"> - </span>
        </div>

        <!-- Linked Products -->
        <div class="edit_view_categories" v-if="products && products.length > 0">
            <div class="cat_cont">
                <h5>
                    Prodotti Associati
                </h5>
                <button class="btn_custom btn_cust_primary" type="button"
                    :disabled="store.api_statuses.category === 'loading'"
                    @click.prevent="show_product_association = !show_product_association">
                    <img src="@/assets/icons/buttons/eye.svg" alt="add" loading="eager" />
                </button>
            </div>

            <div v-if="show_product_association">
                <RelationTable v-if="products && products.length > 0" :entity="'Products'" :read="false" query="product"
                    :list="products" :title="false" :mode="props.mode"
                    @update:modelValue="(val: any) => { products = val as Product[] }" @remove="removeElement"
                    @update:currentPage="handlePageUpdate" />
                <CommonSpinner :mode="'spinner'" v-else-if="store.apiStatus === 'loading' && products.length === 0" />
                <ResultsPlaceholder v-else :btn="false" />
            </div>
        </div>

    </div>

    <!-- Edit/Create mode -->
    <div class="edit_create" v-else>
        <div>
            <InputText label="Nome" :name="category.label_ita" v-model="category.label_ita"
                :class="validationErrors.label_ita ? 'error' : ''" class="form_partial_container " :translate="false" />
            <span v-if="validationErrors.label_ita" class="error_message">{{ validationErrors.label_ita }}</span>
        </div>

        <div>
            <InputText label="Nome" :name="category.label_eng" :ogText="category.label_ita" v-model="category.label_eng"
                :class="validationErrors.label_eng ? 'error' : ''" class="form_partial_container " :translate="true" />
            <span v-if="validationErrors.label_eng" class="error_message">{{ validationErrors.label_eng }}</span>
        </div>


        <!-- Parent Category container -->
        <div v-if="category.type !== 0" class="edit_view_categories">
            <div class="cat_cont">
                <div>
                    <h5 class="category_cont_title">
                        Categoria contenitore<span v-if="category.parent">:</span>
                    </h5>

                    <span v-if="category.parent" class="parent_label">
                        {{ category.parent }}
                        <img src="@/assets/icons/buttons/x-circle-red.svg" alt="add" loading="lazy"
                            @click.prevent="removeParent" />
                    </span>
                    <TextPlaceholder v-else-if="store.api_statuses.category === 'loading' && props.mode !== 'new'"
                        :mode="'single'" :type="'inline'" :animation="'glow'" />
                    <span
                        v-else-if="!category.parent && props.mode !== 'new' || category.parent === '' && props.mode !== 'new'">
                        - </span>
                </div>

                <InputCheckbox v-model="cat_association" name="cat_association" :lblEnable="false" />
            </div>


            <div v-if="cat_association">
                <InputSelect :label="'Tipo categoria'" :name="'categoria'" v-model="associationType" :options="opt"
                    :float="false" :placeholder="'Seleziona un tipo categoria'" />

                <RelationTable v-if="associationType != null" :entity="'Categories'" query="category" :read="true"
                    v-model="category.parent_id" :filter="associationType" />
            </div>
        </div>

        <!-- Product association container -->
        <div class="edit_view_categories">
            <div class="cat_cont">
                <h5>Associazione prodotti</h5>
                <InputCheckbox v-model="prod_association" name="prod_association" :lblEnable="false" />
            </div>
            <div v-if="prod_association === true">
                <MultiRelationTable :entity="'Prodotti'" :filter="null" :title="false" query="product"
                    v-model="products" />

                <RelationTable v-if="products && products.length > 0" :entity="'Products'" :read="false" query="product"
                    :list="products" :title="false" :mode="props.mode"
                    @update:modelValue="(val: any) => { products = val as Product[] }" @remove="removeElement"
                    @update:currentPage="handlePageUpdate" />

                <CommonSpinner :mode="'spinner'" v-else-if="store.apiStatus === 'loading'" />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.edit_view_categories {
    margin: 1rem auto;
}

.form_checks_container {
    @extend %fx_center;
    margin: auto;
    position: relative;
    gap: .5rem;
    width: 80%;

    &:hover .tooltip_info {
        display: block;
    }

    .form_checks {
        color: var(--secondary-color);
    }

    .tooltip_info {
        display: none;
        position: absolute;
        bottom: 100%;
        left: 0;
        background-color: var(--secondary-color-light);
        color: white;
        padding: .5rem;
        border-radius: 6px;
        box-shadow: 0 0 6px -2px rgb(124, 124, 124);
        z-index: 1;
    }

    img {
        width: 20px;
        height: 20px;
        cursor: pointer;
    }
}

.read_label {
    font-weight: bold;
    color: var(--secondary-color);
    font-size: 1.2rem;
}

._read_block {
    text-align: center;
}

.read_label {
    margin: .25rem 0;
    text-align: center;
}

.description_container {
    margin-bottom: .2rem;
    padding: .35rem 0;

    .read_label {
        display: block;
        margin-bottom: .75rem;
        border-bottom: .1px solid var(--secondary-color-dark);
    }
}

.status_icon {

    &>* {
        vertical-align: middle;
    }

    img {
        width: 25px;
        height: 25px;
    }
}

.category_cont_title {
    display: inline;

    span {
        display: inline;
        padding-right: .5rem;
    }
}

.cat_cont {
    margin: 1rem auto;

    .btn_custom {
        margin: 0 !important;
        vertical-align: middle;

        img {
            margin: 0;
        }
    }
}

.text_placeholder {
    width: 25% !important;
}

.parent_label {
    font-style: italic;
    font-weight: .8rem;
    display: block;
    background-color: var(--secondary-color-light);
    color: white;
    padding: .15rem;
    padding-left: .35rem;
    border-radius: 6px;
    position: relative;
    border: 1px solid var(--secondary-color);

    @media screen and (min-width: 580px) {
        padding-right: .5rem;
        display: inline-block;
    }

    img {
        position: absolute;
        right: 0;
        top: 0;
        width: 20px;
        height: 20px;
        cursor: pointer;
        transform: translate(40%, -40%);
    }
}

.act_text {
    display: none;

    @media screen and (min-width: 1200px) {
        display: inline-block;
    }
}

.read,
.edit_create {
    padding: .75rem 1rem;

}

.read {
    .parent_container {

        h4,
        p,
        span {
            display: inline;
        }

        p {
            padding-left: 1rem;
        }

        span {
            padding: 0 1rem;
        }
    }

    div {
        margin-bottom: 1rem;
    }
}

.btn_custom img {
    filter: invert(1);
    margin: 0;
    width: 20px;
    height: 20px;

    @media screen and (min-width: 1200px) {
        margin-left: .5rem;
    }
}
</style>
