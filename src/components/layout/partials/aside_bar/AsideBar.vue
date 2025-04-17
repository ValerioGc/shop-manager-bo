<script setup lang="ts">

import { boStore } from '@/stores/boStore';
import UserMenu from "./UserMenu.vue";
import ConsoleFunction from "./ConsoleFunction.vue";

const store = boStore();

const props = withDefaults(defineProps < { head?: boolean } > (), {
    head: true
});
</script>

<template>
    <aside class="aside_container" :class="{ 'head': !props.head }">

        <!-- Logo  -->
        <div class="home_btn_logo_container" v-if="props.head">
            <RouterLink :class="{ 'dis': store.apiStatus === 'loading' }" to="/backoffice/console" class="home_btn_logo">
                <img src="@/assets/logo.svg" alt="shop business logo" title="Torna alla dashboard"
                    loading="eager" />
            </RouterLink>
        </div>

        <!-- Navigation Element List -->
        <ConsoleFunction />

        <!-- User -->
        <UserMenu class="user_menu" />

    </aside>
</template>

<style lang="scss" scoped>

// Desktop Aside Menu
.aside-filter .aside_container {
    height: 100vh;
}

// Mobile Aside Menu
.offcanvas_c .aside_container {
    @extend %full_wh;
}

.aside_container {
    @extend %fx_between_center;
    flex-direction: column;
    width: 30vw;
    overflow: hidden;
    background-color: #f5faff;
    box-shadow: 0 0 5px black;
    z-index: var(--z_2);

    &.head {
        box-shadow: none;
    }

    .home_btn_logo_container {
        box-shadow: 0 0 25px -13px #000000 inset;
        border-bottom: .5px solid #00008b;

        .dis {
            pointer-events: none;
            opacity: .5;
        }

        .home_btn_logo {
            padding: 1.5rem;
            width: 100%;
            box-shadow: 0 0 5px #000000;

            @extend %fx_center;

            img {
                width: 70%;
                margin: auto;
            }
        }
    }
}
</style>
