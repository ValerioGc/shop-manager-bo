<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { boStore } from "@/stores/boStore";
import RelationTable from "@/components/tables/RelationTable.vue";
import MultiRelationTable from "@/components/tables/MultiRelationTable.vue";
import InputSelect from './partials/InputSelect.vue';
import AssociationViewer from '@/components/utils_components/AssociationViewer.vue';
import InputCheckbox from './partials/InputCheckbox.vue';

interface Props {
    entity: string;
    mode: string;
    id: string;
}

const props = defineProps<Props>();

const router = useRouter();
const route = useRoute();
const store = boStore();

const emit = defineEmits<{
    (e: 'validate', isValid: boolean): void;
    (e: 'openModal', image: string, images: string[]): void
}>();

const selLabel = ref<string | null>(null);

// *********** Category Product Model ***********
interface CategoryProductModel {
    category_id: string | null;
    products: number[];
}
const categoryProduct = ref<CategoryProductModel>({
    category_id: null,
    products: []
});

// *********** Product Category Model ***********
interface ProductCategoryModel {
    product: string | null;
    categories: number[];
}
const productCategory = ref<ProductCategoryModel>({
    product: null,
    categories: []
});

// Products: array of objects with an "id" property.
const products = ref<{ id: number, label_ita: string }[]>([]);
const showCatPrd = ref<boolean>(false);

// Update categoryProduct.products when products change.
watch(products, () => {
    if (products.value.length > 0) {
        categoryProduct.value.products = products.value.map(product => product.id);
    }
});

// Categories: using imported type "Category"
const categories = ref<{ id: number, label_ita: string }[]>([]);
watch(categories, () => {
    if (categories.value.length > 0) {
        productCategory.value.categories = categories.value.map(category => category.id).filter((id): id is number => id !== undefined);
    }
});

// *********** Get Element Relation Association ***********
async function getElementRelationAssociation(): Promise<void> {
    if (!categoryProduct.value.category_id && !productCategory.value.product) return;

    const url =
        '/catProduct/' +
        (props.entity === 'Categorie Prodotti' ? 'category' : 'product') + '/' +
        (props.entity === 'Categorie Prodotti'
            ? categoryProduct.value.category_id
            : productCategory.value.product) + '/' +
        (props.entity === 'Categorie Prodotti' ? 'product' : 'category') +
        '/get';

    try {
        await store.apiDispatcher(
            url,
            'GET',
            props.entity === 'Categorie Prodotti' ? 'category_products' : 'product_categories'
        ).then((res) => {
            console.log(res.data);
            if (props.entity === 'Prodotti Categorie') {
                categories.value = res.data.categories;
            } else {
                products.value = res.data.products;
            }
        });
    } catch (error) {
        console.error(error);
    }
}

// *********** Category Options for Selector ***********
const associationType = ref<number | null>(null);
const opt = ref<Array<{ value: number; label: string }>>([
    { value: 0, label: 'Macro Categoria' },
    { value: 1, label: 'Categorie' },
    { value: 2, label: 'Sotto Categoria' }
]);

// *********** Get relations ***********
watch(() => categoryProduct.value.category_id, () => {
    getElementRelationAssociation();
}, { deep: true });

watch(() => productCategory.value.product, () => {
    getElementRelationAssociation();
}, { deep: true });


// *********** Validation ***********
const validateField = (): boolean => {
    let valid = true;
    if (props.entity === 'Categorie Prodotti') {
        if (!categoryProduct.value.category_id)
            valid = false;
        if (!categoryProduct.value.products)
            valid = false;
    } else {
        if (!productCategory.value.product)
            valid = false;
        if (!productCategory.value.categories)
            valid = false;
    }
    return valid;
};

// *********** Watch for Category or Product Changes ***********
watch(categoryProduct, (newVal) => {
    store.setSelectedItem(newVal);
    if (props.mode === 'edit' || props.mode === 'new') {
        const isValid = validateField();
        emit('validate', isValid);
    }
}, { deep: true });

watch(productCategory, (newVal) => {
    store.setSelectedItem(newVal);
    if (props.mode === 'edit' || props.mode === 'new') {
        const isValid = validateField();
        emit('validate', isValid);
    }
}, { deep: true });

// *********** Remove Element from List (for categories) **********
const removeElement = (id: number): void => {
    const index = categories.value.findIndex(category => category.id === id);
    console.log('removing product with index: ' + index);
    if (index !== -1) {
        console.log('removing product with index: ' + index);
        categories.value.splice(index, 1);
    }
    productCategory.value.categories = categories.value.map(category => category.id).filter((id): id is number => id !== undefined);
    if (categories.value.length === 0) {
        productCategory.value.categories = [];
        console.log('categoryProduct.value.products ' + productCategory.value.categories);
    }
};

// *********** Remove Product Element from List **********
const removeProductElement = (id: number): void => {
    const index = products.value.findIndex(product => product.id === id);
    console.log('removing product with index: ' + index);
    if (index !== -1) {
        console.log('removing product with index: ' + index);
        products.value.splice(index, 1);
    }
    categoryProduct.value.products = products.value.map(product => product.id);
    if (products.value.length === 0) {
        categoryProduct.value.products = [];
        console.log('categoryProduct.value.products ' + categoryProduct.value.products);
    }
};

// *********** Reset selected primary ***********
function resetComponent(): void {
    productCategory.value = { product: null, categories: [] };
    categoryProduct.value = { category_id: null, products: [] };
    associationType.value = null;
    selLabel.value = null;
}

function resetC(): void {
    resetComponent();
    if (props.entity === 'Categorie Prodotti') {
        router.push({ name: 'categoryProduct', params: { id: null, label: null } }).then(() => { });
    } else {
        router.push({ name: 'productCategory', params: { id: null, label: null } }).then(() => { });
    }
}

