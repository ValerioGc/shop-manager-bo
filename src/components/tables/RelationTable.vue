<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { boStore } from "@/stores/boStore.js";

import ListPager from "@/components/utils_components/pagers/ListPager.vue";
import TextPlaceholder from "@/components/utils_components/placeholders/TextPlaceholder.vue";
import ResultsPlaceholder from "@/components/utils_components/placeholders/ResultsPlaceholder.vue";
import CommonSpinner from "@/components/utils_components/placeholders/CommonSpinner.vue";

import sort_up from "@/assets/icons/arrows/sort-up.svg";
import sort_down from "@/assets/icons/arrows/sort-down.svg";

interface Sort {
  field: string;
  direction: "asc" | "desc";
}

interface Props {
  modelValue?: any;
  entity: string;
  query: string;
  filter?: number | null;
  list?: any[] | null;
  title?: boolean;
  read?: boolean;
  mode?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: number | null): void;
  (e: "update:label", label: string): void;
  (e: "remove", id: number): void;
  (e: "update:currentPage", page: number): void;
  (e: "update:sort", sort: Sort): void;
}>();

const store = boStore();

// ************ LISTA **********
const selectedValue = ref<number | null>(props.modelValue ?? null);
const listLength = ref<number>(0);
const elementList = ref<any[]>([]);
const paginatedList = ref<unknown[]>([]);

// ************ PAGINATION **********
const currentPage = ref<number>(1);
const itemsPerPage = 7;
const currentSort = ref<Sort>({ field: "label_ita", direction: "desc" });
const status = ref<"loading" | "success" | "error" | "empty">("loading");

/**
 * Scroll to the top of the table
 */
function scrollToTop(): void {
  const tableContainer = document.querySelector(".position-relative");
  if (tableContainer) {
    tableContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * Order and paginate the list
 */
function sortAndPaginateList(): void {
  if (elementList.value.length === 0) {
    paginatedList.value = [];
    return;
  }

  const sortedList = [...elementList.value].sort((a, b) => {
    let comparison = 0;
    if (a[currentSort.value.field] > b[currentSort.value.field]) {
      comparison = 1;
    } else if (a[currentSort.value.field] < b[currentSort.value.field]) {
      comparison = -1;
    }
    return currentSort.value.direction === "asc" ? comparison : -comparison;
  });

  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  paginatedList.value = sortedList.slice(startIndex, endIndex);
}

/**
 * Get the elements from the API
 */
async function getElements(): Promise<void> {
  status.value = "loading";
  let elementType: number | null = null;
  if (props.filter != null) {
    switch (props.filter) {
      case 0:
        elementType = 0;
        break;
      case 1:
        elementType = 1;
        break;
      case 2:
        elementType = 2;
        break;
    }
  }

  const url = `/${props.query}/paginate?page=${currentPage.value}&limit=${itemsPerPage}&orderBy=${currentSort.value.field}&order=${currentSort.value.direction}` +
    (elementType != null ? `&category_id=${elementType}` : "");

  try {
    const res = await store.apiDispatcher(url, "GET", "get" + props.query);

    console.log("res.data");
    console.log(res);
    elementList.value = res.data;
    listLength.value = res.total;
    status.value = "success";
  } catch (error) {
    if (["error", "loading", "success", "empty"].includes(store.apiStatus)) {
      status.value = store.apiStatus as "error" | "loading" | "success" | "empty";
    } else {
      status.value = "error";
    }
    console.error(error);
  }
}

/**
 * Update the current page and get the elements
 */
function updateCurrentPage(page: number): void {
  currentPage.value = page;

  if (props.list !== null && props.list !== undefined) {
    sortAndPaginateList();
    emit("update:currentPage", page);
  } else {
    getElements();
  }

  scrollToTop();
}

/**
 * Update the current sort direction and get the elements
 */
function handleSort(): void {
  currentSort.value.direction = currentSort.value.direction === "asc" ? "desc" : "asc";
  currentPage.value = 1;

  if (props.list !== null && props.list !== undefined) {
    sortAndPaginateList();
    emit("update:sort", currentSort.value);
  } else {
    getElements();
  }

  scrollToTop();
}

/**
 * Manage the selection of an item and emit the events
 */
function handleSelectionChange(value: number, label: string): void {
  selectedValue.value = value;
  emit("update:modelValue", value);
  emit("update:label", label);
}

/**
 * Remove an item from the list
 */
function remove(id: number): void {
  elementList.value = elementList.value.filter(item => item.id !== id);
  listLength.value = elementList.value.length;
  emit("remove", id);

  if (props.list !== null && props.list !== undefined) {
    sortAndPaginateList();
  }
}

// Watcher per props.filter
watch(() => props.filter, (newValue) => {
  if (newValue != null) {
    getElements();
  }
});

// Watcher per props.list
watch(() => props.list, (newValue) => {
  if (newValue) {
    elementList.value = newValue;
    listLength.value = newValue.length;
    status.value = "success";
    sortAndPaginateList();
  }
});

onMounted(async () => {
  if (props.list !== null && props.list !== undefined) {
    elementList.value = props.list;
    listLength.value = props.list.length;
    status.value = "success";
    sortAndPaginateList();
  } else {
    await getElements();
  }
});

</script>

<template>
  <div v-if="props.list || paginatedList || elementList" class="relation_table_container">

    <div v-if="props.title">
      <h2 class="label_title">Lista {{ props.entity }}</h2>
      <hr />
    </div>

    <table class="tab_striped relation_table" v-if="status !== 'error'">
      <thead>
        <tr>
          <th colspan="3" scope="col" @click="handleSort()">
            <span v-if="status !== 'loading'">
              <span>Nome</span>
              <img :src="currentSort.direction === 'asc' ? sort_down : sort_up" alt="sort-icon" />
            </span>

            <TextPlaceholder v-else mode="sm" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in props.list ? paginatedList ? paginatedList : props.list : elementList" :key="index"
          :class="{ 'text_center': status !== 'success' }">

          <td class="radio_container" v-if="props.read">
            <TextPlaceholder v-if="status === 'loading'" mode="btn" />
            <input v-else class="input_radio" type="radio" v-model="selectedValue" :checked="item.id === selectedValue"
              @change="handleSelectionChange(item.id, item.label_ita)" />
          </td>

          <td :class="{ 'text_center': !props.read, 'active': selectedValue === item.id }"
            :colspan="!props.read ? 2 : 1">
            <TextPlaceholder v-if="status === 'loading'" mode="lg" />
            <span v-else>
              {{ item.label_ita }}
            </span>
          </td>

          <td v-if="!props.read && props.mode !== 'read'" class="rm_btn">
            <button class="btn_custom btn_cust_primary" type="button" @click="remove(item.id)">
              <img src="@/assets/icons/buttons/x-lg.svg" alt="remove" loading="lazy" />
            </button>
          </td>
        </tr>
      </tbody>

      <tfoot v-if="listLength > itemsPerPage">
        <tr class="footer_table">
          <td colspan="100%">
            <ListPager :list-size="listLength" :perPage="itemsPerPage" :page="currentPage"
              @update:currentPage="updateCurrentPage" />
          </td>
        </tr>
      </tfoot>
    </table>
  </div>

  <CommonSpinner v-if="status === 'loading' && listLength === 0" :mode="'spinner'" />

  <ResultsPlaceholder v-else-if="status === 'empty' || status === 'error'" :btn="false" />

</template>

<style lang="scss" scoped>
.relation_table_container {
  position: relative;

  .rm_btn {
    text-align: center;
    width: 20%;

    img {
      filter: invert(1);
    }
  }
}
</style>
