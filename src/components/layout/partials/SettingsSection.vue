<!-- SettingsSection.vue -->
<script setup lang="ts">
import { computed } from 'vue';

import chevron_down from '@/assets/icons/arrows/chevron-down.svg';
import chevron_up from '@/assets/icons/arrows/chevron-up.svg';

interface Props {
  sectionId: string;
  title: string;
  selectedDropdown: string | null;
  isDisabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isDisabled: false
});

const emit = defineEmits<{ (e: 'update:selectedDropdown', value: string | null): void }>();

const isOpen = computed(() => props.selectedDropdown === props.sectionId);

function toggleSection(): void {
  emit('update:selectedDropdown', isOpen.value ? null : props.sectionId);
}

function selectIcon(): string {
  return isOpen.value ? chevron_up : chevron_down;
}
</script>


<template>
  <div :id="sectionId" class="drop_btn_container" :class="{ 'disabled_section': isDisabled }">
    <div class="drop_btn" @click.prevent="toggleSection">
      <h2 class="form_label">{{ title }}</h2>
      <img :src="selectIcon()" :alt="isOpen ? 'chevron down' : 'chevron up'" loading="eager" />
    </div>
    <div v-if="isOpen" class="section_body slide-alt">
      <slot></slot>
    </div>
  </div>
</template>


<style lang="scss" scoped>
.drop_btn_container {
  cursor: pointer;
  background-color: #ffffff;
  color: black;
  text-align: left;
  transition: 0.4s;
  border-radius: var(--border_radius);
  box-shadow: 0 0 9px rgba(123, 123, 123, 0.812);
  margin-bottom: 0.45rem;



  &:hover:not(.selected) {
    box-shadow: 0 0 12px #0000ffa4;

    .drop_btn {
      opacity: 0.7;
      color: var(--secondary-color);
    }
  }
}

.drop_btn {
  width: 100%;
  padding: 1rem;
  @extend %fx_between_center;

    img {
    width: 1.5rem;
    height: 1.5rem;
  }
}

.section_body {
  padding: 0.75rem !important;
}

.form_label {
  margin-bottom: 0 !important;
  font-size: 1.5rem;
}

.disabled_section {
  cursor: wait !important;
  opacity: 0.5;

  div {
    pointer-events: none;
  }
}
</style>
