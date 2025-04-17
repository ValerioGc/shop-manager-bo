<script setup lang="ts">
import { ref, watch } from 'vue';
import { boStore } from '@/stores/boStore';

interface Props {
  modelValue: string | null;
  label: string;
  name: string;
  start?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  start: 'enable'
});

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const store = boStore();

const inputValue = ref<string>(props.modelValue ?? '');

watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue ?? '';
});

watch(inputValue, (newValue: string) => {
  emit('update:modelValue', newValue);
});
</script>

<template>
  <div class="input_group">
    <label class="form_label">{{ props.label }}</label>
    <input type="date" :name="props.name" v-model="inputValue" min="1990-01-01" max="2050-12-31"
      :disabled="store.apiStatus === 'loading' || props.start === null" />
  </div>
</template>

<style lang="scss" scoped>
.input_group {
  justify-content: space-around;
  align-items: center;

  label {
    margin: 0 .25rem 0 0;
  }

  input {
    border-radius: 6px !important;
    outline: 1px solid #ccc;
    appearance: none;
    cursor: pointer;
    padding: .5rem;
    letter-spacing: 1px;
    box-shadow: 0 0 6px -4px black;
  }
}
</style>
