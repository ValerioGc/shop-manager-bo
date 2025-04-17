<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { boStore } from "@/stores/boStore";
import EngTextWrapper from "@/components/utils_components/EngTextWrapper.vue";

interface Props {
    modelValue: string;
    label: string;
    name: string;
    translate?: boolean;
    ogText?: string;
}

const props = withDefaults(defineProps<Props>(), {
    ogText: '',
    translate: false
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const store = boStore();

const inputValue = ref<string>(props.modelValue);

watch(inputValue, (newValue) => {
    emit('update:modelValue', newValue);
});

watch(() => props.modelValue, (newValue) => {
    if (newValue !== inputValue.value) {
        inputValue.value = newValue;
    }
});

const inputStatus = ref<'idle' | 'loading'>('idle');

// Computed property to handle the button's and input's disabled state
const isDisabled = computed(() => inputStatus.value === 'loading');

const isButtonDisabled = computed(() => {
    return !props.ogText || isDisabled.value || inputValue.value.length > 0;
});

// Title based on the input and ogText values
const buttonTitle = computed(() => {
    if (inputValue.value.length > 0) {
        return 'Svuotare il campo per tradurre dal campo in italiano';
    } else if (!props.ogText) {
        return 'Inserisci del testo nel campo in italiano per tradurre';
    } else {
        return 'Traduci il testo in inglese';
    }
});

async function handleTranslation(): Promise<void> {
    if (!props.translate) {
        console.log('Translation not enabled');
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

        <div class="input_group">
            <input type="text" :id="name + label" :name="label + (props.translate ? '_eng' : '')" v-model="inputValue"
                :disabled="isDisabled" class="form_control" :placeholder="'Inserisci ' + label" />

            <!--  Translate button  -->
            <button v-if="translate" class="input_group_text translate_button" type="button"
                :disabled="isButtonDisabled" @click="handleTranslation" :title="buttonTitle"
                :style="{ cursor: isButtonDisabled ? 'not-allowed' : 'pointer' }">
                <img class="translate_image" src="@/assets/icons/buttons/translate.svg" alt="translate button"
                    loading="lazy" />
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.form_control:disabled {
    background-color: #e9ecef;
    opacity: .5;
    cursor: not-allowed;
}

.translate_button {
    background-color: #f7f7f7;
}

.input_group_text.translate_button:disabled {
    cursor: not-allowed;
    opacity: .5;
}
</style>
