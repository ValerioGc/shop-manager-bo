<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">

import { ref, watch, onMounted } from "vue";
import { boStore } from "@/stores/boStore.js";

import AsideBar from "@/components/layout/partials/aside_bar/AsideBar.vue";
import CustomSearchBar from "@/components/layout/layout_elements/CustomSearchBar.vue";

const store = boStore();
const isOpen = ref<boolean>(false);
const isClosing = ref<boolean>(false);

function openMenu(): void {
    isOpen.value = true;
    isClosing.value = false;
}

/*
* Close the offcanvas aside menu and set the isOpen ref to false
* Add a delay to allow the SCSS transition to complete
*/
function closeMenu(): void {
    isClosing.value = true;
    setTimeout(() => {
        isOpen.value = false;
        isClosing.value = false;
    }, 300);
}

/**
* Watch for changes in the isOpen ref and apply the necessary classes to the offcanvas aside menu
*/
watch(isOpen, (newVal) => {
    const offcanvasElement = document.getElementById('offcanvasNavbar') as HTMLElement;
    const mainLayout = document.getElementById('main_layout') as HTMLElement;

    if (newVal) {
        offcanvasElement.classList.add('show');
        mainLayout.classList.add('show');
        mainLayout.classList.remove('d-none');
    } else {
        offcanvasElement.classList.remove('show');
        mainLayout.classList.add('d-none');
        mainLayout.classList.remove('show');
    }
});

const handleStoreChange = (newVal: any) => {
    if (newVal) {
        closeMenu();
        store.closingMenu = false;
    }
};

onMounted(() => {

    watch(() => store.closingMenu, handleStoreChange);

    window.addEventListener('resize', () => {
        if (window.innerWidth > 560) {
            closeMenu();
        }
    });
});

</script>

<template>
    <header>
        <nav class="navbar">
            <div class="navbar_wrapper">
                <!-- Header -->
                <div class="main_header">
                    <RouterLink to="/backoffice/console/product/trash" class="btn_custom btn_cust_light trsh_link_btn">
                        <img src="@/assets/icons/buttons/trash_light.svg" alt="cestino" loading="lazy" />
                        Cestino
                    </RouterLink>
                    <CustomSearchBar class="custm" />
                </div>

                <!-- Offcanvas trigger -->
                <button class="navbar_toggler" type="button" @click.prevent="openMenu()">
                    <img class="navbar_toggler_icon" src="@/assets/icons/aside/list.svg" loading="eager" />
                </button>

                <!-- Offcanvas Aside Menu -->
                <div class="offcanvas_c offcanvas_end" :class="{ 'show': isOpen, 'hiding': isClosing }"
                    id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
                    <div class="offcanvas_header">
                        <h5 class="offcanvas_title" id="offcanvasNavbarLabel">
                            <RouterLink :to="store.baseBoPath" @click="openMenu()">
                                <img src="@/assets/logo.svg" title="Torna alla dashboard" alt="Shop manager business logo"
                                    aria-roledescription="logo" class="mob_logo_aside" />
                            </RouterLink>
                        </h5>

                        <button type="button" class="btn_close" @click="closeMenu()" alt="close">
                            <img src="@/assets/icons/buttons/x-lg.svg" alt="close" loading="eager" />
                        </button>
                    </div>

                    <AsideBar :head="false" />
                </div>
            </div>
        </nav>
    </header>
</template>

<style lang="scss" scoped>
.btn_close {
    background: none;
    cursor: pointer;
    border: none;

    &:hover {
        opacity: .7;
        transform: scale(1.1);
    }

    img {
        width: 1.65rem;
        height: 1.65rem;

    }
}

header {
    width: 100%;
    box-shadow: 0 0 10px -5px #808080;

    .navbar {
        position: relative;
        background-color: var(--secondary-color);
        box-shadow: 0 0 23px -8px #808080;
        padding: .45rem;

        .navbar_wrapper {
            @extend %fx_between_center;
            gap: .75rem;
            flex-wrap: nowrap;
        }
    }

    .navbar_toggler {
        padding: .25rem .75rem;
        font-size: 1.25rem;
        border: .1rem solid #ffffff;
        border-radius: var(--border_radius);
        background-color: transparent;
        color: #ffffff;
        transition: all .2s linear;

        &:hover .navbar_toggler_icon {
            filter: invert(0);
        }

        &:hover {
            border-color: var(--seondary-color-dark);
            background-color: white;
            color: var(--secondary-color-dark);
        }

        .navbar_toggler_icon {
            display: inline-block;
            width: 1.5em;
            height: 1.5em;
            filter: invert(1);
            vertical-align: middle;
            transition: all 0.15s ease-in-out;
        }

        .trsh_link_btn img {
            width: 1.25rem;
            height: 1.25rem;
        }
    }

    .main_header {
        @extend %fx_around_center;
        width: unset;
        gap: .75rem;

        @media screen and (min-width: 560px) {
            width: 100%;
        }

        .custm {
            display: none;

            @media screen and (min-width: 560px) {
                display: flex;
            }
        }
    }

    .offcanvas_c {
        @include flexmin(stretch, stretch, column);
        width: 100%;
        max-width: 350px;
        position: fixed;
        top: 0;
        bottom: 0;
        right: 0;
        visibility: hidden;
        outline: 0;
        background-clip: padding-box;
        background-color: #ffffff;
        transition: visibility 0s, transform 0.3s ease-in-out;
        transform: translateX(100%);
        box-shadow: 0 0 15px -3px rgba(185, 185, 185, 0.702);
        z-index: var(--z_4);

        &.show {
            visibility: visible;
            transform: translateX(0);
        }

        &.hiding {
            transform: translateX(100%);
        }

        .offcanvas_header {
            position: relative;
            @extend %fx_between_center;
            padding: 1rem;
            box-shadow: 0 -3px 9px -2px #000000;
            background-color: #e3e3e3;
            z-index: var(--z_5);

            .offcanvas_title {
                margin-bottom: 0;
                line-height: 1.5rem;

                .mob_logo_aside {
                    width: 90px;
                    height: 50px;

                    @media screen and (min-width: 900px) {
                        width: 120px;
                        height: 65px;
                    }
                }
            }
        }
    }

    ::-webkit-scrollbar {
        width: 3px !important;
    }
}
</style>
