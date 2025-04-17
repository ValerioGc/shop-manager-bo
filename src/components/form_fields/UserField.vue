<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import apiClient from "@/axios";
import { boStore } from "@/stores/boStore";
import { useBoUserStore } from "@/stores/boUserStore";

import InputText from "@/components/form_fields/partials/InputText.vue";
import InputImage from "@/components/form_fields/partials/InputImage.vue";
import TextPlaceholder from "@/components/utils_components/placeholders/TextPlaceholder.vue";
import CommonSpinner from "@/components/utils_components/placeholders/CommonSpinner.vue";
import type { UserProfile } from "@/types/entity/UserProfile";

interface Props {
    mode: string;
    id: string;
}

const props = defineProps<Props>();

const userStore = useBoUserStore();
const store = boStore();


const user = ref<UserProfile>({
    id: null,
    name: "",
    email: "",
    image: null,
    image_url: "",
    password: "",
    password_confirmation: "",
    removed_image: false,
});

const changePassword = ref<boolean>(false);

/**
 * Get user info from the server and set the user object
 */
async function getUserInfo(): Promise<void> {
    store.apiStatus = "loading";
    await apiClient.get("/auth/user-details")
        .then((res) => {
            user.value = { ...user.value, ...res.data };

            if (!userStore.loggedInUser.img) {
                userStore.loggedInUser.img = user.value.image_url;
            }

            if (store.debug) console.log(user.value);

            store.apiStatus = "success";
        });
}

// ************ IMAGE Management ************
const onFileChange = (file: File | null): void => {
    if (file) {
        user.value.image = file;
        user.value.image_url = URL.createObjectURL(file);
        user.value.removed_image = false;
    } else {
        user.value.image = null;
        user.value.image_url = '';
        user.value.removed_image = true;
    }
};

// ************ VALIDATION ************
watch(() => changePassword.value, () => {
    validateField();
});

function resetUser(): void {
    user.value = {
        id: null,
        name: "",
        email: "",
        image_url: "",
        image: null,
        password: "",
        password_confirmation: "",
        removed_image: false,
    };
}

// ********** <Validation> **********
const emit = defineEmits<{ (e: 'validate', isValid: boolean): void }>();
const validationErrors = ref<Record<string, string>>({});

const validateField = (): boolean => {
    store.setSelectedItem(user.value);
    const fieldsToValidate = [
        'name',
        'email',
        props.mode === 'new' ? 'password' : changePassword.value ? 'password' : '',
        props.mode === 'new' ? 'password_confirmation' : changePassword.value ? 'password_confirmation' : ''
    ].filter(field => field !== '');
    const { isValid, validationErrors: errors } = store.validateFields(user.value, fieldsToValidate);
    validationErrors.value = errors;
    return isValid;
};

watch(user, (newVal) => {
    store.setSelectedItem(newVal);
    if (props.mode === 'edit' || props.mode === 'new') {
        const isValid = validateField();
        emit('validate', isValid);
    }
}, { deep: true });

watch(() => props.mode, (newVal) => {
    if (newVal === 'new') {
        resetUser();
    } else if (newVal === 'edit') {
        getUserInfo();
    }
});

onMounted(() => {
    if (props.mode === 'edit' || props.mode === 'read')
        getUserInfo();
    else if (props.mode === 'new')
        store.setSelectedItem(user.value);
});
</script>

