<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { boStore } from "@/stores/boStore.js";

import InputSelect from "@/components/form_fields/partials/InputSelect.vue";
import ModalComponent from "@/components/utils_components/modals/ModalComponent.vue";
import TextPlaceholder from '@/components/utils_components/placeholders/TextPlaceholder.vue';

// ************* ICONS *************
import sortUp from '@/assets/icons/arrows/sort-up.svg';
import sortDown from '@/assets/icons/arrows/sort-down.svg';

// --- Tipizzazioni ---
interface Props {
  list: any[];
  fields: string[];
  details: any[];
  query: string;
  entity: string;
  sct: string;
}

interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}

// --- Definizione Props ed Emits ---
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'updateSort', payload: { field: string; direction: 'asc' | 'desc' }): void;
  (e: 'update:currentPage', page: number): void;
  (e: 'refresh'): void;
}>();

const store = boStore();
const router = useRouter();
const route = useRoute();

const opt = ref<Array<{ value: number; label: string }>>([]);
const isMobile = ref<boolean>(window.innerWidth < 576);

// ************* RESPONSIVE MANAGEMENT *************
function handleResize(): void {
  isMobile.value = window.innerWidth < 576;
}
window.addEventListener('resize', handleResize);

// ************* ENTITY MANAGEMENT *************
function getCurrentEntity(): string {
  if (props.query === 'category' && router.currentRoute.value.name !== 'search') {
    switch (props.entity) {
      case 'Macro Categorie':
        return 'macro-category';
      case 'Sotto Categorie':
        return 'sub-category';
      case 'Categorie':
        return 'category';
    }
  }

  if (route.name === 'search') {
    return typeof route.query.type === 'string' ? route.query.type : '';
  }

  if (route.name === 'product-trash') {
    return 'product';
  }

  return props.query;
}

// ************* SORT MANAGEMENT *************
const currentSort = ref<Sort>({ field: 'updated_at', direction: 'desc' });

function toggleSort(field: string | number): void {
  if (store.apiStatus !== 'success') return;

  const sortField = field === 'formatted_updated_at' ? 'updated_at' : field;

  if (currentSort.value.field === sortField) {
    currentSort.value.direction = currentSort.value.direction === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.value.field = String(sortField);
    currentSort.value.direction = 'asc';
  }
  emit('updateSort', { field: currentSort.value.field, direction: currentSort.value.direction });
}

function changeDirection(value: string | number): void {
  if (value === 'asc' || value === 'desc') {
    currentSort.value.direction = value;
  }
  emit('updateSort', { field: currentSort.value.field, direction: currentSort.value.direction });
}

function getClassForSortIcon(field: string): string {
  const sortField = field === 'formatted_updated_at' ? 'updated_at' : field;

  if (currentSort.value.field === sortField) {
    return currentSort.value.direction === 'asc' ? sortDown : sortUp;
  }
  return sortDown;
}

// ************* COMMON MODAL MANAGEMENT *************
const showCommonModal = ref<boolean>(false);
function toggleCommonModal(): void {
  showCommonModal.value = !showCommonModal.value;
}

// ************* DELETE MANAGEMENT *************
const del = ref<string>('');

async function select(item: any, action: string): Promise<void> {
  if (item) {
    store.setSelectedItem(item);
  }

  if (action === 'restore') {
    del.value = 'restore';
  } else if (action === 'empty') {
    del.value = 'empty';
  } else if (action === 'delete') {
    del.value = 'delete';
  } else if (action === 'duplicate') {
    del.value = 'duplicate';
  }
}

/**
  * Manage the action to be performed when closing the modal.
  * It will call the appropriate function based on the action selected.
  * @param action - The action to be performed.
*/
async function manageActionElement(action: string): Promise<void> {
  showCommonModal.value = false;
  if (action === 'ok') {
    if (props.entity === 'Prodotti') {
      if (del.value === 'duplicate') {
        await duplicateElement();
        emit('refresh');
      } else {
        await productSoftDelete();
        emit('refresh');
      }
    } else if (props.entity === 'Cestino Prodotti') {
      if (del.value === 'delete') {
        await deleteElement();
      } else if (del.value === 'restore') {
        await restoreElement();
      } else if (del.value === 'empty') {
        await emptyTrash();
      }
      emit('refresh');
      return;
    } else if (del.value === 'delete') {
      await deleteElement();
      emit('refresh');
    }
  }
}


