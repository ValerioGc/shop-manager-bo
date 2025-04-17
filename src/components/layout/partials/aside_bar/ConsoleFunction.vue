<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { consoleFunctionsExt } from '@/config/consoleFunctions.ts';

import CustomSearchBar from "@/components/layout/layout_elements/CustomSearchBar.vue";
// *************** ICONS ***************
import chevron_down from '@/assets/icons/arrows/chevron-down.svg';
import chevron_up from '@/assets/icons/arrows/chevron-up.svg';
import settings from '@/assets/icons/aside/settings.svg';
import product from '@/assets/icons/aside/product.svg';
import categories from '@/assets/icons/aside/categories.svg';
import category from '@/assets/icons/aside/category.svg';
import condition from '@/assets/icons/aside/condition.svg';
import faq from '@/assets/icons/aside/faqs.svg';
import contact from '@/assets/icons/aside/contact.svg';
import list from '@/assets/icons/aside/list.svg';
import plus from '@/assets/icons/aside/plus.svg';
import trash from '@/assets/icons/buttons/trash.svg';
import show_add from '@/assets/icons/aside/show-add.svg';
import link_add from '@/assets/icons/aside/link-add.svg';
import product_add from '@/assets/icons/aside/product-add.svg';
import product_list from '@/assets/icons/aside/product-list.svg';
import show from '@/assets/icons/aside/show.svg';
import options from '@/assets/icons/aside/options.svg';
import draft from '@/assets/icons/aside/draft.svg';
import uncat from '@/assets/icons/aside/uncat.svg';

import type ConsoleFunction from '@/config/consoleFunctions.ts';

const route = useRoute();
const router = useRouter();
const consoleFunctions = consoleFunctionsExt as Array<ConsoleFunction>;

//


/**
 * Icons management function
 * @param icon {string} - Icon name
 */
function manageIcon(icon: string) {
    const iconMap: Record<string, string> = {
        settings,
        product,
        categories,
        category,
        condition,
        faq,
        contact,
        list,
        plus,
        trash,
        show_add,
        link_add,
        product_add,
        product_list,
        show,
        options,
        draft,
        uncat
    };
    return iconMap[icon] || icon;
}

// Stato per gestire i dropdown aperti
const openDropdowns = ref<Record<string, boolean>>({});

/**
 * Function to select a route and navigate to it if enabled
 * @param to - Route to navigate to
 * @param enabled - Route enabled
 */
function selectRoute(to: string | Record<string, string>, enabled: boolean): void {
    if (enabled)
        router.push(to);
}

/**
 * Function to check if a route is active
 * @param to - Route to check
 */
function isRouteActive(to: string): boolean {
    return route.path === to;
}

/**
 * Function to toggle the dropdown and close other open dropdowns
 * @param index - Index of the dropdown to toggle
 */
function toggleDropdown(index: string | number): void {
    openDropdowns.value[index] = !openDropdowns.value[index];
}

/**
 * Function to check if a dropdown should be open
 * @param index - Index of the dropdown
 * @param fnc - Function object
 */
function shouldDropdownBeOpen(index: string | number, fnc: ConsoleFunction): boolean {
    const childIsActive = fnc.routes && fnc.routes.some(subRoute =>
        subRoute.routes
            ? subRoute.routes.some(grandChildRoute => isRouteActive(grandChildRoute.to as string)) // Livello 3
            : isRouteActive(subRoute.to as string) // Livello 2
    );

    return openDropdowns.value[index] as boolean || childIsActive as boolean;
}

/**
 * Aggiorna lo stato dei dropdown quando cambia la route
 */
function syncDropdownsWithRoute(): void {
    const newDropdowns: Record<string, boolean> = {};

    consoleFunctions.forEach((fnc, index) => {
        const childIsActive = fnc.routes && fnc.routes.some(subRoute =>
            subRoute.routes
                ? subRoute.routes.some(grandChildRoute => isRouteActive(grandChildRoute.to as string))
                : isRouteActive(subRoute.to as string)
        );

        if (childIsActive)
            newDropdowns[index] = true;

        fnc.routes?.forEach((subRoute, subIndex) => {
            const subChildIsActive = subRoute.routes && subRoute.routes.some(grandChildRoute => isRouteActive(grandChildRoute.to as string));
            const subKey = `${index}-${subIndex}`;

            if (subChildIsActive) {
                newDropdowns[subKey] = true;
            }
        });
    });

    // Sincronizza lo stato di openDropdowns
    openDropdowns.value = newDropdowns;
}

// Aggiorna i dropdown quando cambia la rotta
watch(route, syncDropdownsWithRoute, { immediate: true });
</script>

