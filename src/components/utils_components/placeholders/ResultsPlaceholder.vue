<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

interface Props {
  btn: boolean;
  btnRoute?: string;
}

const props = withDefaults(defineProps < Props > (), {
  btn: false,
});

/**
 * Function to reload the page or redirect to a specific route
 */
function functionSelector(): void {
  if (props.btnRoute != null) {
    router.push(props.btnRoute);
  } else {
    window.location.reload();
  }
}
</script>

<template>
  <div class="no_result">

    <p>
      <img src="@/assets/icons/alert/no-res.svg" alt="No results" loading="eager" />
      <span>
        Nessun Risultato trovato
      </span>
    </p>

    <button v-if="props.btn" type="button" @click.prevent="functionSelector()">
      <span>
        Ricarica la pagina
      </span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.no_result {
  p {
    font-weight: bold;
    text-align: center;
    padding: .65rem;
    margin: 1.25rem auto;
    font-style: italic;
    letter-spacing: 1px;

    img {
      width: 2rem;
      height: 2rem;
      margin-right: .5rem;
    }

    span,
    img {
      vertical-align: middle;
    }
  }
}
</style>
