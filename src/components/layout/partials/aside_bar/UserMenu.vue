<script setup lang="ts">

import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useBoUserStore } from "@/stores/boUserStore.js";
import { boStore } from "@/stores/boStore.js";

import caret_down from "@/assets/icons/arrows/caret-down.svg";
import caret_up from "@/assets/icons/arrows/caret-up.svg";

const router = useRouter();
const store = boStore();
const userStore = useBoUserStore();

const visible = ref<boolean>(false);

const toggle: () => void = () => {
    visible.value = !visible.value;
};

/**
 * Close dropdown when clicking outside the dropdown
 * @param {Event} event 
 */
function handleClickOutside(event: Event) {
    if (!(event.target as Element).closest('.usr_drop')) {
        visible.value = false;
    }
}

/**
 * Logout user and redirect to login page
 */
async function appLogout() {
    userStore.loading = true;
    userStore.loadingType = 'logout';

    await userStore.logout()
        .then(() => {
            userStore.loading = false;
            userStore.loadingType = '';
            router.push('/backoffice/login');
        })
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});


</script>

<template>
    <div class="usr_drop" @mouseleave="toggle()">

        <!-- Dropdown toggle -->
        <a href="#" @click.prevent="toggle()" @mouseenter="toggle()" class="dropdown_toggle">

            <!-- User photo -->
            <img v-if="userStore.loggedInUser.img" :src="userStore.loggedInUser.img" alt="User photo"
                class="user_image" />
            <img v-else src="@/assets/icons/user/plUsr.svg" alt="User photo" class="user_image" />

            <!-- Username -->
            <span class="user_name">{{ userStore.loggedInUser.username }}</span>

            <img class="caret_icon" :src="visible ? caret_up : caret_down" alt="dropdown direction" loading="eager"  />
        </a>

        <!-- Dropdown menu -->
        <ul class="user_dropdown dropdown_menu" v-if="visible">
            <li :class="{ 'dis_cont': store.apiStatus === 'loading' }">
                <RouterLink class="dropdown_item" to="/backoffice/console/user/profile"
                    :class="{ 'dis': store.apiStatus === 'loading' }">
                    <img src="@/assets/icons/user/person-gear.svg" alt="profile" loading="eager" />
                    <span>Profilo</span>
                </RouterLink>
            </li>
            <li class="dr_cont">
                <hr class="dropdown_divider">
            </li>
            <li :class="{ 'dis_cont': store.apiStatus === 'loading' }">
                <a href="#" class="dropdown_item" :class="{ 'dis': store.apiStatus === 'loading' }"
                    @click.prevent="appLogout()">
                    <img src="@/assets/icons/user/logout.svg" alt="logout" loading="eager" />
                    <span> Logout</span>
                </a>
            </li>
        </ul>
    </div>
</template>

<style lang="scss" scoped>

@use "@/styles/partials/_dropdown.scss";

.dropdown_toggle {
    @extend %fx_between_center;
    gap: .35rem;

    &::after {
        content: none;
    }

    .user_image {
        width: 32px;
        height: 32px;
        margin-left: 0;
        margin-right: .25rem;
        border-radius: 50%;
        object-fit: cover;
    }

    .user_name {
        vertical-align: middle;
        text-transform: capitalize;
        font-size: 1.1rem;
    }
}

.usr_drop {
    @extend %fx_center;
    position: relative;
    width: 100%;
    padding: .75rem 0;
    border-top: .2px solid #625f5f;
    background-color: #e3e3e3;

    
    .caret_icon {
        width: 1.2rem;
        height: 1.2rem;
    }

    .user_dropdown {
        padding: 0;
        top: unset;
        bottom: 3.2rem;
        box-shadow: 0 0 5px #a1a1a1cd;

        &.show {
            display: block;
        }

        img {
            width: 24px;
            height: 24px;
            margin-right: .35rem;
        }

        .dis_cont {
            cursor: wait;

            .dis {
                pointer-events: none;
                opacity: .5;
            }
        }

        .dr_cont {
            padding: 0;

            .dropdown_divider {
                margin: 0;
                overflow: hidden;
                border-top: .5px solid #969696;
                opacity: .55;
            }
        }

        li {
            padding: .25rem 0;
            border-radius: 6px;

            span,
            img {
                vertical-align: middle;
            }

            &:first-child {
                border-radius: 6px 6px 0 0;
            }

            &:last-child {
                border-radius: 0 0 6px 6px;
            }

            &:hover {
                background-color: var(--secondary-color-light);
                color: #ffffff !important;

                img {
                    filter: invert(1);
                }
            }
        }
    }
}
</style>