async function duplicateElement(): Promise<void> {
  try {
    await store.apiDispatcher(`/product/clone/${store.selectedItem.id}`, 'POST', 'duplicate')
      .then((response) => {
        if (
          response &&
          (response.status === 'successo' || response.status === 'success' || response.status === 200)
        ) {
          router.push({ name: 'product-all', query: { page: route.query.page } });
          store.showMessage('Prodotto duplicato con successo', 4000, 'success');
        } else {
          store.showMessage(response.error, 7000, 'error');
        }
      });
  } catch (error) {
    console.error(error);
    store.showMessage('Errore durante la duplicazione del prodotto', 7000, 'error');
  }
}

async function productSoftDelete(): Promise<void> {
  await store.apiDispatcher(
    `/product/soft/delete/${store.selectedItem.id}`,
    'POST',
    props.query
  ).then((response) => {
    if (response.status === 'success' || response.status === 200) {
      router.push({ name: 'product-all', query: { page: route.query.page } });
      store.showMessage('Prodotto eliminato con successo', 5000, 'success');
    } else {
      router.push({ name: 'product-all', query: { page: route.query.page } });
    }
  });
}

async function deleteElement(): Promise<void> {
  const start: string = props.query === 'product/deleting' ? 'product' : props.query;

  try {
    await store.apiDispatcher(
      `/${start}/delete/${store.selectedItem.id}`,
      'DELETE',
      props.query
    ).then((response) => {
      if (props.entity === 'Cestino Prodotti') {
        if (response.status === 'success' || response.status === 'successo' || response.status === 200) {
          router.push({ name: 'product-trash' });
          store.showMessage('Prodotto eliminato con successo', 5000, 'success');
        } else {
          router.push({ name: 'product-trash' });
          store.showMessage(response.error, 5000, 'error');
        }
      } else {
        if (response.status === 'success' || response.status === 'successo' || response.status === 200) {
          router.push({ name: `${props.query}-all` });
          store.showMessage('Elemento eliminato con successo', 5000, 'success');
        } else {
          router.push({ name: `${props.query}-all` });
          console.log(response);
          store.showMessage(response.error, 5000, 'error');
        }
      }
    });
  } catch (error) {
    router.push({ name: `${props.query}-all` });
    store.showMessage(error as string, 5000, 'error');
  }
}

async function restoreElement(): Promise<void> {
  try {
    await store.apiDispatcher(
      `/product/restore/soft/${store.selectedItem.id}`,
      'POST',
      props.query
    ).then((response) => {
      if (response.status === 'success' || response.status === 200) {
        router.push({ name: 'product-trash' });
        store.showMessage('Prodotto ripristinato con successo', 5000, 'success');
      } else {
        router.push({ name: 'product-trash' });
        store.showMessage('Errore durante il ripristino del prodotto', 5000, 'error');
      }
    });
  } catch (error) {
    console.error(error);
    router.push({ name: 'product-trash' });
    store.showMessage('Errore durante il ripristino del prodotto', 5000, 'error');
  }
}

async function emptyTrash(): Promise<void> {
  try {
    await store.apiDispatcher(
      `/product/delete/empty`,
      'POST',
      props.query
    ).then((response) => {
      if (response.status === 'success' || response.status === 200) {
        router.push({ name: `product-trash` });
        store.showMessage('Cestino svuotato con successo', 5000, 'success');
      } else {
        router.push({ name: `product-trash` });
        store.showMessage('Errore durante lo svuotamento del cestino', 5000, 'error');
      }
    });
  } catch (error) {
    router.push({ name: `product-trash` });
    store.showMessage('Errore durante lo svuotamento del cestino', 5000, 'error');
    console.log(error);
  }
}

// ************* WATCHERS *************
watch(() => currentSort.value.field, (newField) => {
  const sortField = newField === 'formatted_updated_at' ? 'updated_at' : newField;
  emit('updateSort', { field: sortField, direction: currentSort.value.direction });
});

// ************* ON MOUNT *************
onMounted(() => {
  handleResize();

  props.details.forEach((detail, index) => {
    opt.value.push({
      value: detail,
      label: props.fields[index]
    });
  });

  const initialField = currentSort.value.field === 'updated_at' ? 'formatted_updated_at' : currentSort.value.field;
  currentSort.value.field = initialField;
  emit('updateSort', { field: initialField, direction: currentSort.value.direction });
});

</script>