<template>

    <!-- Read Mode -->
    <div v-if="props.mode === 'read'">
        <div class="edit_btn_container">
            <RouterLink class="btn_custom btn_cust_primary"
                :to="store.apiStatus !== 'loading' ? '/backoffice/console/user/profile/edit' : ''"
                :class="store.apiStatus === 'loading' ? 'disabled' : ''">
                <img src="@/assets/icons/buttons/edit.svg" alt="edit" loading="lazy" />
                <span class="lavl1">
                    <span>Modifica </span>
                    <span class="lavl2">Dati</span>
                </span>
            </RouterLink>
        </div>

        <div class="profile_details_container">
            <div class="image_container">
                <CommonSpinner :mode="'spinner'" v-if="store.apiStatus === 'loading'" />
                <img v-else-if="user.image_url" :src="user.image_url" alt="user image" class="profile_image" />
                <img v-else src="@/assets/icons/user/plUsr.svg" alt="user image" />
            </div>

            <ul class="profile_details">
                <li>
                    <p class="form_label read_label">Nome</p>
                    <p v-if="user.name">{{ user.name }}</p>
                    <TextPlaceholder v-else-if="store.apiStatus === 'loading'" :mode="'block'" alig="0" />
                </li>
                <li>
                    <p class="form_label read_label">Email</p>
                    <p v-if="user.email">{{ user.email }}</p>
                    <TextPlaceholder v-else-if="store.apiStatus === 'loading'" mode="block" alig="0" />
                </li>
                <li>
                    <p class="form_label read_label">Ruolo:</p>
                    <p v-if="user.email && user.name">
                        Admin
                    </p>
                    <TextPlaceholder v-else-if="store.apiStatus === 'loading'" mode="block" />
                </li>
            </ul>
        </div>
    </div>

    <!-- Edit/New Mode -->
    <div v-else>
        <div>
            <InputImage v-model="user.image" label="Immagine" name="image" :url="user.image_url" :remove="true"
                @update:modelValue="onFileChange" />
        </div>

        <div class="form_section_container">
            <InputText label="Nome" name="Nome" v-model="user.name" :class="validationErrors.name ? 'error' : ''"
                class="form_partial_container" />
            <span v-if="validationErrors.name" class="error_message">{{ validationErrors.name }}</span>

        </div>

        <div class="form_section_container">
            <InputText label="Email" name="email" v-model="user.email" :class="validationErrors.email ? 'error' : ''"
                class="form_partial_container" />
            <span v-if="validationErrors.email" class="error_message">{{ validationErrors.email }}</span>
        </div>

        <div class="select_pw_chg form_switch" v-if="props.mode === 'edit'">
            <div class="form_check_label">
                Cambia Password
            </div>
            <input type="checkbox" v-model="changePassword" class="form_check_input" />
        </div>

        <div v-if="changePassword || props.mode === 'new'">
            <div class="form_section_container">
                <InputText name="Password" label="Password" v-model="user.password"
                    :class="validationErrors.password ? 'error' : ''" class="form_partial_container" />
                <span v-if="validationErrors.password" class="error_message">{{ validationErrors.password }}</span>
            </div>

            <div class="form_section_container">
                <InputText name="Conferma password" label="Conferma Password" v-model="user.password_confirmation"
                    :class="validationErrors.password_confirmation ? 'error' : ''" class="form_partial_container" />
                <span v-if="validationErrors.password_confirmation" class="error_message">{{
                    validationErrors.password_confirmation }}</span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.profile_details_header {
    @extend %fx_between_center;

    .top_btn_container {
        text-align: right;
        width: 50%;

        button {

            span {
                margin-left: .35rem;
            }

            img {
                width: 20px;
                height: 20px;
            }
        }
    }
}

.frm {
    display: block;
    margin-top: .75rem;
    padding: 1.25rem .25rem;

    .edit_btn_container {
        text-align: right;
        padding: 0 0 .25rem;
    }

    .form_label {
        margin-right: 1rem;
        font-size: 1.05rem;
    }

    .form_section_container {
        margin: auto;
        width: 80%;

        @include breakpoint('smp') {
            width: 70%;
        }

        @include breakpoint('md') {
            width: 65%;
        }

        @include breakpoint('lg') {
            width: 55%;
        }

        @include breakpoint('xl') {
            width: 50%;
        }
    }

    .select_pw_chg {
        @extend %fx_between_center;
        @extend .form_section_container;
        margin-top: 1.5rem !important;
        margin-bottom: 1rem !important;
        padding: .75rem;
        background-color: white;
        color: var(--secondary-color);
        border-radius: 6px;
        border: solid 1px var(--secondary-color);
    }

    .submit_btn_container {
        text-align: center;

        .btn_custom {
            margin: 1rem 0;
            margin-top: 1.6rem;

            img {
                margin-right: .35rem;
                width: 24px;
                height: 24px;
            }
        }
    }

    .form_partial_container {
        margin: .5rem 0;

        textarea,
        input {
            border: .2px solid transparent;
        }
    }

    .profile_details_container {
        @extend %full_wh;
        @include flexmin(center, center, column, null, 1rem);
        padding: .75rem 1rem;

        @include breakpoint('smp') {
            justify-content: center;
            align-items: start;
            flex-direction: row;
            gap: 2rem;
        }

        .image_container {
            background-color: #cdcdcd;
            width: 230px;
            height: 230px;
            border-radius: 6px;
            border: solid 0.2px rgb(157, 157, 157);

            img {
                @extend %full_wh;
                object-fit: cover;
                border-radius: 6px;
            }

            .spinner-border {
                color: var(--secondary-color-light);
            }

            .spinner_container {
                width: 100%;
                height: 230px;
                display: block;
                border-radius: 6px;
                background-color: #9b9b9bc1;
                align-content: center;
                text-align: center;
            }
        }

        .profile_details {
            height: 100%;
            width: 60%;

            @include flexmin(center, stretch, column, null, 1rem);
            padding: 0;

            @include breakpoint('smp') {
                padding: .75rem 1rem .75rem 0;
            }

            li {
                width: 100%;
                display: block;

                @include breakpoint('smp') {
                    padding-left: 1rem;
                }

                h5 {
                    padding-right: 1rem;
                }

                p {
                    padding-top: .65rem;
                }
            }

            li:last-child {
                align-items: center;
                display: flex;

                p {
                    padding-top: 0;
                }
            }
        }
    }
}

.btn_custom,
a {
    img {
        filter: invert(1);
    }
}

.btn_custom {
    padding: .5rem .75rem;
}

.lavl1 {
    display: none;
    margin-left: .65rem;

    @include breakpoint('sm') {
        display: inline-block;
    }
}

.lavl2 {
    display: none;

    @include breakpoint('smp') {
        display: inline-block;
    }
}

.disabled {
    opacity: .5;
    cursor: wait;

    &:hover {
        transform: none !important;
        filter: none !important;
    }
}
</style>
