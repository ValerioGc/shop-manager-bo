<script setup lang="ts">
import { ref, watch, onMounted,defineAsyncComponent } from 'vue';
import { boStore } from "@/stores/boStore";
import InputText from "./partials/InputText.vue";
import InputImage from "./partials/InputImage.vue";
// import InputFile from "./partials/InputFile.vue";
const InputFile = defineAsyncComponent(() => import('./partials/InputFile.vue'));

import InputDate from "./partials/InputDate.vue";
import LongText from "./partials/LongText.vue";
import TextPlaceholder from '@/components/utils_components/placeholders/TextPlaceholder.vue';
import ResultsPlaceholder from '@/components/utils_components/placeholders/ResultsPlaceholder.vue';
import CommonSpinner from '@/components/utils_components/placeholders/CommonSpinner.vue';
import EngTextWrapper from '@/components/utils_components/EngTextWrapper.vue';
import type { Show } from '@/types/entity/Show';
import type MultiFileChange from '@/types/entity/MultiFileChange';

interface Props {
    mode: string;
    id: string;
}

const props = defineProps<Props>();

const store = boStore();


const show = ref<Show>({
    label_ita: '',
    label_eng: '',
    description_ita: '',
    description_eng: '',
    start_date: '',
    end_date: '',
    location: '',
    link: '',
    image: null,
    image_url: '',
    removed_image: false,
    images: {
        existing: [],
        new: [],
        removed: [],
        images_order: []
    },
    images_url: []
});

/**
 * Get show data from API
 */
async function getShow(): Promise<void> {
    await store.apiDispatcher('/show/get/' + props.id, 'GET', 'show')
        .then((response) => {
            const showData = response.data;
            show.value = {
                ...showData,
                image: null,
                removed_image: false,
                images: {
                    existing: showData.images_url.map((url: string, index: number) => ({
                        url,
                        file: null,
                        id: index
                    })),
                    new: [],
                    removed: [],
                    images_order: showData.images_url.map((url: string, index: number) => ({
                        url,
                        filename: null,
                        order: index
                    }))
                },
                images_url: showData.images_url
            };
        });
}

watch(() => show.value.start_date, (newVal) => {
    if (newVal === null || newVal === '') {
        show.value.end_date = null;
    }
});

// ********** Image Management **********
const onFileChange = (file: File | null): void => {
    if (file) {
        show.value.image = file;
        show.value.image_url = URL.createObjectURL(file);
    } else {
        show.value.removed_image = true;
        show.value.image = null;
        show.value.image_url = '';
    }
};


const onFileChangeMulti = ({ existing, new: newFiles, removed, images_order }: MultiFileChange): void => {
    show.value.images.new = newFiles;
    show.value.images.existing = existing.map(img => ({
        ...img,
        file: img.file || null,
        url: img.url
    }));
    show.value.images.removed = removed;
    show.value.images.images_order = images_order;
    console.log("Updated images:", show.value.images);
};

// ********** VALIDATION **********
const validationErrors = ref<Record<string, string>>({});
const emit = defineEmits<{
    (e: 'validate', isValid: boolean): void;
    (e: 'openModal', image: string, images: string[]): void;
}>();

const isFutureDate = (date: string): boolean => {
    return new Date(date) > new Date();
};

watch(show, () => {
    store.setSelectedItem(show.value);
    if (props.mode === 'edit' || props.mode === 'new') {
        const fieldsToValidate = ['label_ita', 'label_eng', 'start_date', 'location'];
        if (show.value.end_date) {
            fieldsToValidate.push('end_date');
        }
        const { isValid, validationErrors: errors } = store.validateFields(show.value, fieldsToValidate);
        validationErrors.value = errors;

        if (show.value.end_date && show.value.start_date && new Date(show.value.end_date) < new Date(show.value.start_date)) {
            validationErrors.value.end_date = 'La data di fine non può essere precedente alla data di inizio';
            emit('validate', false);
        } else {
            emit('validate', isValid);
        }
    }
}, { deep: true });

watch(() => props.mode, () => {
    if (props.mode === 'edit' || props.mode === 'new') {
        const fieldsToValidate = ['label_ita', 'label_eng', 'start_date', 'location'];
        if (show.value.end_date) {
            fieldsToValidate.push('end_date');
        }
        const { isValid, validationErrors: errors } = store.validateFields(show.value, fieldsToValidate);
        validationErrors.value = errors;
        if (show.value.end_date && show.value.start_date && new Date(show.value.end_date) < new Date(show.value.start_date)) {
            validationErrors.value.end_date = 'La data di fine non può essere precedente alla data di inizio';
            emit('validate', false);
        } else {
            emit('validate', isValid);
        }
    }
});