<template>
  <div class="position-relative">

    <!-- Confirmation MODAL -->
    <ModalComponent v-if="showCommonModal" modal-title="Attenzione!" :ok-btn="true" @outputAction="manageActionElement">
      <p v-if="del === 'delete' && props.query === 'product'">Sei sicuro di voler spostare nel cestino questo elemento?
      </p>
      <p v-else-if="del === 'delete'">Sei sicuro di voler eliminare questo elemento?</p>
      <p v-else-if="del === 'restore'">Sei sicuro di voler ripristinare questo elemento?</p>
      <p v-else-if="del === 'duplicate'">Sei sicuro di voler duplicare l'elemento?</p>
      <p v-else-if="del === 'empty'">Sei sicuro di voler svuotare il cestino?</p>
    </ModalComponent>

    <!-- Order selector for mobile -->
    <div class="order" v-if="isMobile">
      <InputSelect class="o1" v-model="currentSort.field" name="sort" :placeholder="'Ordina per'" label="Ordina per"
        :options="opt" :float="true" @update:modelValue="toggleSort" />

      <InputSelect v-model="currentSort.direction" name="order o2" label="Ordine" :placeholder="'inpSeleziona ordine'"
        :options="[{ value: 'asc', label: 'ASC' }, { value: 'desc', label: 'DESC' }]" :float="true"
        @update:modelValue="changeDirection" />
    </div>

    <!-- ALERT Recycle bin -->
    <transition name="fade" mode="out-in">
      <div class="alert_custom" v-if="props.query === 'product/deleting' && store.apiStatus !== 'error'">
        <div class="alert_wrapper">
          <div class="md_logo_tash_icon">
            <img src="@/assets/icons/alert/danger.svg" alt="trash" loading="lazy" />
          </div>
          <div>
            <h1 class="sm_logo_tash_icon">
              <img src="@/assets/icons/alert/danger.svg" alt="trash" loading="lazy" />
              <span class="alert_custom_title">Attenzione!</span>
            </h1>
            <p class="alert_custom_text">
              Il prodotti nel cestino da pi&ugrave; di
              <span>30 giorni</span>
              verranno eliminati automaticamente.
            </p>
          </div>
        </div>
        <button class="btn_custom btn_cust_danger" href="#" @click.prevent="select(null, 'empty'); toggleCommonModal()"
          :disabled="store.apiStatus === 'loading' || !list || list && list.length === 0"
          :class="{ 'trsh_null': store.apiStatus !== 'loading' && !list || store.apiStatus !== 'loading' && list && list.length === 0 }">
          <img src="@/assets/icons/buttons/trash.svg" alt="trash" loading="lazy" />
          <span>Svuota</span>
        </button>
      </div>
    </transition>

    <!-- DESKTOP Table -->
    <div v-if="!isMobile">
      <table class="tab tab_striped" v-if="list != null && list.length > 0">

        <!-- Header Table -->
        <thead>
          <tr>
            <th scope="col" v-for="(field, index) in fields" :key="index"
              :class="props.sct === details[index] && store.apiStatus === 'success' ? 'active' : ''"
              @click="toggleSort(details[index])">
              <span v-if="store.apiStatus === 'success' && field != null" class="th_wrap">
                <span>{{ field }}</span>
                <img :src="getClassForSortIcon(details[index])" alt="sort icon" />
              </span>

              <TextPlaceholder v-else mode="sm" />
            </th>
            <th scope="col" v-if="store.apiStatus === 'success'">Azioni</th>
          </tr>
        </thead>

        <!--Body Table -->
        <tbody>
          <tr v-for="(item, index) in list" :key="index" :class="{ 'text-center': store.apiStatus !== 'success' }"
            class="table_row">
            <td v-for="(detail, dIndex) in details" :key="'cell-' + index + '-' + dIndex" class="table_row_item"
              :title="item[detail]">

              <span v-if="store.apiStatus === 'success' && item[detail] != null">
                {{ item[detail] }}
              </span>

              <TextPlaceholder v-else mode="md" />
            </td>

            <!-- ACTIONS  -->
            <td v-if="store.apiStatus === 'success'" class="act_btn">
              <RouterLink class="btn_custom btn_cust_success" title="Dettagli"
                :to="'/backoffice/console/' + getCurrentEntity() + '/details/' + item.id" @click="select(item, 'read')">
                <img src="@/assets/icons/buttons/details.svg" alt="trash" loading="lazy" />
              </RouterLink>

              <a href="#" @click="select(item, 'restore'); toggleCommonModal()" title="Ripristina"
                class="btn_custom btn_cust_primary repeat" v-if="props.query === 'product/deleting'">
                <img src="@/assets/icons/buttons/repeat.svg" alt="trash" loading="lazy" />
              </a>

              <RouterLink v-else @click="select(item, 'edit')"
                :to="'/backoffice/console/' + getCurrentEntity() + '/edit/' + item.id" title="Modifica"
                class="btn_custom btn_cust_primary">
                <img src="@/assets/icons/buttons/edit.svg" alt="trash" loading="lazy" />
              </RouterLink>

              <!-- Duplicate entity button  -->
              <a href="#" v-if="props.entity === 'Prodotti' ||
                route.name === 'product-draft' ||
                route.name === 'product-uncat'
                || route.name === 'search'" class="btn_custom btn_cust_primary rem_association"
                :disabled="store.apiStatus !== 'success'" title="Duplica"
                @click.prevent="select(item, 'duplicate'); toggleCommonModal()">
                <img src="@/assets/icons/buttons/duplicate.svg" alt="duplicate" loading="lazy" width="16px"
                  height="16px" />
              </a>

              <a href="#" @click.prevent="select(item, 'delete'); toggleCommonModal()" title="Elimina"
                class="btn_custom btn_cust_danger">
                <img src="@/assets/icons/buttons/trash.svg" alt="trash" loading="lazy" />
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MOBILE LIST -->
    <div v-else>
      <ul class="list_container">
        <li v-for="(item, index) in props.list" :key="index" :class="{ 'text_center': store.apiStatus !== 'success' }">
          <div class="list_mobile_element" v-if="store.apiStatus === 'success'" @click.prevent="select(item, '')">

            <p :title="item.question_ita ? item.question_ita : item.label_ita">
              {{ item.question_ita ? item.question_ita : item.label_ita }}
            </p>

            <div>
              <RouterLink :to="'/backoffice/console/' + getCurrentEntity() + '/details/' + item.id" title="Dettagli"
                class="btn_custom btn_cust_success">
                <img src="@/assets/icons/buttons/details.svg" alt="eye" loading="lazy" />
              </RouterLink>

              <button @click="select(item, 'restore'); toggleCommonModal()" class="btn_custom btn_cust_primary"
                title="Ripristina" v-if="props.query === 'product/deleting'">
                <img src="@/assets/icons/buttons/repeat.svg" alt="trash" loading="lazy" />
              </button>

              <RouterLink v-else :to="'/backoffice/console/' + getCurrentEntity() + '/edit/' + item.id" title="Modifica"
                class="btn_custom btn_cust_primary">
                <img src="@/assets/icons/buttons/edit.svg" alt="pencil" loading="lazy" />
              </RouterLink>

              <!-- Duplicate entity button  -->
              <a href="#" type="button" v-if="props.entity == 'Prodotti' ||
                route.name === 'product-draft' ||
                route.name === 'product-uncat' ||
                route.name === 'search'" class="btn_custom btn_cust_primary rem_association" title="Duplica"
                :disabled="store.apiStatus !== 'success'"
                @click.prevent="select(item, 'duplicate'); toggleCommonModal()">
                <img src="@/assets/icons/buttons/duplicate.svg" alt="duplicate" loading="lazy" width="16px"
                  height="16px" />
              </a>

              <button @click="select(item, 'delete'); toggleCommonModal()" class="btn_custom btn_cust_danger"
                title="Elimina">
                <img src="@/assets/icons/buttons/trash.svg" alt="trash" loading="lazy" />
              </button>
            </div>
          </div>

          <!-- PLACEHOLDER -->
          <div v-else class="pl_container">

            <TextPlaceholder mode="md" />

            <div class="pl_btn_container">
              <TextPlaceholder mode="btn" />

              <TextPlaceholder mode="btn" />

              <TextPlaceholder mode="btn" />
            </div>
          </div>
        </li>
      </ul>
    </div>

  </div>