<template>
    <ul class="console_function_container drop">

        <!-- Search Bar -->
        <li class="multi_src_bar">
            <CustomSearchBar />
        </li>

        <li v-for="(fnc, index) in consoleFunctions" :key="index" class="console_item_container"
            :class="{ 'disable': !fnc.active, 'act': shouldDropdownBeOpen(index, fnc) }" :id="`menu-item-${index}`">

            <!-- ROUTE LINK -->
            <RouterLink v-if="!fnc.routes" :to="fnc.active ? fnc.to ?? '#' : '#'" class="route_link"
                :class="{ 'active': isRouteActive(fnc.to as string) && fnc.active }">
                <span class="item_content">
                    <img :src="manageIcon(fnc.icon)" alt="icon" class="function_icon">
                    <span :title="fnc.sectionTitle">{{ fnc.sectionTitle }}</span>
                </span>
            </RouterLink>

            <!--  TOGGLE LEVEL 2 SUBLEVEL  -->
            <a v-else href="#" class="dropdown_toggle" @click.prevent="toggleDropdown(index)">
                <span class="item_content">
                    <img :src="manageIcon(fnc.icon)" alt="function dropdown" class="function_icon">
                    <span :title="fnc.sectionTitle">{{ fnc.sectionTitle }}</span>
                </span>
                <img :src="shouldDropdownBeOpen(index, fnc) ? chevron_up : chevron_down" alt="arrow" class="arrow" />
            </a>

            <!-- LEVEL 2 -->
            <transition name="slide-fade">
                <ul v-if="shouldDropdownBeOpen(index, fnc)" class="drop second_level">
                    <li v-for="(es, id) in fnc.routes" :key="`submenu-${id}`" class="sub_nav"
                        :class="{ 'active_2': es.routes ? es.routes.some(sub => isRouteActive(sub.to as string)) : isRouteActive(es.to as string) }">

                        <!-- ROUTE LINK LEVEL 2 -->
                        <RouterLink v-if="!es.routes" :to="es.active && es.to ? es.to : '#'" class="route_link"
                            :class="{ active: isRouteActive(es.to as string) && es.active }"
                            @click.prevent="selectRoute(es.to as string, es.active)">
                            <span class="item_content">
                                <img :src="manageIcon(es.icon)" alt="function icon" class="function_icon cat_2">
                                <span :title="es.sectionTitle">{{ es.label || es.sectionTitle }}</span>
                            </span>
                        </RouterLink>

                        <!-- NESTED DROPDOWN LEVEL 3 -->
                        <a v-else href="#" class="dropdown_toggle" @click.prevent="toggleDropdown(`${index}-${id}`)">
                            <span class="item_content">
                                <img :src="manageIcon(es.icon)" alt="function dropdown" class="function_icon cat_3">
                                <span :title="es.sectionTitle">{{ es.sectionTitle }}</span>
                            </span>
                            <img :src="shouldDropdownBeOpen(`${index}-${id}`, es) ? chevron_up : chevron_down"
                                alt="arrow" class="arrow" />
                        </a>

                        <!-- LEVEL 3 -->
                        <transition name="slide-fade">
                            <ul v-if="shouldDropdownBeOpen(`${index}-${id}`, es)" class="drop last_level">
                                <li v-for="(ess, sid) in es.routes" :key="`subsubmenu-${sid}`" class="sub_nav">
                                    <RouterLink :to="(ess.to as string)" class="route_link"
                                        :class="{ 'active': isRouteActive(ess.to as string) }"
                                        @click.prevent="selectRoute(ess.to as string, ess.active)">
                                        <span class="item_content">
                                            <img :src="manageIcon(ess.icon)" alt="function icon"
                                                class="function_icon cat_3">
                                            <span :title="ess.label">{{ ess.label }}</span>
                                        </span>
                                    </RouterLink>
                                </li>
                            </ul>
                        </transition>
                    </li>
                </ul>
            </transition>
        </li>
    </ul>
</template>


<style lang="scss" scoped>
.active {
    background-color: var(--secondary-color);
    color: white;

    img {
        filter: invert(1);
    }
}

.second_level {
    .item_content {
        margin-left: .5rem;
    }
}

.last_level {
    .item_content {
        margin-left: 1rem;
    }
}

.console_function_container {
    overflow-x: hidden;
    overflow-y: auto;
    @extend %full_wh;
    margin-bottom: 0;
    padding: 0 !important;
    list-style: none;
    background-color: #f3f3f3;
    box-shadow: 0px 0px 4px #cbcbcb94 inset;

    &::-webkit-scrollbar {
        width: 3px;
        background-color: #F5F5F5;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #003aa6f0;
    }

    .multi_src_bar {
        width: 100%;
        padding: 0 1rem;
        margin: 0 auto;
        padding: 1.25rem .5rem;
        border-bottom: 1px solid #919191d8;
        position: relative;

        @media screen and (min-width: 560px) {
            display: none;
        }
    }

    .console_item_container {
        width: 100%;
        position: relative;
        border-bottom: 0.2px solid #444343;

        &:hover:not(.act) {
            background-color: #e1e1e1;
        }

        &.loading {
            cursor: wait;
        }

        img {
            width: 1rem;
            height: 1rem;
        }

        a {
            text-decoration: none;
        }

        .dropdown_toggle,
        .route_link {
            @extend %fx_between_center;
            padding: .5rem .75rem;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .item_content {
            display: flex;
            align-items: center;
            gap: .75rem;
            max-width: 90%;

            span {
                text-overflow: ellipsis;
                overflow: hidden;
            }

            .function_icon {
                display: inline-block;
                width: 1.6rem;
                height: 1.6rem;
                margin: .25rem 0;

                &.cat_2 {
                    width: 1.34rem;
                    height: 1.34rem;
                }

                &.cat_3 {
                    width: 1.25rem;
                    height: 1.25rem;
                }
            }

            .link-icon {
                color: #010e62;
            }

        }


        .drop {
            padding: 0;
            list-style-type: none;
            background-color: #f5faff;
            box-shadow: 0 0 4px #cbcbcb94 inset;

            .sub_nav {
                border-bottom: .2px solid #444343;

                &:hover {
                    background-color: #d7e8fd;
                }
            }

            .sub_nav:last-child {
                border-bottom: none;
            }
        }
    }
}

// ********* Animation *********
.slide-fade-enter-active,
.slide-fade-leave-active {
    overflow: hidden;
    animation: slide 0.4s ease-in;
}

.slide-fade-enter,
.slide-fade-leave-to {
    animation: slide 0.3s ease-in reverse;
}

@keyframes slide {
    0% {
        max-height: 0;
        opacity: 0;
    }

    99% {
        max-height: 100px;
        opacity: 1;
    }

    100% {
        max-height: 100%;
    }
}
</style>
