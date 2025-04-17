<!-- src/components/LoadingSpinner.vue -->
<script setup lang="ts">

import { useBoUserStore } from '@/stores/boUserStore';
import CommonSpinner from '@/components/utils_components/placeholders/CommonSpinner.vue';

const boUserStore = useBoUserStore();

</script>

<template>
    <div class="lc">

        <img src="@/assets/logo.svg" alt="logo" loading="eager">

        <p v-if="boUserStore.loadingType !== null && boUserStore.loadingType === 'logout'">Logging out </p>
        <p v-else>Validating token</p>

        <CommonSpinner :mode="'dots'" />
    </div>
</template>

<style lang="scss" scoped>
.lc {
    @extend %full;
    text-align: center;
    align-content: center;
    background: #ffffffcc;
    z-index: 8;

    img {
        display: block;
        width: 50%;
        max-width: 400px;
        height: auto;
        margin: 0 auto;
    }

    p {
        margin: 2rem auto 1rem;
        font-weight: bold;
        font-size: 1.6rem;
        color: #496ad4;
    }
}
</style>