</template>

<style lang="scss" scoped>
.rem_association {
  background-color: #0098be;
}

.alt_cl {
  background-color: #d0920b;
}

.repeat {
  img {
    width: 1rem;
    height: 1rem;
  }
}

.row_pl {
  width: 70%;
  margin: auto;

  &>* {
    width: 100% !important;
  }
}

// ************* Order Selector *************
.order {
  @extend %fx_between_center;
  margin: 1rem auto 1.5rem auto;
  gap: 0.5rem !important;
}

.o1 {
  width: 65%;
}

.o2 {
  width: 35%;
}

// ************* Trash bin alert *************
.alert_custom {
  @include flexmin(space-between, center, column, null, .5rem);
  padding: .85rem;
  margin: 0 auto 1rem;
  border-radius: var(--border_radius);
  border: var(--border_sm) #a600004f;
  color: var(--danger_color_dark);
  background-color: var(--danger_color_light);
  text-align: center;

  @media (min-width: 576px) {
    flex-direction: row;
    text-align: left;
  }

  .alert_wrapper {
    @extend %fx_between_center;
    gap: .75rem;
    width: 80%;

    @media (min-width: 576px) {
      width: 70%;
      justify-content: flex-start;
    }
  }

  .sm_logo_tash_icon {
    display: inline-block !important;

    @media (min-width: 576px) {
      display: none !important;
    }

    img {
      display: inline-block;
      width: 2rem;
      margin-right: .75rem;
      height: 2rem;
    }
  }

  .md_logo_tash_icon {
    display: none;

    @media (min-width: 576px) {
      display: inline-block;

      img {
        display: inline-block;
        width: 3rem;
        margin-right: .75rem;
        height: 3rem;
      }
    }
  }

  .trsh_null:disabled {
    cursor: not-allowed !important;

    &:hover {
      transform: scale(1) !important;
      opacity: 1 !important;
    }
  }

  .alert_custom_title {
    font-weight: bold;
    font-size: 1.35rem;
    padding-bottom: .35rem;
  }

  .alert_custom_text {
    margin-bottom: 0;

    span {
      font-weight: bold;
    }
  }

  .btn_custom {
    flex-shrink: 0;
    margin: auto;

    img {
      padding-right: .35rem;
      width: 1.5rem;
      filter: invert(1);
    }
  }
}

