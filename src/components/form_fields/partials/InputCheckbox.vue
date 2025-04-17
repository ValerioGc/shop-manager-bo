<script setup lang="ts">
import { ref, watch } from 'vue';
import { boStore } from "@/stores/boStore";

const store = boStore();

interface Props {
    modelValue: boolean;
    label?: string;
    name: string;
    lblEnable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    lblEnable: true
});

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const checkboxValue = ref<boolean>(props.modelValue);

watch(() => props.modelValue, (newValue: boolean) => {
    if (checkboxValue.value !== newValue) {
        checkboxValue.value = newValue;
    }
}, { immediate: true });

watch(checkboxValue, (newValue: boolean) => {
    emit('update:modelValue', newValue);
});
</script>

<template>
    <div class="form_switch">
        <input class="form_check_input" type="checkbox" v-model="checkboxValue" role="switch"
            :disabled="store.apiStatus === 'loading'" :id="name" :name="name">
        <label :for="name" v-if="props.lblEnable">
            {{ label }}
        </label>
    </div>
</template>