onMounted(() => {
    if (props.mode === 'edit' || props.mode === 'read') {
        getShow();
    } else {
        show.value = {
            label_ita: '',
            label_eng: '',
            description_ita: '',
            description_eng: '',
            start_date: '',
            end_date: '',
            location: '',
            link: '',
            image: null,
            image_url: '',
            removed_image: false,
            images: {
                existing: [],
                new: [],
                removed: [],
                images_order: []
            },
            images_url: []
        };
    }
});
</script>

<template>
    <!-- Read mode -->
    <div v-if="props.mode === 'read'" class="read">
        <!-- Show cover image -->
        <div class="cover_image_container">
            <p class="read_label">Copertina fiera</p>
            <div class="cover_image">
                <img v-if="show.image_url" :src="show.image_url" alt="Show image" />
                <CommonSpinner v-else-if="store.api_statuses.show === 'loading'" :mode="'spinner'" />
                <ResultsPlaceholder v-else :btn="false" />
            </div>
        </div>

        <div class="text_section_container">
            <!-- Names -->
            <div class="read_row_group_container">
                <div class="read_row_container">
                    <p class="read_label">Nome</p>
                    <TextPlaceholder v-if="store.api_statuses.show === 'loading'" mode="block" />
                    <span v-else-if="show.label_ita">{{ show.label_ita }}</span>
                </div>
                <div class="read_row_container">
                    <EngTextWrapper class="read_label">Nome </EngTextWrapper>
                    <TextPlaceholder v-if="store.api_statuses.show === 'loading'" mode="block" />
                    <span v-else-if="show.label_eng">{{ show.label_eng }}</span>
                </div>
            </div>

            <!-- Location -->
            <div class="align_inline">
                <span class="read_label">Luogo:</span>
                <span v-if="show.location" class="inline_field">{{ show.location }} </span>
                <TextPlaceholder v-else-if="store.api_statuses.show === 'loading'" mode="xs" alig="0" />
                <span v-else> -</span>
            </div>

            <!-- Dates -->
            <div class="read_row_group_container">
                <div class="align_inline">
                    <span class="read_label sub_date">Data Inizio: </span>
                    <span v-if="show.start_date"> {{ show.start_date }} </span>
                    <TextPlaceholder v-else-if="store.api_statuses.show === 'loading'" mode="block" />
                </div>

                <div class="align_inline">
                    <span class="read_label sub_date">Data Fine: </span>
                    <span v-if="show.end_date"> {{ show.end_date }} </span>
                    <TextPlaceholder v-else-if="store.api_statuses.show === 'loading'" mode="block" />
                    <span v-else> -</span>
                </div>
            </div>

            <!-- Link -->
            <div v-if="store.api_statuses.show === 'loading' || show.link">
                <span class="read_label sub_date">Link:</span>
                <p v-if="show.link">{{ show.link }} </p>
                <TextPlaceholder v-else-if="store.api_statuses.show === 'loading'" mode="lg" />
            </div>
        </div>

        <!-- Description -->
        <div class="description_container"
            v-if="show.description_ita && show.description_eng || store.api_statuses.show === 'loading'">
            <div>
                <div class="read_row_container">
                    <p class="read_label text_center">Descrizione</p>
                    <hr />
                    <TextPlaceholder v-if="store.api_statuses.show === 'loading'" mode="group" :n="2" />
                    <p v-else-if="show.description_ita">{{ show.description_ita }}</p>
                    <p v-else> -</p>
                </div>
                <div class="read_row_container">
                    <EngTextWrapper class="read_label text_center">Descrizione</EngTextWrapper>
                    <hr />
                    <TextPlaceholder v-if="store.api_statuses.show === 'loading'" mode="group" :n="2" />
                    <p v-else-if="show.description_eng">{{ show.description_eng }}</p>
                    <p v-else> -</p>
                </div>
            </div>
        </div>

        <!-- Images -->
        <div class="images_section">
            <h2 class="form_label ">Immagini Caricate</h2>
            <hr />
            <div class="linked_image_preview"
                v-if="show.images_url.length > 0 && show.start_date && !isFutureDate(show.start_date)">
                <div v-for="(image, ind) in show.images_url" :key="ind">
                    <img :src="image" alt="Immagine Fiera" class="img_thumbnail"
                        @click="emit('openModal', image, show.images_url)" loading="lazy" />
                </div>
            </div>
            <CommonSpinner v-else-if="store.api_statuses.show === 'loading'" :mode="'dots'" />
            <ResultsPlaceholder v-else :btn="false" />
        </div>
    </div>

    <!-- Edit mode -->
    <div v-else>
        <div>
            <InputImage label="Immagine copertina" name="image_cover" v-model="show.image" :remove="true"
                :url="show.image_url" @update:modelValue="onFileChange" />
        </div>

        <div>
            <InputText label="Nome" name="label_ita" v-model="show.label_ita"
                :class="validationErrors.label_ita ? 'error' : ''" class="form_partial_container" />
            <span v-if="validationErrors.label_ita" class="error_message">{{ validationErrors.label_ita }}</span>
        </div>

        <div>
            <InputText label="Nome" :ogText="show.label_ita" name="label_eng" v-model="show.label_eng"
                :class="validationErrors.label_eng ? 'error' : ''" class="form_partial_container" :translate="true" />
            <span v-if="validationErrors.label_eng" class="error_message">{{ validationErrors.label_eng }}</span>
        </div>

        <div>
            <InputText label="Luogo" name="location" v-model="show.location" class="form_partial_container"
                :class="validationErrors.location ? 'error' : ''" />
            <span v-if="validationErrors.location" class="error_message">{{ validationErrors.location }}</span>
        </div>

        <div class="form_date form_partial_container">
            <div>
                <InputDate label="Data Inizio" name="start_date" v-model="show.start_date"
                    :class="validationErrors.start_date ? 'error' : ''" />
                <span v-if="validationErrors.start_date" class="error_message">{{ validationErrors.start_date }}</span>
            </div>
            <div>
                <InputDate label="Data Fine" name="end_date" v-model="show.end_date"
                    :start="show.start_date ? 'ok' : null" :class="validationErrors.end_date ? 'error' : ''" />
                <span v-if="validationErrors.end_date" class="error_message">{{ validationErrors.end_date }}</span>
            </div>
        </div>

        <InputText label="Link" name="link" v-model="show.link" :translate="false" class="form_partial_container" />

        <div v-if="show.start_date && !isFutureDate(show.start_date)" class="form_partial_container">
            <LongText label="Descrizione" name="description_ita" v-model="show.description_ita" :translate="false" />
        </div>

        <div v-if="show.start_date && !isFutureDate(show.start_date)" class="form_partial_container">
            <LongText label="Descrizione" :ogText="show.description_ita" name="description_eng"
                v-model="show.description_eng" :translate="true" />
        </div>

        <InputFile label="Immagini multiple" name="images" v-if="show.start_date && !isFutureDate(show.start_date)"
            v-model="show.image" :url="show.images_url" @update:images="onFileChangeMulti"
            class="form_partial_container" />
    </div>
