<script setup lang="ts">
import { ref } from 'vue';

import InputCheckbox from '@/components/form_fields/partials/InputCheckbox.vue';
import CommonSpinner from '@/components/utils_components/placeholders/CommonSpinner.vue';
import ResultsPlaceholder from '@/components/utils_components/placeholders/ResultsPlaceholder.vue';

import { boStore } from '@/stores/boStore';
import type { Product } from '@/types/entity/Product';
import type { Category } from '@/types/entity/Category';


const store = boStore();

interface Props {
    modelValue: Product[] | Category[] | Label[];
    mode: string;
    entity: string;
}

interface Label {
    id: number;
    label_ita: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{ (e: 'update:categories', id: number): void }>();

function removeElement(id: number): void {
    emit('update:categories', id);
}

const cat_association = ref<boolean>(false);
</script>


<template>
    <div class="association_viewer_container">

        <div class="cat_cont">
            <h5>{{ entity === 'Prodotti' ? 'Prodotti associati' : 'Categorie associate' }}</h5>
            <InputCheckbox v-model="cat_association" name="cat_association" :lblEnable="false" />
        </div>

        <div>

            <hr v-if="cat_association" />

            <ul v-if="cat_association && modelValue.length > 0">
                <li v-for="(label, index) in modelValue" :key="index">
                    <span class="association_title"> {{ label.label_ita }}</span>
                    <div class="rm_element" v-if="props.mode !== 'read'">
                        <img src="@/assets/icons/buttons/x-lg.svg" alt="remove"
                            @click="label.id !== undefined && removeElement(label.id)" loading="lazy" />
                    </div>
                </li>
            </ul>

            <CommonSpinner :mode="'spinner'" v-else-if="modelValue.length === 0 && store.apiStatus === 'loading'" />

            <ResultsPlaceholder v-else-if="modelValue.length === 0" :btn="false" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.association_viewer_container {
    margin: 1.25rem auto;
    cursor: default;

    hr {
        margin: 0.4rem 0
    }

    ul {
        @include flexmin(center, center, null, wrap, .25rem .5rem);
        margin: 1rem auto;
        padding: 0;

        li {
            @extend %fx_between_center;
            margin: .5rem 0;
            color: var(--secondary-color);
            border: .8px solid var(--secondary-color);
            border-radius: 6px;
            background-color: #ececec;


            &:hover {
                filter: brightness(0.95);
            }

            .association_title {
                padding: .5rem;
                min-width: 50px;
                text-align: center;
            }

            .rm_element {
                height: 100% !important;
                margin: 0;
                padding: 0.5rem .25rem;
                border-left: 1.5px solid var(--secondary-color);
                border-radius: 5px;
                border-top-left-radius: 0;
                border-bottom-left-radius: 0;
                transition: all linear 0.2s;
                background-color: var(--secondary-color);

                &:hover {
                    background: var(--danger_color);
                    scale: 1.05;
                    overflow: hidden;
                }

                img {
                    cursor: pointer;
                    margin: 0 .35rem;
                    width: 20px;
                    filter: invert(1);
                }
            }
        }
    }
}
</style>
