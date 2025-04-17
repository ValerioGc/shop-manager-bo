<!-- src/App.vue -->
<script setup lang="ts">
import { useBoUserStore } from '@/stores/boUserStore';
import LoadingPage from '@/components/utils_components/placeholders/LoadingPage.vue';

const boUserStore = useBoUserStore();

</script>

<template>
    <LoadingPage v-if="boUserStore.loading" />
    <RouterView v-else />
</template>

<style lang="scss">
@use './styles/partials/_reset';
@use './styles/partials/_validation';

// ############################ COMMON  ############################
@font-face {
    font-family: 'OpenSans';
    src: url('@/assets/fonts/OpenSans-VariableFont_wdth,wght.ttf') format('truetype');
    font-display: swap;
    font-weight: 100 900;
    font-stretch: 75% 125%;
}

#app,
body {
    width: 100vw;
    height: 100vh;
}

body {
    overflow: hidden;
    min-height: 100vh;
    transition: color .5s, background-color .5s;
    line-height: 1.6;
    font-family: 'Open Sans', sans-serif !important;
    font-size: 16px;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    &>* {
        scroll-behavior: smooth;
    }
}
</style>