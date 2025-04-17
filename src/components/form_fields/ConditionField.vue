<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { boStore } from "@/stores/boStore";
import InputText from "./partials/InputText.vue";
import TextPlaceholder from "@/components/utils_components/placeholders/TextPlaceholder.vue";
import EngTextWrapper from "@/components/utils_components/EngTextWrapper.vue";
import type { Condition } from '@/types/entity/Condition';

interface Props {
  mode: string;
  id: string;
}

const props = defineProps<Props>();

const store = boStore();

const condition = ref<Condition>({
  label_ita: '',
  label_eng: '',
});

const emit = defineEmits<{ (e: 'validate', isValid: boolean): void }>();
const validationErrors = ref<Record<string, string>>({});

async function getCondition(): Promise<void> {
  await store.apiDispatcher('/condition/get/' + props.id, 'GET', 'condition')
    .then((response) => {
      if (props.mode !== 'new') {
        condition.value = response.data;
      }
    });
}

watch(() => props.mode, (newVal: string) => {
  if (newVal === 'new') {
    condition.value = {
      label_ita: '',
      label_eng: '',
    };
  }
  if (newVal === 'edit') {
    getCondition();
  }
});

watch(condition, (newVal: Condition) => {
  store.setSelectedItem(newVal);
  if (props.mode === 'edit' || props.mode === 'new') {
    const { isValid, validationErrors: errors } = store.validateFields(newVal);
    validationErrors.value = errors;
    emit('validate', isValid);
  }
}, { deep: true });

onMounted(() => {
  if (props.mode === 'edit' || props.mode === 'read') {
    getCondition();
  } else {
    store.setSelectedItem(condition.value);
  }
});
</script>


<template>

  <!-- READ Condition -->
  <div v-if="props.mode === 'read'" class="condition_field_read">
    <div>
      <p class="form_label">Nome</p>
      <p class="value" v-if="condition.label_ita"> {{ condition.label_ita }} </p>
      <TextPlaceholder v-else-if="store.api_statuses.condition === 'loading'" mode="block" />
      <p v-else>-</p>
    </div>
    <div>
      <EngTextWrapper class="form_label ">Nome </EngTextWrapper>
      <p class="value" v-if="condition.label_eng">{{ condition.label_eng }} </p>
      <TextPlaceholder v-else-if="store.api_statuses.condition === 'loading'" mode="block" />
      <p v-else>-</p>
    </div>

  </div>

  <!-- EDIT/CREATE Condition -->
  <div class="condition_field_container" v-else>
    <div>
      <InputText :class="validationErrors.label_ita ? 'error' : ''" label="Nome" name="label_ita"
        v-model="condition.label_ita" :translate="false" class="form_partial_container" />
      <span v-if="validationErrors.label_ita" class="error_message">{{ validationErrors.label_ita }}</span>
    </div>
    <div>
      <InputText label="Nome" name="label_eng" v-model="condition.label_eng" :ogText="condition.label_ita"
        :translate="true" :class="validationErrors.label_eng ? 'error' : ''" class="form_partial_container" />
      <span v-if="validationErrors.label_eng" class="error_message">{{ validationErrors.label_eng }}</span>
    </div>
  </div>

</template>


<style lang="scss" scoped>
.condition_field_read {
  @extend %fx_around_center;

  div {
    width: 100%;
    margin-bottom: 1rem;
    text-align: center;

    @media screen and (min-width: 768px) {
      // text-align: center;
    }
  }

  .value {
    @extend %capitalize_start;
  }
}

.condition_field_read,
.condition_field_container {
  margin: auto;
  margin-bottom: 0.5rem;
  width: 95%;

  @media screen and (min-width: 768px) {
    width: 85%;
  }

  @media screen and (min-width: 1200px) {
    width: 70%;
  }
}
</style>