</template>

<style lang="scss" scoped>
.read {
    padding: 1.35rem;

    .align_inline {
        @extend %fx_center;
        gap: .25rem;
        margin-bottom: 1rem;

        @media screen and (min-width: 580px) {
            justify-content: start;
        }
    }

    .read_label {
        margin: .25rem 0;
        font-weight: bold;
        margin-bottom: .25rem;
        color: var(--secondary-color);
        font-size: 1.2rem;
    }

    .cover_image_container {
        margin-bottom: .35rem;
        text-align: center;

        p {
            padding: 1rem;
        }

        .cover_image {
            border: .4px solid #808080;
            align-content: center;
            height: 200px;
            width: 200px;
            margin: 1rem auto;
            border-radius: 6px;
            background-color: #d3d3d3;

            img {
                border-radius: 6px;
                object-fit: cover;
                height: 100%;
                width: 100%;
            }
        }
    }

    .description_container,
    .text_section_container {
        margin: auto;
        width: 90%;
        text-align: center;

        @media screen and (min-width: 580px) {
            text-align: left;
        }

        @media screen and (min-width: 768px) {
            width: 80%;
        }

        @media screen and (min-width: 900px) {
            width: 75%;
        }
    }

    .text_section_container {

        .read_row_group_container {
            flex-direction: column;
            justify-content: flex-start;
            display: flex;
            margin-bottom: 0.5rem;

            @media screen and (min-width: 580px) {
                flex-direction: row !important;
                justify-content: space-between;
            }

            &:first-child {
                margin-bottom: .5rem;
            }
        }
    }

    .images_section {
        margin: 1rem 0;

        h2 {
            text-align: center;
        }
    }

    .sub_date {
        display: block;
        margin-top: 0;
        margin-bottom: 0.5rem;

        @media screen and (min-width: 580px) {
            display: inline;
            margin-bottom: 0;
        }
    }
}

.form_date {
    @extend %fx_center;
    flex-direction: column;

    @media screen and (min-width: 420px) {
        flex-direction: row;
        justify-content: space-between;
        align-items: baseline;
    }
}
</style>