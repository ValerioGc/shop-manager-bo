<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { boStore } from "@/stores/boStore";
import InputText from "./partials/InputText.vue";
import InputImage from "./partials/InputImage.vue";

import TextPlaceholder from "@/components/utils_components/placeholders/TextPlaceholder.vue";
import CommonSpinner from "@/components/utils_components/placeholders/CommonSpinner.vue";
import EngTextWrapper from "@/components/utils_components/EngTextWrapper.vue";
import type { Contact } from '@/types/entity/Contact';

interface Props {
  mode: string;
  id: string;
}

const props = defineProps<Props>();


const store = boStore();

const contact = ref<Contact>({
  label_eng: '',
  label_ita: '',
  link_value: '',
  image: null,
  image_url: ''
});

const validationErrors = ref<Record<string, string>>({});
const emit = defineEmits<{ (e: 'validate', isValid: boolean): void }>();

/**
 * Get the contact data from the API
 * @returns {Promise<void>}
 */
async function getContact(): Promise<void> {
  await store.apiDispatcher('/contact/get/' + props.id, 'GET', 'contact')
    .then((response) => {
      if (props.mode !== 'new') {
        contact.value = response.data;
      }
    });
}

const onFileChange = (e: Event): void => {
  const target = e.target as HTMLInputElement;
  const file = target.files ? target.files[0] : null;
  if (file) {
    contact.value.image = file;
    contact.value.image_url = URL.createObjectURL(file);
  }
};

watch(contact, (newVal) => {
  store.setSelectedItem({
    ...newVal,
    image: newVal.image instanceof File ? newVal.image : undefined,
    image_url: newVal.image instanceof File ? null : newVal.image_url
  });
  if (props.mode === 'edit' || props.mode === 'new') {
    const { isValid, validationErrors: errors } = store.validateFields(newVal);
    validationErrors.value = errors;
    emit('validate', isValid);
  }
}, { deep: true });

watch(() => props.mode, (newVal) => {
  if (newVal === 'new') {
    contact.value = {
      label_ita: '',
      label_eng: '',
      link_value: '',
      image: null,
      image_url: ''
    };
  }
  if (newVal === 'edit') {
    getContact();
  }
});

onMounted(() => {
  if (props.mode === 'edit' || props.mode === 'read') {
    getContact();
  } else if (props.mode === 'new' && store.selectedItem) {
    store.setSelectedItem(contact.value);
  }
});
</script>


<template>
  <!-- ITEM DETAILS -->
  <div class="read" v-if="props.mode === 'read'">

    <div v-if="contact.image_url" class="contact_image_container image_contact">
      <img :src="contact.image_url" alt="Preview" loading="lazy" />
    </div>
    <div v-else-if="store.api_statuses.contact === 'loading'" class="contact_image_container image_contact">
      <CommonSpinner :mode="'spinner'" class="common_spinner" />
    </div>
    <div v-else class="contact_image_container">
      <img src="@/assets/icons/user/plUsr.svg" alt="Placeholder" loading="lazy" />
    </div>

    <ul class="read_element">
      <li class="section-info-container">
        <p class="form_label">Nome</p>
        <TextPlaceholder v-if="store.api_statuses.contact === 'loading'" mode="md" alig="0" />
        <p v-else-if="contact.label_ita">{{ contact.label_ita }}</p>
      </li>
      <li class="section-info-container">
        <EngTextWrapper class="form_label">Nome </EngTextWrapper>
        <TextPlaceholder v-if="store.api_statuses.contact === 'loading'" mode="md" alig="0" />
        <p v-else-if="contact.label_eng">{{ contact.label_eng }}</p>
      </li>
      <li class="section-info-container">
        <p class="form_label">Link</p>
        <TextPlaceholder v-if="store.api_statuses.contact === 'loading'" mode="md" alig="0" />
        <p v-else-if="contact.link_value">{{ contact.link_value }}</p>
      </li>
    </ul>
  </div>

  <!-- EDIT/CREATE FORM -->
  <div v-else class="edit">
    <div class="image_form">
      <InputImage label="Immagine" name="image" :class="validationErrors.image ? 'error' : ''"
        class="form_partial_container" v-model="contact.image" :url="contact.image_url" :remove="false"
        @change="onFileChange" />
      <span v-if="validationErrors.image" class="error_message">{{ validationErrors.image }}</span>
    </div>
    <div class="edit_labels">
      <div>
        <InputText label="Nome" name="label_ita" :class="validationErrors.label_ita ? 'error' : ''"
          class="form_partial_container" v-model="contact.label_ita" :translate="false" />
        <span v-if="validationErrors.label_ita" class="error_message">{{ validationErrors.label_ita }}</span>
      </div>
      <div>
        <InputText label="Nome" name="label_eng" :ogText="contact.label_ita"
          :class="validationErrors.label_eng ? 'error' : ''" class="form_partial_container" v-model="contact.label_eng"
          :translate="true" />
        <span v-if="validationErrors.label_eng" class="error_message">{{ validationErrors.label_eng }}</span>
      </div>
      <div>
        <InputText label="Link (URL)" name="link" :class="validationErrors.link_value ? 'error' : ''"
          class="form_partial_container" v-model="contact.link_value" :translate="false" />
        <span v-if="validationErrors.link_value" class="error_message">{{ validationErrors.link_value }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.common_spinner {
  text-align: center;
  width: 100%;
  margin: .35rem auto;
}

.read {
  @extend %fx_center;
  margin: 1rem auto;
  padding: 1rem;
  width: 90%;
  flex-direction: column;

  @media screen and (min-width: 576px) {
    width: 80%;
    justify-content: space-between;
    flex-direction: row;

  }

  @media screen and (min-width: 768px) {
    width: 75%;
  }

  @media screen and (min-width: 992px) {
    width: 70%;
  }

  .read_element {
    width: 100%;
  }

  .contact_image_container {
    width: 75%;
    margin: 1rem auto 0;
    text-align: center;
    margin-bottom: 1rem;
    border-radius: var(--border_radius);
    border: var(--border_sm) #9e9d9d56;
    box-shadow: 0 0 5px #0000001a;

    &.image_contact {
      background-color: #d3d3d3;
      border-radius: 6px;
      align-content: center;
      min-height: 200px;
      min-width: 200px;
      border: solid 0.4px #808080;
      box-shadow: 0 0 7px -4px #a3a3a3b2;
    }

    img {
      width: 200px;
      height: 200px;
      display: block;
      border-radius: var(--border_radius);
      object-fit: cover;
    }
  }

  .section-info-container {
    padding-bottom: 0.5rem;

    h2,
    p {
      text-transform: capitalize;
    }

    h2 {
      font-weight: bold;
      color: var(--secondary-color);
    }

    p {
      margin: 0;
    }
  }
}

.edit {
  @extend %fx_center;
  flex-direction: column;

  @media screen and (min-width: 576px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: baseline;
  }

  .image_form {
    width: 75%;
    margin: 0 auto;
    text-align: center;

    @media screen and (min-width: 576px) {
      width: 65%;
    }

    @media screen and (min-width: 768px) {
      width: 50%;
    }
  }

  .edit_labels {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @media screen and (min-width: 768px) {
      width: 50%;
    }
  }
}
</style>
