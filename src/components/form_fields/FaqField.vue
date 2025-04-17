<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { boStore } from "@/stores/boStore";
import InputText from "./partials/InputText.vue";
import LongText from "./partials/LongText.vue";
import TextPlaceholder from "@/components/utils_components/placeholders/TextPlaceholder.vue";
import EngTextWrapper from "@/components/utils_components/EngTextWrapper.vue";
import type { Faq } from '@/types/entity/Faq';

interface Props {
    mode: string;
    id: string;
}

const props = defineProps<Props>();

const store = boStore();


const faq = ref<Faq>({
    label_ita: "",
    label_eng: "",
    answer_ita: "",
    answer_eng: ""
});

/**
 * Get the FAQ data from the API
 * @returns {Promise<void>}
 */
async function getFaqs(): Promise<void> {
    await store.apiDispatcher('/faq/get/' + props.id, 'GET', 'faq')
        .then((response) => {
            if (props.mode !== 'new')
                faq.value = response.data;
        });
}

// ********** <Validation> **********
const emit = defineEmits<{ (e: 'validate', isValid: boolean): void }>();
const validationErrors = ref<Record<string, string>>({});

const validateField = (): boolean => {
    const { isValid, validationErrors: errors } = store.validateFields(faq.value);
    validationErrors.value = errors;
    return isValid;
};

watch(faq, (newVal) => {
    store.setSelectedItem(newVal);
    if (props.mode === 'edit' || props.mode === 'new') {
        const isValid = validateField();
        emit('validate', isValid);
    }
}, { deep: true });

watch(() => props.mode, (newVal) => {
    if (newVal === 'new') {
        faq.value = {
            label_ita: '',
            label_eng: '',
            answer_ita: '',
            answer_eng: ''
        };
    }
    if (newVal === 'edit') {
        getFaqs();
    }
});

onMounted(() => {
    if (props.mode === 'edit' || props.mode === 'read')
        getFaqs();
    else if (props.mode === 'new')
        store.setSelectedItem(faq.value);
});
</script>

<template>
    <!-- READ Mode-->
    <div v-if="props.mode === 'read'">
        <div class="section_info_container">
            <p class="form_label read_label">Domanda</p>
            <TextPlaceholder v-if="store.api_statuses.faq === 'loading'" mode="lg" />
            <span class="value" v-else-if="faq.label_ita">{{ faq.label_ita }}</span>
        </div>

        <div class="section_info_container">
            <EngTextWrapper class="read_label form_label">Domanda </EngTextWrapper>
            <TextPlaceholder v-if="store.api_statuses.faq === 'loading'" mode="lg" />
            <p class="value" v-else-if="faq.label_eng">{{ faq.label_eng }}</p>
        </div>

        <div class="section_info_container">
            <p class="form_label read_label">Risposta</p>
            <TextPlaceholder v-if="store.api_statuses.faq === 'loading'" :mode="'group'" :n="4" />
            <p class="value" v-html="faq.answer_ita" v-else-if="faq.answer_eng"></p>
        </div>

        <div class="section_info_container">
            <EngTextWrapper class="read_label form_label">Risposta </EngTextWrapper>
            <TextPlaceholder v-if="store.api_statuses.faq === 'loading'" :mode="'group'" :n="4" />
            <p class="value" v-html="faq.answer_eng" v-else-if="faq.answer_eng"></p>
        </div>
    </div>

    <!-- EDIT/CREATE Mode-->
    <div v-else class="manage_faq">
        <div class="input_container">
            <InputText v-model="faq.label_ita" :class="validationErrors.label_ita ? 'error' : ''"
                class="form_partial_container " label="Domanda" name="label_ita" :translate="false" />
            <span v-if="validationErrors.label_ita" class="error_message">{{ validationErrors.label_ita }}</span>
        </div>

        <div class="input_container">
            <InputText v-model="faq.label_eng" :ogText="faq.label_ita"
                :class="validationErrors.label_eng ? 'error' : ''" class="form_partial_container " label="Domanda"
                name="label_eng" :translate="true" />
            <span v-if="validationErrors.label_eng" class="error_message">{{ validationErrors.label_eng }}</span>
        </div>

        <div class="input_container">
            <LongText v-model="faq.answer_ita" :class="validationErrors.answer_ita ? 'error' : ''"
                class="form_partial_container " label="Risposta" name="answer_ita" :translate="false" />
            <span v-if="validationErrors.answer_ita" class="error_message">{{ validationErrors.answer_ita }}</span>
        </div>

        <div class="input_container">
            <LongText v-model="faq.answer_eng" :ogText="faq.answer_ita"
                :class="validationErrors.answer_eng ? 'error' : ''" class="form_partial_container " label="Risposta"
                name="answer_eng" :translate="true" />
            <span v-if="validationErrors.answer_eng" class="error_message">{{ validationErrors.answer_eng }}</span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.section_info_container {
    margin: .5rem 0;

    .read_label {
        padding-bottom: .35rem;
        margin-bottom: .5rem;
        border-bottom: .4px solid #6e6e6e;
    }
}
</style>
