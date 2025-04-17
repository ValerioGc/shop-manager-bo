<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  images: string[];
  currentImage: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{ (e: 'close'): void }>();

const isVisible = ref<boolean>(true);

// ************ CURRENT IMAGE INDEX ************
const currentIndex = ref<number>(props.images.indexOf(props.currentImage));

watch(() => props.currentImage, (newImage: string) => {
  currentIndex.value = props.images.indexOf(newImage);
});

// ************ BUTTONS ACTIONS ************
function closeModal(): void {
  isVisible.value = false;
  setTimeout(() => {
    emit('close');
  }, 500);
}

function nextImage(): void {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0;
  }
}

function previousImage(): void {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = props.images.length - 1;
  }
}

/**
 * Go to a specific image in the modal
 * @param {number} index - The index of the image to go to
 */
function goToImage(index: number): void {
  currentIndex.value = index;
}
</script>

<template>
  <transition name="modal">
    <div class="modal_overlay" v-if="isVisible">

      <div class="close_btn_container">
        <button class="close_button" @click.prevent="closeModal">
          <img src="@/assets/icons/buttons/x-lg.svg" alt="Close Modal" loading="lazy" />
        </button>
      </div>

      <div class="modal_image_wrapper">

        <button class="prev_button" @click.prevent="previousImage">
          <img src="@/assets/icons/arrows/chevron-left.svg" alt="Previous Image" loading="lazy" />
        </button>

        <div class="modal_content">
          <img :src="props.images[currentIndex]" alt="Modal Image" class="modal_image" />
        </div>

        <button class="next_button" @click.prevent="nextImage">
          <img src="@/assets/icons/arrows/chevron-right.svg" alt="Next Image" loading="lazy" />
        </button>
      </div>

      <div class="bottom_controls">
        <button class="prev_button" @click="previousImage" v-if="props.images && props.images.length > 1">
          <img src="@/assets/icons/arrows/chevron-left.svg" alt="Previous Image" loading="lazy" />
        </button>

        <!-- Pagination Dots -->
        <div v-if="props.images && props.images.length > 1" class="pagination-dots">
          <span v-for="(image, index) in props.images" :key="index" class="pagination-dot"
            :class="{ 'active': index === currentIndex }" @click="goToImage(index)"></span>
        </div>

        <button class="next_button" @click="nextImage" v-if="props.images && props.images.length > 1">
          <img src="@/assets/icons/arrows/chevron-right.svg" alt="Next Image" loading="lazy" />
        </button>
      </div>

    </div>
  </transition>
</template>

<style lang="scss" scoped>
.modal_overlay {
  @extend %full;
  @include flexmin(space-between, center, column, null, .75rem);
  position: fixed;
  top: 0;
  left: 0;
  background-color: #000000cc;
  backdrop-filter: blur(7px);
  z-index: var(--z_max);

  .prev_button,
  .next_button {
    display: none;

    @media screen and (min-width: 900px) {
      display: block;
    }
  }

  .close_btn_container {
    width: 100%;
    text-align: end;
  }

  .close_button,
  .prev_button,
  .next_button {
    background: none;
    border: none;
    cursor: pointer;
    padding: .75rem;

    img {
      width: 2rem;
      height: 2rem;
      filter: invert(1);
      transition: opacity 0.3s;

      &:hover {
        opacity: 0.7;
      }

      @media screen and (min-width: 900px) {
        width: 2.5rem;
        height: 2.5rem;
      }
    }
  }

  .modal_image_wrapper {
    @extend %fx_center;
    gap: .25rem;
    width: 100%;
    height: calc(85% - 70px);

    .modal_content {
      @extend %fx_center;
      position: relative;
      width: 100%;
      height: calc(100% - 80px);

      @media screen and (min-width: 900px) {
        width: 85%;
      }

      .modal_image {
        @extend %full_wh;
        object-fit: contain;
        max-height: 100%;
      }
    }
  }

  .bottom_controls {
    @extend %fx_between_center;
    gap: .75rem;
    width: 100%;
    padding: 1.5rem;

    .prev_button,
    .next_button {
      display: block;

      @media screen and (min-width: 900px) {
        display: none;
      }
    }

    .pagination-dots {
      @extend %fx_center;
      flex-wrap: wrap;
      width: 100%;

      @media screen and (max-width: 580px) {
        justify-content: center;
      }

      .pagination-dot {
        width: 12px;
        height: 12px;
        background-color: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        margin: 5px;
        cursor: pointer;

        &:hover,
        &.active {
          background-color: white;
        }
      }
    }
  }
}

// ********** ANIMATION TRANSITION **********
.modal-leave-active {
  transition: opacity 0.5s;
}

.modal-enter-active {
  transition: opacity 1.8s;
}

.modal-enter,
.modal-leave-to {
  opacity: 0;
}
</style>
