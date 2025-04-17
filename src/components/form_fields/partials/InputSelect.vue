<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { boStore } from "@/stores/boStore";
import chevron_down from '@/assets/icons/arrows/chevron-down.svg';
import chevron_up from '@/assets/icons/arrows/chevron-up.svg';
import type { DOption } from '@/types/entity/DOption';


interface Props {
    modelValue: string | number | null;
    label: string;
    name: string;
    float: boolean;
    options: DOption[];
    placeholder: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{ (e: 'update:modelValue', value: string | number): void }>();

const store = boStore();

const isds = ref<boolean>(true);
const isOpen = ref<boolean>(false);
const inputValue = ref<string | number>(props.modelValue !== null ? props.modelValue : '');

watch(inputValue, (newValue) => {
    emit('update:modelValue', newValue);
});

watch(() => props.modelValue, (newValue) => {
    if (newValue != null && newValue !== '') {
        isds.value = false;
    } else {
        isds.value = true;
    }
    if (newValue !== inputValue.value) {
        inputValue.value = newValue || '';
    }
}, { immediate: true });

const optionsWithPlaceholder = computed(() => {
    if (!props.modelValue) {
        return [...props.options];
    }
    return props.options;
});

const selectedOptionLabel = computed(() => {
    const selectedOption = props.options.find(option => option.value === inputValue.value);
    return selectedOption ? selectedOption.label : '';
});

function handleSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target.value === '') {
        inputValue.value = '';
    }
}

function capitalizeLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function toggleChevron(open: boolean): void {
    isOpen.value = open;
}
</script>


<template>
    <div :class="{ 'form_floating': props.float }" class="input_container">

        <label :for="props.name" class="label_title">{{ props.label }}</label>

        <div class="select_container">
            <img :src="!isOpen ? chevron_down : chevron_up" alt="chevron-down" class="chevron" />

            <select class="form_select" :name="props.name" v-model="inputValue"
                :disabled="store.apiStatus === 'loading' || store.api_statuses.condition === 'loading'"
                aria-label="Default select example" @change="handleSelectChange" @focus="toggleChevron(true)"
                @blur="toggleChevron(false)" :title="!isOpen ? selectedOptionLabel : ''">
                <option v-if="props.placeholder" selected value="" :disabled="isds">
                    {{ capitalizeLetter(props.placeholder) || '-' }}
                </option>

                <option v-for="(option, index) in optionsWithPlaceholder" :key="index" :value="option.value"
                    style="display:inline-block">
                    {{ capitalizeLetter(option.label) }}
                </option>
            </select>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.select_container {
    position: relative;

    .chevron {
        position: absolute;
        top: 50%;
        right: .5rem;
        transform: translateY(-50%);
        width: 1rem;
        height: 1rem;
        pointer-events: none;
        z-index: var(--z_2);
    }

    .form_select {
        cursor: pointer;
        text-overflow: ellipsis;
        display: block;
        width: 100%;
        padding: .5rem 2.25rem .35rem .5rem;

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
}

.form_floating {
    position: relative;

    &>label {
        position: absolute;
        top: 0;
        left: 0;
        z-index: var(--z_1);
        height: 100%;
        padding: 0.75rem .5rem 0.75rem .35rem;
        overflow: hidden;
        text-align: start;
        text-overflow: ellipsis;
        white-space: nowrap;
        pointer-events: none;
        border: var(--bs-border-width) solid transparent;
        transform-origin: 0 0;
        transition: opacity .1s ease-in-out, transform .1s ease-in-out;

        @media screen and (min-width: 350px) {
            padding: 1rem .75rem;
        }
    }

    &>.form_control,
    &>.form_select {
        height: calc(3.5rem + calc8(1px) * 2);
        min-height: calc(3.5rem + calc(1px * 2));
        line-height: 1.25;
    }

    .form_select {
        padding-top: 1.8rem;
        padding-bottom: .625rem;
        padding: 1.65rem 2.25rem .375rem .5rem;

        @media screen and (min-width: 350px) {
            padding: 1.75rem 2.25rem .375rem .75rem;
        }
    }
}
</style>
