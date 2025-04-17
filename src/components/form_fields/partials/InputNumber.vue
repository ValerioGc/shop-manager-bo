<script setup lang="ts">
import { ref, watch } from 'vue';
import { boStore } from "@/stores/boStore";

interface Props {
    modelValue: number | null;
    label?: string;
    grouped?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    grouped: false
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void;
}>();

const store = boStore();

const numberValue = ref<number>(props.modelValue ?? 0);

emit('update:modelValue', numberValue.value);

watch(() => props.modelValue, (newValue) => {
    if (numberValue.value !== (newValue ?? 0)) {
        numberValue.value = newValue ?? 0;
    }
}, { immediate: true });

watch(numberValue, (newValue: number) => {
    emit('update:modelValue', newValue);
});
</script>

<template>
    <div :class="{ 'grouped': props.grouped }" class="input_container">

        <div class="label_container">
            <label class="form_label" v-if="props.label">{{ props.label }}</label>
        </div>

        <div :class="{ 'input_group': props.grouped }">
            <input type="number" class="form_control" v-model="numberValue" :placeholder="'Inserisci ' + label"
                :disabled="store.apiStatus === 'loading'"
                @input="$emit('update:modelValue', parseFloat(($event.target as HTMLInputElement).value))">
            <span class="input_group_text" v-if="props.grouped"> &euro; </span>
        </div>
    </div>
</template>


<style lang="scss" scoped>
.label_container {
    display: block;
    margin-bottom: .75rem;
}

.input_group_text {
    padding: auto 0.5rem;
}

.form_control {
    text-align: center;

}
</style>