// ************* DEKSTOP TABLE *************
.tab {
  border: 0.5px solid rgba(135, 135, 135, 0.921);
  box-shadow: 0 0 7px -4px rgba(163, 163, 163, 0.699);

  tr {
    text-align: center;
    cursor: pointer;

    thead {
      border-bottom: 0.7px solid rgb(128, 128, 128);

      th {
        font-weight: bold;
        cursor: pointer;

        &.active {
          background-color: var(--secondary-color-light) !important;
          color: #fff !important;
        }

        .row_pl {
          filter: brightness(1.5);
        }
      }
    }

    tbody {
      border: 0;
      border-bottom: 0.4px solid rgba(128, 128, 128, 0.921);

      tr td:not(:nth-child(2)) {
        text-align: center;
      }

      tr td:nth-child(2) {
        flex-shrink: 0;
      }

      td {
        align-content: center;
      }

      .table_row:last-child {
        border-bottom-left-radius: 4px !important;
        border-bottom-right-radius: 4px !important;
      }
    }
  }

  tr:last-child {
    border-bottom-left-radius: 4px !important;
    border-bottom-right-radius: 4px !important;

    td {
      height: 100%;
    }

    td:first-child {
      border-bottom-left-radius: 4px !important;
    }

    td:last-child {
      border-bottom-right-radius: 4px !important;
    }
  }

  .act_btn {
    @extend %fx_center;
    text-align: center;
    flex-wrap: wrap;
    height: 100% !important;
    gap: 0.25rem;

    img {
      filter: invert(1);
    }
  }
}

// ************** MOBILE LIST **************
.list_container {
  padding: 0;
  text-align: center;
  list-style-type: none;

  li {
    padding: 1rem 0.5rem;
    border: 1px solid #ccc;
    cursor: pointer;
    margin: 1rem auto;
    border-radius: 10px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    background: #f5f5f5;

    .list_mobile_element {
      display: flex;
      align-items: center;
      flex-direction: column;
      gap: .5rem;
      justify-content: center;

      div {
        @extend %fx_around_center;
        gap: .35rem;
        flex-wrap: wrap;

        img {
          filter: invert(1);
        }
      }
    }

    &:hover {
      background: #e9e9e9;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    }

    p {
      text-align: start;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn_custom {
      padding: 0.45rem 0.6rem;

      @media screen and (min-width: 350px) {
        padding: 0.45rem 0.75rem;
      }

      @media screen and (min-width: 400px) {
        padding: 0.5rem 1rem;
      }

      img {
        width: 16px;
        height: 16px;
        display: block !important;
      }

      &.btn_cust_success {
        color: #28a745;
      }

      &.btn_cust_primary {
        color: #007bff;
      }


      &.btn_cust_danger {
        color: #dc3545;
      }
    }
  }

  .pl_container {
    @extend %fx_between_center;
    align-content: center;

    .pl_btn_container {
      width: 30%;

      &>* {
        margin-right: 0.25rem;
      }
    }
  }
}
</style>
