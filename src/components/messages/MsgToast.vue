<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { boStore } from "@/stores/boStore";
import exclamation from '@/assets/icons/alert/exclamation.svg';
import success from '@/assets/icons/alert/success.svg';
import info from '@/assets/icons/buttons/details.svg';

const store = boStore();

interface Props {
    errors: any[];
    type: string;
}

const props = withDefaults(defineProps<Props>(), {
    errors: () => [],
    type: ''
});

const images: Record<string, any> = {
    exclamation,
    success,
    info
};

function setImage(type: string): string {
    if (images[type] === undefined) return images['info'];
    return images[type];
}

// ************ Hide Toast ************
const emit = defineEmits<{ (e: 'remove-toast', index: number): void }>();

function removeToast(index: number): void {
    if (props.errors.length > 0) {
        emit('remove-toast', index);
    } else {
        store.handleRemoveToast(index);
    }
}
</script>

<template>
    <ul class="toast_container_list" v-if="store.notifications.length > 0 || props.errors.length > 0">
        <transition name="toast" v-for="(err, index) in (props.errors.length > 0 ? props.errors : store.notifications)"
            :key="index">
            <li class="toast_container" :class="`toast_${props.errors.length > 0 ? props.type : err.level}`" v-if="err">
                <div class="toast_custom" role="alert">
                    <div class="toast_body_wrapper">
                        <div class="toast_icon">
                            <img :src="setImage(props.errors.length > 0 ? props.type : err.level)" alt="alert icon"
                                loading="eager" />
                        </div>
                        <div class="toast_body">
                            <p class="toast_title">
                                {{ (props.errors.length > 0 ? props.type : err.level) === 'error' ? 'Errore' : '' }}
                                {{ (props.errors.length > 0 ? props.type : err.level) === 'success' ? 'Successo' : '' }}
                                {{ (props.errors.length > 0 ? props.type : err.level) === 'info' ? 'Info' : '' }}
                            </p>
                            <p class="toast_msg">{{ err.message }}</p>
                        </div>
                        <div class="close_toast_btn" @click.prevent="removeToast(index)">
                            <img src="@/assets/icons/buttons/x.svg" alt="close" loading="lazy" />
                        </div>
                    </div>
                </div>
            </li>
        </transition>
    </ul>
</template>

<style lang="scss" scoped>
.toast_container_list {
    @include flexmin(end, end, column, null, .5rem);
    position: fixed;
    right: .5rem;
    bottom: .5rem;
    margin: auto;
    margin-bottom: .5rem;
    z-index: var(--z_6);

    .toast_container {
        width: 100%;
        pointer-events: none;
        font-weight: bold;

        @media screen and (min-width: 908px) {
            top: unset;
            transform: none;
            right: 3rem;
        }

        .toast_custom {
            max-width: 95%;
            border-radius: var(--border_radius);
            box-shadow: 0 0 6px -2px;
            font-size: 0.875rem;
            pointer-events: auto;
            border: solid 1.5px;
            background-clip: padding-box;
            margin: 0 auto;
            background-color: rgb(244, 244, 244);

            @media screen and (min-width: 600px) {
                max-width: 330px;
            }

            @media screen and (min-width: 900px) {
                max-width: 400px;
            }

            .toast_body_wrapper {
                display: flex;
            }

            .toast_icon {
                text-align: center;
                align-content: center;
                border-top-left-radius: 4px;
                border-bottom-left-radius: 4px;
                min-width: 60px;
                min-height: 60px;
                border-right: solid 1.5px;
                border-color: inherit;

                img {
                    width: 27px;
                    height: 27px;
                    filter: invert(1);
                }
            }

            .toast_body {
                position: relative;
                color: inherit;
                overflow: auto;
                box-shadow: inset -4px 0px 14px -14px;
                align-content: center;
                padding: 0.5rem 0;
                word-wrap: break-word;
                width: 100%;
                max-height: 140px;
                overflow: hidden;

                p {
                    padding: 0 .5rem;
                }

                .toast_title {
                    font-weight: bold;
                    text-align: start;
                    font-size: 1rem;
                    border-bottom: .4px solid black;
                    margin-bottom: .35rem;
                }

                .toast_msg {
                    color: #000;
                    overflow-y: auto;
                    height: 100%;
                    text-align: start;
                    margin: 0;
                }
            }

            .close_toast_btn {
                align-content: center;
                text-align: center;
                max-width: 50px;
                background-color: #ebebeb;
                cursor: pointer;
                transition: all 0.3s linear;

                &:hover {
                    background-color: var(--danger_color);
                }

                &:hover img {
                    filter: invert(1);
                }

                img {
                    filter: opacity(0.6);
                    width: 2rem;
                    height: 2rem;
                }
            }
        }
    }
}

// ************ Toast Color Types ************
.toast_error {
    .toast_custom {
        border-color: var(--danger_color_dark);
        color: var(--danger_color_dark);

        .toast_icon {
            background-color: var(--danger_color);
        }
    }
}

.toast_info {
    .toast_custom {
        border-color: var(--secondary-color-dark);
        color: var(--secondary-color-dark);

        .toast_icon {
            background-color: var(--secondary-color-light);
        }
    }
}

.toast_success {
    .toast_custom {
        border-color: #026e02;
        color: #026e02;

        .toast_icon {
            background-color: #04ac04;
        }
    }
}
</style>
