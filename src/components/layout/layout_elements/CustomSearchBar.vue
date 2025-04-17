<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { boStore } from "@/stores/boStore";

interface Props {
  type?: string;
}

const props = defineProps<Props>();

const store = boStore();
const router = useRouter();
const route = useRoute();

// Entity filters list
interface FilterItem {
  value: string;
  label: string;
}
const list: FilterItem[] = [
  { value: "product", label: "Prodotti" },
  { value: "macro-category", label: "Macro Categorie" },
  { value: "sub-category", label: "Sub Categorie" },
  { value: "category", label: "Categorie" },
  { value: "contact", label: "Contatti" },
  { value: "faq", label: "Faq" }
];

// *************** Filter management ***************
const filter = ref<string>(typeof route.query.type === 'string' ? route.query.type : props.type || '');
const selectedFilter = ref<string | null>(null);

/**
 * Set the selected entity search filter and its label
 * @param {string} el - The selected filter
 * @returns {void}
 */
function selectFilter(el: string): void {
  filter.value = el;
  const found = list.find(item => item.value === el);
  selectedFilter.value = found ? found.label : null;
}

// *************** Dropdown management ***************
const openDrp = ref<boolean>(false);

function manageDropdown(): void {
  openDrp.value = !openDrp.value;
}

/**
 * Close the dropdown menu when clicking outside
 * @param {Event} event - The event object
 * @returns {void}
 */
function handleClickOutside(event: Event): void {
  const target = event.target as HTMLElement;
  if (!target.closest('.input_group')) {
    openDrp.value = false;
  }
}

// *************** Search management ***************
const searchInput = ref<string>("");

/**
 * Computed property to check if the search input is valid
 * @returns {boolean} - The validity of the search input
 */
const isValid = computed<boolean>(() => {
  return !!(searchInput.value && searchInput.value.length >= 3 && filter.value !== null);
});

/**
 * Sanitize the input text for SQL injection
 * @param {string} text_query - The text to sanitize
 * @returns {string} - The sanitized text
 */
function sanitizeSQL(text_query: string): string {
  text_query = text_query.replace(/'/g, "''"); // Escape quotes control
  text_query = text_query.replace(/(--|\/\*|\*\/|#)/g, ''); // SQL comment removal and characters control
  const map: Record<string, string> = {
    '\\': '\\\\',
    '"': '\\"',
    '`': '\\`',
    '\x00': '\\x00',
    '\b': '\\b',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
    '\x1a': '\\Z'
  };

  const reg = /[\\'"`\x00\b\n\r\t\x1a]/g; // Characters to escape
  return text_query.replace(reg, (match) => map[match] || '');
}

/**
 * Search function that redirects to the search page with the query
 * @returns {void}
 */
function search(): void {
  if (!isValid.value)
    return;

  router.push({ name: 'search', query: { text: sanitizeSQL(searchInput.value), type: filter.value } });

  // Reset search input and close dropdown
  store.closingMenu = true;
}

// *************** Synchronize filter with URL ***************
onMounted(() => {
  document.addEventListener('click', handleClickOutside);

  // Set the initial filter based on the URL query or props
  if (typeof route.query.type === 'string') {
    selectFilter(route.query.type);
  } else if (props.type) {
    selectFilter(props.type);
  }
});

watch(() => route.query.type, (newType) => {
  if (typeof newType === 'string') {
    selectFilter(newType);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="input_group grouped">

    <!-- Filter dropdown -->
    <button type="button" class="btn_cust dropdown_toggle" @click.prevent="manageDropdown()">
      {{ selectedFilter === null ? 'Filtro' : selectedFilter }}
    </button>
    <ul class="dropdown_menu" v-if="openDrp">
      <li v-for="(el, index) in list" :key="index">
        <button class="dropdown_item" type="button" @click.prevent="manageDropdown(); selectFilter(el.value);">
          {{ el.label }}
        </button>
      </li>
    </ul>

    <!-- Search input -->
    <input type="text" class="form_control" :class="{ 'invalid': !isValid }" v-model="searchInput"
      :placeholder="!selectedFilter ? 'Seleziona un filtro' : !isValid ? 'Inserisci almeno 3 caratteri' : 'Cerca ' + selectedFilter.toLowerCase()"
      :disabled="selectedFilter === null" aria-label="Text input with dropdown button"
      :title="!selectedFilter ? 'Seleziona un filtro' : !isValid ? 'Inserisci almeno 3 caratteri' : 'Cerca ' + selectedFilter.toLowerCase()"
      @keydown.enter.prevent="search()">

    <!-- Search button -->
    <button class="input_group_text" id="search_icon_btn" @click.prevent="search"
      :disabled="!searchInput || searchInput.length < 3"
      :title="!selectedFilter ? 'Seleziona un filtro' : !isValid ? 'Inserisci almeno 3 caratteri' : 'Cerca ' + selectedFilter.toLowerCase()">
      <img src="@/assets/icons/buttons/search.svg" alt="search" loading="eager" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
@use "@/styles/partials/_dropdown.scss";

.input_group {

  @media screen and (min-width: 560px) {
    width: 75%;
  }
}

#search_icon_btn {
  img {
    height: 1.5rem;
    width: 1.5rem;
  }
}

#search_icon_btn,
input:disabled,
input.disabled,
input {
  border-color: #afafaf !important;
}

// *************** Input styles ***************
.invalid:not(:disabled) {
  border-color: rgb(162, 2, 2) !important;
  box-shadow: inset 0 0 5px -1px red !important;
}

// *************** Dropdown styles ***************
.dropdown_toggle,
.dropdown_menu {
  border-top-right-radius: 0 !important;
}

.dropdown_toggle {
  font-weight: bold;
  background: rgb(246, 246, 246);
  color: var(--secondary-color);
  border: 1px solid #afafaf;
  border-radius: 6px;
  border-bottom-right-radius: 0;
  border-right: 0;

  &:hover {
    background: rgb(235, 235, 235);
    color: var(--secondary-color-light);
  }

  &::after {
    vertical-align: middle;
  }
}

.dropdown_menu {
  border-top-left-radius: 6px !important;
  border-bottom-right-radius: 6px !important;
  border-bottom-left-radius: 6px !important;
  max-height: 150px;
  overflow-y: auto;

  li:hover {
    background-color: var(--secondary-color-light);

    .dropdown_item {
      color: white !important;
    }
  }
}
</style>
