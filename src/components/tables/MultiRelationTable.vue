<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { boStore } from "@/stores/boStore.js";
import apiClient from "@/axios";
import ListPager from "@/components/utils_components/pagers/ListPager.vue";
import ResultsPlaceholder from "@/components/utils_components/placeholders/ResultsPlaceholder.vue";
import TextPlaceholder from '@/components/utils_components/placeholders/TextPlaceholder.vue';

import sort_up from "@/assets/icons/arrows/sort-up.svg";
import sort_down from "@/assets/icons/arrows/sort-down.svg";

interface Label {
  id: number;
  label_ita: string;
}

interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}

interface Props {
  modelValue: Label[];
  entity: string;
  query: string;
  filter: number | string | null;
  title: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Label[]): void;
}>();



const store = boStore();

const listLength = ref<number>(0);
const allItems = ref(new Map<number, any>());

const selectedLabels = ref<Label[]>(props.modelValue.map(item => ({
  id: item.id,
  label_ita: item.label_ita
})));

watch(() => props.filter, (newValue) => {
  if (newValue != null) {
    getElements();
    getAllCategories();
  }
});

const list = ref<any[]>([]);
const selectedValues = ref<number[]>([]);

watch(() => props.modelValue, (newValue) => {
  selectedValues.value = newValue.map(item => item.id);
  selectedLabels.value = newValue.map(item => ({
    id: item.id,
    label_ita: item.label_ita
  }));
}, { immediate: true, deep: true });

function handleSelectionChange(item: any, event: Event): void {
  const target = event.target as HTMLInputElement;
  const value = item.id;

  if (target.checked) {
    if (!selectedValues.value.includes(value)) {
      selectedValues.value.push(value);
      selectedLabels.value.push({ id: value, label_ita: item.label_ita });
    }
  } else {
    const index = selectedValues.value.indexOf(value);
    if (index > -1) {
      selectedValues.value.splice(index, 1);
      const labelIndex = selectedLabels.value.findIndex(label => label.id === value);
      if (labelIndex > -1) {
        selectedLabels.value.splice(labelIndex, 1);
      }
    }
  }
  emit('update:modelValue', selectedLabels.value);
}

// *********** PAGINATION ***********
const currentPage = ref<number>(1);
function updateCurrentPage(page: number): void {
  currentPage.value = page;
  getElements();
}

const currentSort = ref<Sort>({
  field: 'label_ita',
  direction: 'desc'
});

function handleSort(): void {
  currentPage.value = 1;
  currentSort.value.direction = currentSort.value.direction === 'asc' ? 'desc' : 'asc';
  getElements();
}

const status = ref<'loading' | 'success' | 'error' | 'empty'>('loading');

/*
 * Get elements from the API and store them in the list
 */
async function getElements(): Promise<void> {
  status.value = 'loading';

  const url = `/${props.query}/paginate?page=${currentPage.value}&limit=${store.perPage}` +
    `&orderBy=${currentSort.value.field}&order=${currentSort.value.direction}` +
    (props.filter != null ? `&category_id=${props.filter}` : '');

  try {
    await store.apiDispatcher(url, 'GET', 'get' + props.entity)
      .then((res: any) => {
        list.value = res.data;
        listLength.value = res.total;
        res.data.forEach((item: any) => {
          if (!allItems.value.has(item.id)) {
            allItems.value.set(item.id, item);
          }
        });
        status.value = 'success';
      });
  } catch (error) {
    status.value = store.apiStatus === 'error' || store.apiStatus === 'empty' || store.apiStatus === 'loading' || store.apiStatus === 'success' ? store.apiStatus : 'error';
    console.error(error);
  }

  search_query.value = '';
}

function isChecked(id: number): boolean {
  return selectedValues.value.includes(id);
}

function isActive(id: number): boolean {
  return selectedValues.value.includes(id);
}

onMounted(async () => {
  await getElements();
});

// *********** CATEGORIES ***********
const search_query = ref<string>('');

watch(() => search_query.value, () => {
  const url = `/private/${props.query}/paginate?page=${currentPage.value}&limit=${store.perPage}` +
    `&orderBy=${currentSort.value.field}&order=${currentSort.value.direction}` +
    (props.filter != null ? `&category_id=${props.filter}` : '') +
    (search_query.value ? `&query=${search_query.value.toLowerCase()}` : '');

  console.log("Calling: " + url);

  apiClient.get(url)
    .then((res: any) => {
      list.value = res.data.data;
      listLength.value = res.data.total;
      console.log("List: ", list.value);
    });
});

function getAllCategories(): void {
  console.log('getAllCategories not implemented');
}
</script>

<template>
  <div class="multi_relation_table_container" v-if="list">

    <div v-if="props.title">
      <h2 class="label_title">Lista {{ props.entity }}</h2>
      <hr />
    </div>

    <table class="tab tab_striped relation_table" v-if="status !== 'error'">
      <thead>
        <tr>
          <th colspan="2" scope="col" @click.prevent="handleSort">
            <span v-if="status === 'success'">
              <span>Nome</span>
              <img :src="currentSort.direction === 'asc' ? sort_down : sort_up" alt="sort-icon" loading="eager" />
            </span>
            <TextPlaceholder v-if="status === 'loading'" mode="sm" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in list" :key="index" :class="{ 'text_center': status !== 'success' }">
          <td class="radio_container">
            <TextPlaceholder v-if="status === 'loading'" mode="btn" />
            <input v-else class="input_radio" type="checkbox" :value="item.id" :checked="isChecked(item.id)"
              @change="handleSelectionChange(item, $event)" />
          </td>
          <td :class="{ 'active': isActive(item.id) && store.apiStatus !== 'loading' }">
            <TextPlaceholder v-if="status === 'loading'" mode="md" alig="0" />
            <span v-else>
              {{ item.label_ita }}
            </span>
          </td>
        </tr>
      </tbody>
      <tfoot v-if="listLength > store.perPage">
        <tr class="footer_table">
          <td colspan="100%">
            <ListPager :list-size="listLength" :perPage="store.perPage" :page="currentPage"
              @update:currentPage="updateCurrentPage" />
          </td>
        </tr>
      </tfoot>
    </table>

    <ResultsPlaceholder v-if="status === 'empty' || status === 'error'" :btn="false" />

  </div>
</template>


<style lang="scss" scoped>
.relation_table {

  &:deep(.m_a) {
    filter: brightness(1.5);
  }
}

.category_search {
  margin: 1rem auto;
  display: flex;
  align-items: center;
  justify-content: space-around;

  &:deep(.multiselect__single) {
    position: absolute;
    top: .5rem;
    left: .5rem;
  }

  &:deep(.multiselect__input) {
    width: 100% !important;
  }

  &:deep(.multiselect__content_wrapper) {
    width: 100% !important;
    border: .1px solid;
    border-top: 0px;
  }

  input:hover {
    filter: brightness(.97);
  }


}

.multi_relation_table_container {
  position: relative;
}

.disabled_container {
  pointer-events: none;
  opacity: .9;
}
</style>