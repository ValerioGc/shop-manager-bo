<script setup lang="ts">

import { boStore } from "@/stores/boStore.js";

import PageHeader from "./partials/PageHeader.vue";
import MobileNavBar from "./partials/MobileNavBar.vue";
import AsideBar from "@/components/layout/partials/aside_bar/AsideBar.vue";

const store = boStore();

function closeMenu(): void {
    store.closingMenu = true;
}

</script>

<template>

    <div class="main_layout_container">

        <!-- // Aside Menu Overlay -->
        <div class="body_filter_wrapper d-none" id="main_layout" @click.prevent="closeMenu()"></div>

        <!-- // Page Header -->
        <PageHeader class="desktop_nav_header" />
        <MobileNavBar class="mobile_nav_header" />

        <!-- // Aside Bar -->
        <AsideBar class="aside_filter" :head="true" />

        <!-- // Main Content -->
        <main>
            <div class="component_container">
                <slot></slot>
            </div>
        </main>
    </div>

</template>

<style lang="scss">
@use '@/styles/app.scss';
</style>

<style lang="scss" scoped>
.main_layout_container {
    @extend %full;
    display: flex;
    flex-direction: column;

    @media screen and (min-width: 900px) {
        flex-direction: row;
    }

    .body_filter_wrapper {
        position: absolute;
        top: 0;
        left: 0;
        @extend %full_wh;
        cursor: pointer;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: var(--z_2);
        animation: fade 0.35s linear;
    }

    main {
        @extend %full_wh;
        overflow-x: hidden;
        overflow-y: auto !important;
        padding: 0.25rem 0.5rem;
        margin-top: 1rem;
        padding-bottom: 3rem;

        @media screen and (min-width: 520px) {
            padding: 1rem 1rem 5rem;
        }

        @media screen and (min-width: 768px) {
            padding: 1rem 2rem 5rem;
        }

        @media screen and (min-width: 900px) {
            width: 70%;
            margin-top: 4rem;

            .component_container {
                margin-top: 2rem;
                padding: 1rem 0;
            }
        }
    }

    .aside_filter,
    .desktop_nav_header {
        display: none;

        @media screen and (min-width: 900px) {
            display: flex;
        }
    }

    .mobile_nav_header {
        @media screen and (min-width: 900px) {
            display: none !important;
        }
    }
}

@keyframes fade {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}
</style>