watch(() => props.mode, () => {
    resetComponent();
}, { immediate: true });

watch(() => props.entity, () => {
    resetComponent();
});

onMounted(() => {
    resetComponent();
    if (props.id) {
        if (route.params.label && (route.params.label as string).length > 0) {
            console.log('setting selLabel: ' + route.params.label);
            selLabel.value = route.params.label as string;
        }
    }
    if (props.entity === 'Categorie Prodotti') {
        store.setSelectedItem(categoryProduct.value);
        if (props.id && selLabel.value !== null) {
            categoryProduct.value.category_id = props.id;
        }
    } else {
        store.setSelectedItem(productCategory.value);
        if (props.id && selLabel.value !== null) {
            console.log('setting productCategory.product: ' + props.id + ' -selLabel ' + selLabel.value);
            productCategory.value.product = props.id;
        }
    }
});
</script>

<template>
    <!--  Category Product  -->
    <div class="container_cat_prod" v-if="props.entity === 'Categorie Prodotti'">
        <div v-if="selLabel || props.mode === 'edit'" class="fixed_header">

            <h2 class="label_title"> Aggiungi prodotti in <em>{{ selLabel }}</em></h2>

            <button v-if="props.mode === 'edit' || selLabel" class="btn_custom btn_cust_danger"
                :disabled="store.apiStatus === 'loading'" type="button" @click.prevent="resetC()">
                <img src="@/assets/icons/arrows/arrow-left.svg" alt="back" loading="lazy" />
                <span>Reset</span>
            </button>
        </div>
        <div v-else>
            <div class="cat_selector">
                <InputSelect label="Tipo categoria" name="opt" v-model="associationType" :options="opt"
                    :multitype="false" :float="false" placeholder="Seleziona un tipo categoria" />
            </div>

            <transition name="fade">
                <div v-if="associationType !== null">
                    <RelationTable :entity="'Categorie'" query="category" :title="true" :read="true"
                        :filter="associationType" v-model="categoryProduct.category_id"
                        @update:label="selLabel = $event" />
                </div>
            </transition>
        </div>

        <transition name="slide-in">
            <div v-if="categoryProduct.category_id !== null">
                <MultiRelationTable v-if="categoryProduct.category_id !== null" v-model="products" :entity="'Prodotti'"
                    :filter="null" query="product" :title="false" />

                <div v-if="products && products.length > 0" class="edit_view_categories">
                    <div class="cat_cont">
                        <h5>
                            Visualizza prodotti associati
                        </h5>
                        <div>
                            <InputCheckbox v-model="showCatPrd" name="showCatPrd" :lblEnable="false" />
                        </div>
                    </div>
                    <div v-if="showCatPrd">
                        <RelationTable :entity="'Prodotti Associati'" :read="false" :title="false" query="product"
                            :mode="'edit'" :list="products" v-model="products" @remove="removeProductElement" />
                    </div>
                </div>
            </div>
        </transition>
    </div>

    <!--  Association Product in Category  -->
    <div class="container_cat_prod" v-else>

        <div>
            <!-- Selected Product view -->
            <div class="fixed_header" v-if="selLabel || props.mode === 'edit'">

                <h2 class="label_title"> Aggiungi <em>{{ selLabel }}</em> nella categoria: </h2>

                <button type="button" class="btn_custom btn_cust_danger" v-if="props.mode === 'edit' || selLabel"
                    @click.prevent="resetC()" title="Reset associazione" :disabled="store.apiStatus === 'loading'">
                    <img src="@/assets/icons/arrows/arrow-left.svg" alt="back" loading="lazy" />
                    <span>Reset</span>
                </button>
            </div>

            <!-- Select Product -->
            <div v-else class="sub_section">
                <RelationTable :entity="'Prodotti'" :read="true" :title="true" query="product"
                    v-model="productCategory.product" @update:label="selLabel = $event" />
            </div>
        </div>

        <transition name="fade">
            <div v-if="productCategory.product">
                <div class="sub_section">
                    <InputSelect label="Tipo categoria" name="opt" v-model="associationType" :options="opt"
                        :multitype="false" :float="false" placeholder="Seleziona un tipo categoria" />
                </div>
                <MultiRelationTable v-if="associationType !== null" :entity="'Categorie'" query="category"
                    :title="false" :filter="associationType" v-model="categories" />

                <div v-if="categories.length > 0">
                    <AssociationViewer class="edit_view_categories" v-model="categories" :mode="props.mode"
                        :entity="'Categorie'" @update:categories="removeElement" />
                </div>
            </div>
        </transition>
    </div>
</template>

<style lang="scss" scoped>
.cat_selector {
    margin: 1.5rem auto;
}

.container_cat_prod {
    padding: 0.5rem;
    margin-bottom: 1rem;

    @media screen and (min-width: 768px) {
        padding: 0.75rem;
    }

    @media screen and (min-width: 992px) {
        padding: 1rem;
    }

    @media screen and (min-width: 1200px) {
        padding: 1.25rem;
    }

    @media screen and (min-width: 1600px) {
        padding: 1.5rem;
    }

    .fixed_header {
        @extend %fx_between_center;
        padding-bottom: 1rem;

        em {
            letter-spacing: 1px;
            color: #00093b;
            font-weight: bold;
            padding: .25rem;
            font-size: 1.2rem
        }
    }

    .btn_custom {
        @extend %fx_center;
        margin: 0;

        &.btn_cust_danger img {
            margin: auto;
            margin-right: .35rem;
        }

        img {
            width: 1.2rem;
            height: 1.2rem;
            margin-right: 0.5rem;
            filter: invert(1);
        }
    }

    .sub_section {
        padding-bottom: 1rem;
        margin: 1rem;
    }
}
</style>
