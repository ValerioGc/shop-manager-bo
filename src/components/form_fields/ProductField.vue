<script setup lang="ts">
import { ref, watch, onMounted, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
import { boStore } from "@/stores/boStore";
import InputText from "./partials/InputText.vue";
import InputNumber from "./partials/InputNumber.vue";
import InputCheckbox from "./partials/InputCheckbox.vue";
import LongText from "./partials/LongText.vue";
import InputSelect from "./partials/InputSelect.vue";

const InputFile = defineAsyncComponent(() => import('./partials/InputFile.vue'));
import MultiRelationTable from "@/components/tables/MultiRelationTable.vue";
import AssociationViewer from "@/components/utils_components/AssociationViewer.vue";
import ResultsPlaceholder from "@/components/utils_components/placeholders/ResultsPlaceholder.vue";
import TextPlaceholder from "@/components/utils_components/placeholders/TextPlaceholder.vue";
import CommonSpinner from "@/components/utils_components/placeholders/CommonSpinner.vue";
import EngTextWrapper from "@/components/utils_components/EngTextWrapper.vue";

import check_x_square from '@/assets/icons/buttons/x-square.svg';
import check_square from '@/assets/icons/buttons/check-square.svg';

import type { Category } from '@/types/entity/Category';
import type MultiFileChange from '@/types/entity/MultiFileChange';
import type { Product } from '@/types/entity/Product';
import type { DOption } from '@/types/entity/DOption';

interface Props {
    mode: string;
}

interface Label {
    id: number;
    label_ita: string;
}

const props = defineProps<Props>();

// Define emits with proper typing
const emit = defineEmits<{
    (e: 'validate', isValid: boolean): void;
    (e: 'update:product', product: Product): void;
    (e: 'upImages', images: Product['images']): void;
    (e: 'openModal', image: string, images: string[]): void;
}>();

const store = boStore();
const route = useRoute();
const productId = route.params.id as string;

const product = ref<Product>({
    id: 0,
    label_ita: '',
    label_eng: '',
    description_ita: '',
    description_eng: '',
    price: '',
    code: '' as string,
    creator: '',
    condition_id: null,
    condition: null,
    quantity: null,
    year: null,
    in_evidence: false,
    deleting: false,
    draft: false,
    images: {
        existing: [],
        new: [],
        removed: [],
        images_order: []
    },
    images_url: [],
    categories: [],
    formatted_updated_at: '',
    created_at: '',
    updated_at: ''
});

const conditions = ref<DOption[]>([]);
const load_relations = ref<boolean>(false);

// ********** Get Product **********
async function getProduct(): Promise<void> {
    await store.apiDispatcher('/product/get/' + productId, 'GET', 'product')
        .then((res) => {
            if (props.mode !== 'new') {
                const productData = res.data;
                product.value = {
                    id: 0,
                    formatted_updated_at: '',
                    created_at: '',
                    updated_at: '',
                    ...productData,
                    in_evidence: Boolean(productData.in_evidence),
                    draft: Boolean(productData.draft),
                    deleting: Boolean(productData.deleting),
                    condition_id: productData.condition ? productData.condition.id : '',
                    images: {
                        existing: productData.images_url.map((url: string, index: number) => ({ url, file: null, id: index })),
                        new: [],
                        removed: [],
                        images_order: productData.images_url.map((url: string, index: number) => ({ url, filename: null, order: index }))
                    },
                    images_url: productData.images_url,
                    categories: productData.categories
                };
                // Update available categories ref (see below)
                categories.value = product.value.categories as (Label)[];
            }
        });
}

// ********** Get Conditions **********
async function getConditions(): Promise<void> {
    if (props.mode === 'read') return;
    await store.apiDispatcher('/condition', 'GET', 'condition')
        .then((res) => {
            conditions.value = res.data.map((condition: { id: number; label_ita: string; }) => ({
                value: condition.id,
                label: condition.label_ita
            }));
            load_relations.value = true;
        });
}

// ********** Image Management **********
const onFileChange = ({ existing, new: newFiles, removed, images_order }: MultiFileChange): void => {
    if (!product.value.images) {
        product.value.images = { existing: [], new: [], removed: [], images_order: [] };
    }
    product.value.images.new = newFiles;
    product.value.images.existing = existing;
    product.value.images.removed = removed;
    product.value.images.images_order = images_order;
    emit('upImages', product.value.images);
};

// ********** CATEGORIES ***********
const categories = ref<(Label)[]>([]);
const cat_association = ref<boolean>(false);
const associationType = ref<number | null>(null);

const options = ref<Array<{ value: string; label: string }>>([
    { value: '0', label: 'Macro categorie' },
    { value: '1', label: 'Categorie' },
    { value: '2', label: 'Sotto categorie' }
]);

watch(categories, () => {
    product.value.categories = categories.value.map(category =>
        typeof category === 'number' ? category : category.id!
    );
}, { deep: true });

const removeElement = (id: number): void => {
    categories.value = categories.value.filter(category => {
        if (typeof category === 'number') return category !== id;
        return category.id !== id;
    });
};

// ********** VALIDATION ***********
const validationErrors = ref<Record<string, string>>({});

watch(product, () => {
    store.setSelectedItem(product.value);
    emit('update:product', product.value);
    if (props.mode === 'edit' || props.mode === 'new') {
        const { isValid, validationErrors: errors } = store.validateFields(product.value, [
            'label_ita', 'label_eng', 'quantity', 'description_ita', 'description_eng', 'condition_id'
        ]);
        validationErrors.value = errors;
        emit('validate', isValid);
    }
}, { deep: true });

// ********** WATCHERS ***********
watch(
    () => [product.value.in_evidence, product.value.draft],
    ([inEvidence, draft], [oldInEvidence, oldDraft]) => {
        if (inEvidence && !oldInEvidence) {
            product.value.draft = false;
        } else if (draft && !oldDraft) {
            product.value.in_evidence = false;
        }
    }
);

watch(() => route.query.success, async (newVal) => {
    if (newVal) {
        try {
            await getProduct();
        } catch (error) {
            console.error('Error refreshing product:', (error as Error).message);
        }
    }
});

watch(() => props.mode, (newVal: string) => {
    if (newVal === 'new') {
        product.value = {
            label_ita: '',
            label_eng: '',
            description_ita: '',
            description_eng: '',
            price: '',
            code: '',
            condition_id: null,
            condition: null,
            quantity: null,
            year: null,
            creator: '',
            in_evidence: false,
            deleting: false,
            draft: false,
            images: {
                existing: [],
                new: [],
                removed: [],
                images_order: []
            },
            images_url: [],
            categories: [],
            id: 0,
            formatted_updated_at: '',
            created_at: '',
            updated_at: ''
        };
    }
    if (newVal === 'edit') {
        getProduct();
    }
    if (newVal === 'edit' || newVal === 'new') {
        getConditions();
    }
    cat_association.value = false;
});

onMounted(async () => {
    if (props.mode === 'new' || props.mode === 'edit')
        await getConditions();

    if (props.mode === 'edit' || props.mode === 'read')
        await getProduct();
    else
        store.setSelectedItem(product.value);
});
</script>

<template>
    <!-- READ Mode-->
    <div v-if="props.mode === 'read'" class="read">
        <div class="read_row_container">
            <div class="status_icon">
                <span class="read_label">
                    In evidenza:
                </span>
                <TextPlaceholder v-if="store.api_statuses.product === 'loading'" mode="btn" />
                <img v-else :src="product.in_evidence ? check_square : check_x_square" alt="true" loading="lazy" />
            </div>

            <div class="status_icon">
                <span class="read_label">
                    Publicato:
                </span>
                <TextPlaceholder v-if="store.api_statuses.product === 'loading'" mode="btn" />
                <img v-else :src="!product.draft ? check_square : check_x_square" alt="true" loading="lazy" />
            </div>
        </div>

        <hr />

        <div class="read_row_container">
            <div class="_read_block">
                <p class="read_label">
                    Nome
                </p>
                <span v-if="product.label_ita">
                    {{ product.label_ita }}
                </span>
                <TextPlaceholder v-else-if="store.api_statuses.product === 'loading'" mode="block" />
            </div>
            <div class="_read_block">
                <EngTextWrapper class="read_label">Nome </EngTextWrapper>
                <span v-if="product.label_eng">
                    {{ product.label_eng }}
                </span>
                <TextPlaceholder v-else-if="store.api_statuses.product === 'loading'" mode="block" />
            </div>
        </div>
        <div class="read_row_container">
            <div class="_read_flex">
                <span class="read_label">
                    Anno:
                </span>
                <span v-if="product.year" class="inline_field">
                    {{ product.year }}
                </span>
                <TextPlaceholder v-else-if="store.api_statuses.product === 'loading'" mode="block" />
            </div>
            <div class="_read_flex">
                <span class="read_label">
                    Condizione:
                </span>
                <span v-if="product.condition" class="capitalize inline_field">{{ product.condition ?
                    product.condition.label_ita : '' }}</span>
                <TextPlaceholder v-else-if="store.api_statuses.product === 'loading'" mode="block" />
            </div>
        </div>
        <div class=" read_row_container">
            <div class="_read_flex">

                <span class="read_label">
                    Codice:
                </span>
                <span v-if="product.code" class="inline_field">
                    {{ product.code }}
                </span>
                <TextPlaceholder v-else-if="store.api_statuses.product === 'loading'" mode="block" />
                <div v-else> - </div>
            </div>
            <div class="_read_flex">
                <span class="read_label">
                    Prezzo:
                </span>
                <span v-if="product.price" class="inline_field">
                    {{ product.price }}
                </span>
                <TextPlaceholder v-else-if="store.api_statuses.product === 'loading'" mode="block" />
            </div>
        </div>

        <!-- Quantity and Creator -->
        <div class="read_row_container">

            <div class="_read_flex">
                <span class="read_label">
                    Creatore:
                </span>
                <span v-if="product.creator" class="inline_field">
                    {{ product.creator }}
                </span>
                <TextPlaceholder v-else-if="store.api_statuses.product === 'loading'" mode="block" />
            </div>

            <div class="_read_flex">
                <span class="read_label">
                    Quantit&aacute;:
                </span>
                <span v-if="product.quantity" class="inline_field">{{ product.quantity }} </span>
                <TextPlaceholder mode="block" v-else-if="store.api_statuses.product === 'loading'" />
                <span v-else class="">-</span>
            </div>
        </div>

        <!-- Description -->
        <div>
            <div class="description_container">
                <span class="read_label">Descrizione</span>
                <p v-if="product.description_ita">{{ product.description_ita }}</p>
                <TextPlaceholder v-else-if="store.api_statuses.product === 'loading'" mode="group" :n="3" />
            </div>

            <div class="description_container">
                <EngTextWrapper class="read_label">Descrizione </EngTextWrapper>
                <p v-if="product.description_eng">{{ product.description_eng }}</p>
                <TextPlaceholder v-else-if="store.api_statuses.product === 'loading'" mode="group" :n="3" />
            </div>
        </div>

        <div style="margin-top:1rem">
            <!-- Immagini -->
            <div>
                <div>
                    <h2 class="form_label">Immagini Caricate</h2>
                </div>

                <hr />

                <div class="read_row_container">
                    <div class="linked_image_preview" v-if="product.images_url && product.images_url.length > 0">
                        <div v-for="(image, ind) in product.images_url" :key="ind">
                            <img :src="image" alt="Immagine Prodotto" class="img_thumbnail" loading="lazy"
                                @click="emit('openModal', image, product.images_url)" />

                        </div>
                    </div>
                    <div class="common_spinner_container" v-else-if="store.api_statuses.product === 'loading'">
                        <CommonSpinner :mode="'dots'" />
                    </div>
                    <div v-else style="text-align: center;width: 100%">
                        <ResultsPlaceholder :btn="false" />
                    </div>
                </div>
            </div>

            <!-- Categorie -->
            <AssociationViewer v-model="categories as Category[]" v-if="categories.length > 0"
                class="edit_view_categories" :mode="props.mode" :stat="store.api_statuses.product" :entity="'Categorie'"
                @update:categories="removeElement" />
        </div>
    </div>

    <!-- EDIT/NEW Mode-->
    <div class="product_form_container" v-else>

        <!-- Draft and highlited-->
        <div>
            <label class="form_label">Status:</label>
            <div class="first_check_row">

                <InputCheckbox label="Evidenzia" v-model="product.in_evidence" name="in_evidence" class="form_checks" />
                <InputCheckbox label="Bozza" v-model="product.draft" name="draft" class="form_checks" />
            </div>
        </div>

        <!-- Label-->
        <div>
            <InputText label="Nome" name="label_ita" :class="validationErrors.label_ita ? 'error' : ''"
                class="form_partial_container" v-model="product.label_ita" :translate="false" />
            <span v-if="validationErrors.label_ita" class="error_message">{{ validationErrors.label_ita }}</span>
        </div>
        <div>
            <InputText label="Label" name="label_eng" :ogText="product.label_ita"
                :class="validationErrors.label_eng ? 'error' : ''" class="form_partial_container"
                v-model="product.label_eng" :translate="true" />
            <span v-if="validationErrors.label_eng" class="error_message">{{ validationErrors.label_eng }}</span>
        </div>

        <!-- Code and Year-->
        <div class="form_section_container">
            <InputText label="Codice" v-model="product.code" name="code" :translate="false" />
            <InputNumber label="Anno" v-model="product.year" name="year" />
        </div>

        <!-- Price and Quantity-->
        <div class="form_section_container">
            <div class="input_container">
                <InputText label="Prezzo" v-model="product.price" name="price" class="form_partial_container"
                    :translate="false" />
            </div>
            <div class="input_container">
                <InputNumber label="Quantit&aacute;" :class="validationErrors.quantity ? 'error' : ''"
                    class="form_partial_container" v-model="product.quantity" name="quantity" />
                <span v-if="validationErrors.quantity" class="error_message">{{ validationErrors.quantity }}</span>
            </div>
        </div>

        <!-- Condition -->
        <div class="form_section_container">
            <div class="condition_container input_container">
                <div v-if="load_relations">
                    <InputSelect label="Condizione" name="condition_id"
                        :class="validationErrors.condition_id ? 'error' : ''" class="form_partial_container"
                        v-model="product.condition_id" :float="false" :options="conditions" :multitype="false"
                        placeholder="Seleziona una condizione" />
                    <span v-if="validationErrors.condition_id" class="error_message">{{
                        validationErrors.condition_id }}</span>
                </div>
                <CommonSpinner :mode="'dots'" v-else />
            </div>
        </div>
        <!-- Description-->
        <div>
            <LongText label="Descrizione" name="description_ita"
                :class="validationErrors.description_ita ? 'error' : ''" class="form_partial_container"
                v-model="product.description_ita" :translate="false" />
            <span v-if="validationErrors.description_ita" class="error_message">{{ validationErrors.description_ita
                }}</span>
        </div>
        <div>
            <LongText label="Descrizione" :ogText="product.description_ita" name="description_eng"
                :class="validationErrors.description_eng ? 'error' : ''" class="form_partial_container"
                v-model="product.description_eng" :translate="true" />
            <span v-if="validationErrors.description_eng" class="error_message">{{ validationErrors.description_eng
                }}</span>
        </div>


        <InputFile label="Immagini" name="images" :url="product.images_url" :modelValue="null"
            @update:images="onFileChange" />

        <div :class="{ 'disabled_container': store.api_statuses.product === 'loading' }" class="link_categories">
            <div>
                <div class="cat_cont">
                    <h5>Associazione Categoria contenitore</h5>
                    <InputCheckbox v-model="cat_association" name="cat_association" />
                </div>
            </div>

            <!-- Category Association -->
            <div v-if="cat_association">
                <InputSelect :name="'categoria'" label="Tipo categoria" :placeholder="'Seleziona un tipo categoria'"
                    v-model="associationType" :options="options" :float="false" />

                <MultiRelationTable v-if="associationType != null" v-model="categories" query="category"
                    :entity="'Categories'" :read="true" :filter="associationType" :title="false" />
            </div>
        </div>

        <!-- View Linked Categories -->
        <div v-if="categories.length > 0" class="edit_view_categories"
            :class="{ 'disabled_container': store.api_statuses.product === 'loading' }">
            <AssociationViewer v-model="(categories as Category[])" :mode="props.mode" :entity="'Categorie'"
                @update:categories="removeElement" />
        </div>
    </div>

</template>

<style lang="scss" scoped>
.common_spinner_container {
    margin: 0 auto;
}

// Read
.read {
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

    ._read_block {
        text-align: center;
    }

    ._read_flex {
        @include flexmin(center, center, row, null, .5rem);

        @media screen and (min-width: 400px) and (max-width: 600px) {
            flex-direction: column;
        }
    }

    .read_row_container {
        @extend %fx_between_center;


        @media screen and (min-width: 400px) {
            flex-direction: row;
            padding: .5rem;
        }
    }

    .read_row_container,
    .read_label {
        margin: .25rem 0;
        text-align: center;
    }

    .read_label {
        font-weight: bold;
        color: var(--secondary-color);
        font-size: 1.2rem;
    }
}

// Edit and New
.product_form_container {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .form_section_container {
        @include flexmin(space-between, stretch, null, wrap, .5rem);

        width: 100%;

        @media screen and (min-width: 480px) {
            width: unset;
        }

        .input_container {
            width: 100%;

            @media screen and (min-width: 480px) {
                width: unset;
            }
        }

        @media screen and (min-width: 480px) {
            flex-wrap: nowrap;

        }

        ;
    }

    .form_checks {
        align-self: end;
        padding-right: .5rem;
        padding-bottom: 0;
        font-weight: bold;
        color: var(--secondary-color);
    }

    .first_check_row {
        @extend %fx_around_center;
        flex-wrap: wrap;
        gap: .75rem;
        background-color: #f2f2f2;
        padding: 1.5rem 0.25rem;
        margin: 1rem auto 0;

        &:deep(.form_switch) {
            margin: 0;
            padding: 0;
        }
    }

    .disabled_container {
        pointer-events: none;
        filter: brightness(.8);
    }

    .condition_container {
        justify-content: center;
        margin-bottom: .35rem;
    }

    .first_check_row,
    .link_categories {
        border: .1px solid #808080;
        border-radius: 6px;
    }

    .link_categories {
        background-color: #f7f7f7;
        margin: 1.5rem 0;
        padding: .5rem;
    }
}
</style>