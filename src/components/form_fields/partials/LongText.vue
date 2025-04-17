<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { boStore } from "@/stores/boStore";
import EngTextWrapper from "@/components/utils_components/EngTextWrapper.vue";

interface Props {
    modelValue: string | undefined;
    label: string;
    name: string;
    translate: boolean;
    ogText?: string;
}

const props = withDefaults(defineProps<Props>(), {
    ogText: ''
});

const store = boStore();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'translateText'): void;
}>();

const inputValue = ref<string>(props.modelValue ?? '');

watch(inputValue, (newValue) => {
    emit('update:modelValue', newValue);
}, { immediate: true });

watch(() => props.modelValue, (newValue) => {
    if (newValue !== inputValue.value) {
        inputValue.value = newValue ?? '';
    }
});

const inputStatus = ref<'idle' | 'loading'>('idle');

// Computed property to handle the button's and textarea's disabled state
const isDisabled = computed(() => {
    return inputStatus.value === 'loading';
});

const isButtonDisabled = computed(() => {
    return !props.ogText || isDisabled.value || inputValue.value.length > 0;
});

// Computed property for the title attribute
const buttonTitle = computed(() => {
    if (inputValue.value && inputValue.value.length > 0) {
        return 'Svuotare il campo per tradurre dal campo in italiano';
    } else if (!props.ogText || props.ogText.length === 0) {
        return 'Inserisci del testo nel campo in italiano per tradurre';
    } else {
        return 'Traduci il testo in inglese';
    }
});

async function handleTranslation(): Promise<void> {
    if (!props.translate) {
        console.info('Translation not enabled');
        return;
    }

    inputStatus.value = 'loading';

    try {
        const response = await store.translateText(props.ogText);
        inputValue.value = response;
    } catch (error) {
        console.error('Error during translation:', error);
        inputValue.value = 'Translation failed';
    } finally {
        inputStatus.value = 'idle';
        await nextTick();
    }
}
</script>

<template>
    <div :class="{ 'translated': props.translate }" class="input_container">
        <div class="translated_label_container">
            <EngTextWrapper v-if="props.translate" class="form_label">{{ label }}</EngTextWrapper>
            <label v-else :for="name" class="form_label">{{ label }}</label>
        </div>

        <div :class="{ 'input_group': props.translate }">

            <textarea :id="name" :name="label + (props.translate ? 'eng' : '')" type="text" v-model="inputValue"
                class="form_control" rows="3" :disabled="isDisabled"
                :placeholder="'Inserisci descrizione ' + label"></textarea>

            <button class="input_group_text translate_button" v-if="translate" :disabled="isButtonDisabled"
                :title="buttonTitle" type="button" :style="{ cursor: isButtonDisabled ? 'not-allowed' : 'pointer' }"
                @click.prevent="handleTranslation">
                <img class="translate_image" src="@/assets/icons/buttons/translate.svg" loading="lazy"
                    alt="translate button" />
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.flag_image {
    height: 1.1rem;
    margin: 0 .5rem;
}

.translate_button {
    background-color: #f7f7f7;

    .translate_image {
        height: 1.5rem;
        width: 1.5rem;
        margin: .25rem;

        @media screen and (min-width: 768px) {
            height: 1.5rem;
            width: 2.5rem;
        }
    }
}

textarea {
    width: 100%;
}

.input_group_text.translate_button:disabled {
    cursor: not-allowed;
    opacity: .5;
}

.form_control:disabled {
    cursor: not-allowed;
    background-color: #e9ecef;
    opacity: 0.5;
}
</style>
