<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { boStore } from "@/stores/boStore";

interface Props {
  listSize: number;
  perPage: number;
}

const props = defineProps < Props > ();

const emit = defineEmits < { (e: 'update:currentPage', page: number): void }> ();

const store = boStore();
const route = useRoute();
const router = useRouter();

// *************** Responsive handling ***************
const windowWidth = ref < number > (window.innerWidth);

// *************** Pager management ***************
const currentPage = ref < number > (parseInt(route.query.page as string) || 1);
const totalPages = computed < number > (() => Math.ceil(props.listSize / props.perPage));

/**
 * Change page and scroll to top 
 * @param {number} page - The page number to navigate to
 * @returns {void}
 */
function changePage(page: number): void {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    emit('update:currentPage', page);
    router.push({ query: { ...route.query, page: page.toString() } });
  }
}

/**
 * Computed property for pages with ellipsis
 * @returns {(number | string)[]} - The array of pages to show
 */
const pagesToShow = computed < (number | string)[] > (() => {
  const pages: (number | string)[] = [];
  let maxPagesToShow: number;

  if (windowWidth.value <= 350) {
    maxPagesToShow = 1;
  } else if (windowWidth.value <= 768) {
    maxPagesToShow = 3;
  } else {
    maxPagesToShow = 5;
  }

  if (totalPages.value <= maxPagesToShow + 2) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    let startPage = Math.max(currentPage.value - Math.floor(maxPagesToShow / 2), 2);
    let endPage = Math.min(currentPage.value + Math.floor(maxPagesToShow / 2), totalPages.value - 1);

    if (currentPage.value <= Math.ceil(maxPagesToShow / 2)) {
      startPage = 2;
      endPage = maxPagesToShow;
    }

    if (currentPage.value >= totalPages.value - Math.floor(maxPagesToShow / 2)) {
      startPage = totalPages.value - maxPagesToShow + 1;
      endPage = totalPages.value - 1;
    }

    pages.push(1);
    if (startPage > 2) pages.push('...');
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    if (endPage < totalPages.value - 1) pages.push('...');
    pages.push(totalPages.value);
  }

  return pages;
});

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

      <!-- Previous page button -->
      <li class="page_button_item" :class="{ 'disabled': currentPage === 1 }">
        <a href="#" aria-label="Previous" @click.prevent="changePage(currentPage - 1)">
          <img src="@/assets/icons/arrows/chevron-left.svg" alt="next" class="icon" loading="lazy" />
        </a>
      </li>

      <!-- Pages buttons with ellipsis -->
      <li v-for="page in pagesToShow" :key="page" class="page_item"
        :class="{ 'active': page === currentPage, 'disabled': page === '...' }">
        <a class="page_link" href="#" :aria-label="'Pagina ' + page"
          @click.prevent="page !== '...' && changePage(Number(page))">
          {{ page }}
        </a>
      </li>

      <!-- Next page button -->
      <li class="page_button_item" :class="{ 'disabled': currentPage === totalPages }">
        <a href="#" aria-label="Next" @click.prevent="changePage(currentPage + 1)">
          <img src="@/assets/icons/arrows/chevron-right.svg" alt="next" class="icon" loading="lazy" />
        </a>
      </li>

    </ul>
  </nav>
</template>