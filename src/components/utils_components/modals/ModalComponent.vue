<script setup lang="ts">

interface Props {
  modalTitle: string;
  okBtn?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  okBtn: true,
});

const emit = defineEmits<{ (e: 'outputAction', action: string): void }>();

let disableBtns = false;

function handleAction(action: string): void {
  disableBtns = true;
  emit('outputAction', action);
}

</script>

<template>
  <div class="common_modal fade show" tabindex="-1" aria-labelledby="commonModal">
    <div class="modal_dialog">
      <div class="modal_content">

        <!-- Modal Header -->
        <div class="modal_header">
          <div>
            <img src="@/assets/icons/alert/danger.svg" class="modal_logo" alt="danger" loading="eager" />
            <h1 class="modal_title" v-html="props.modalTitle"></h1>
          </div>
          <button type="button" class="btn_close" aria-label="Close" @click.prevent="handleAction('undo')">
            <img src="@/assets/icons/buttons/x.svg" alt="close" loading="eager" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal_body">
          <slot></slot>
        </div>

        <!-- Modal Footer -->
        <div class="modal_footer">
          <button v-if="props.okBtn" :disabled="disableBtns" type="button" class="btn_custom btn_cust_success"
            @click.prevent="handleAction('ok')">
            Conferma
          </button>
          <button type="button" :disabled="disableBtns" class="btn_custom btn_cust_danger"
            @click.prevent="handleAction('undo')">
            Chiudi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.common_modal {
  @extend %fx_center;
  @extend %full_wh;
  padding: 1rem;
  position: fixed;
  top: 0;
  left: 0;
  outline: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background: #00000080;
  z-index: var(--z_max);
  backdrop-filter: blur(5px);

  &.fade {
    opacity: 0;
    transition: opacity 0.15s linear;
  }

  &.show {
    opacity: 1;
  }

  .modal_dialog {
    position: relative;
    width: auto;
    margin: .5rem;
    pointer-events: none;

    @media (min-width: 576px) {
      max-width: 500px;
      margin: .5rem auto;
    }

    .modal_content {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      border: .5px solid #00000033;
      border-radius: 6px;
      outline: 0;
      background-color: #ffffff;
      box-shadow: 0 0 12px -2px #3434348f;
      pointer-events: auto;

      .modal_header {
        display: flex;
        align-items: center;
        padding: .5rem;
        border-bottom: .5px solid #0000001a;
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
        background-color: var(--secondary-color);
        color: #ffffff;

        div {
          display: flex;
          align-items: center;
        }

        .modal_logo {
          margin-right: .75rem;
          width: 2.5rem;
          height: 2.5rem;
        }

        img {
          filter: invert(1);
        }

        .modal_title {
          margin: 0;
          line-height: 1.4rem;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .btn_close {
          margin-left: auto;
          background: none;
          border: none;

          img {
            width: 20px;
            height: 20px;
          }
        }
      }

      .modal_body {
        min-height: 100px;
        position: relative;
        flex: 1 1 auto;
        padding: 2.5rem 1.5rem;
        font-size: 1rem;
        text-align: center
      }

      .modal_footer {
        @include flexmin(flex-end, center, null, wrap, .25rem);
        padding: 0.5rem;
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
        border-top: .5px solid #2929292b;
        background-color: #dfdfdfd6;
      }
    }
  }
}
</style>
