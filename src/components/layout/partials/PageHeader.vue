<script setup lang="ts">

import CustomSearchBar from "@/components/layout/layout_elements/CustomSearchBar.vue";
import { boStore } from '@/stores/boStore.js';

const store = boStore();

</script>


<template>
    <header>
        <div class="header_container" :class="{ 'dis_cont': store.apiStatus === 'loading' }">
            <RouterLink to="/backoffice/console/product/trash" class="btn_custom btn_cust_light trsh_link_btn"
                :class="{ 'dis': store.apiStatus === 'loading' }">
                <img src="@/assets/icons/buttons/trash_light.svg" alt="cestino" loading="lazy" />
                Cestino
            </RouterLink>
            <CustomSearchBar class="src_bar_comp" :class="{ 'dis': store.apiStatus === 'loading' }" />
        </div>
    </header>
</template>

<style lang="scss" scoped>
header {
    position: fixed;
    top: 0;
    right: 0;
    width: 100%;
    padding: 1.5rem 0;
    overflow: visible;
    z-index: var(--z_2);
    box-shadow: 0 0 5px var(--shadow-box-color);
    background: var(--secondary-color);

    @media (min-width: 900px) {
        width: 70%;
    }

    .dis_cont {
        cursor: wait;

        .dis {
            pointer-events: none;
            opacity: 0.5;
        }
    }

    .header_container {
        @extend %fx_around_center;
        width: 100%;
        padding: auto 1rem;

        .src_bar_comp {
            padding-right: 1rem;
            margin-right: 1.25rem;
        }

        .trsh_link_btn img {
            width: 1.25rem;
            height: 1.25rem;
        }
    }
}
</style>
