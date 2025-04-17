<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { boStore } from "@/stores/boStore";

interface Props {
  listSize: number;
  perPage: number;
  page: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{ (e: 'update:currentPage', page: number): void }>();

const store = boStore();
const route = useRoute();

const windowWidth = ref<number>(window.innerWidth);
// Pagination management
const totalPages = computed<number>(() => Math.ceil(props.listSize / props.perPage));
const currentPage = ref<number>(props.page);

// Synchronize currentPage with props
watch(() => props.page, (newPage: number) => {
  currentPage.value = newPage;
});

/**
 * Change the current page
 * @param {number} page - The new page number
 * @returns {void}
 */
function changePage(page: number): void {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    emit('update:currentPage', page);
  }
}

onMounted(() => {
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth;
  });
});

// Watch for route page query change and update currentPage value
watch(() => route.query.page, (newPage) => {
  currentPage.value = newPage ? parseInt(newPage as string) || 1 : 1;
});
</script>

<template>
  <nav aria-label="Page navigation" class="pager_container">
    <ul class="pager" :class="{ 'load_disabled': store.apiStatus === 'loading' }">
      <!-- First page button -->
      <li class="page_button_item" :class="{ 'disabled': currentPage === 1 }">
        <a href="#" aria-label="Previous" @click.prevent="changePage(currentPage - 1)">
          <img src="@/assets/icons/arrows/double-chevron-left.svg" alt="next" class="icon" loading="lazy" />
        </a>
      </li>
      <!-- Pages buttons -->
      <li v-for="page in totalPages" :key="page" class="page_item" :class="{ 'active': page === currentPage }">
        <a class="page_link" href="#" :aria-label="'Pagina ' + page" @click.prevent="changePage(page)">
          {{ page }}
        </a>
      </li>
      <!-- Last page button -->
      <li class="page_button_item" :class="{ 'disabled': currentPage }">
        <a aria-label="Next" href="#" @click.prevent="changePage(currentPage + 1)">
          <img src="@/assets/icons/arrows/double-chevron-right.svg" alt="next" class="icon" loading="lazy" />
        </a>
      </li>
    </ul>
  </nav>
</template>