<script setup lang="ts">

import exclamation from '@/assets/icons/alert/exclamation.svg';
import success from '@/assets/icons/alert/success.svg';
import info from '@/assets/icons/buttons/details.svg';

import type { ErrorObj } from '@/types/ErrorObj';

interface Props {
    errors: ErrorObj[];
    type: string;
}
const props = withDefaults(defineProps<Props>(), {
    errors: () => [],
    type: ''
});

const images: Record<string, string> = {
    exclamation,
    success,
    info
};

function setImage(type: string | undefined): string {
    return images[type ?? 'info'] ?? images['info'];
}


// ************ Hide Toast ************
const emit = defineEmits<{ (e: 'remove-toast', index: number): void }>();

function removeToast(index: number): void {
    if (props.errors.length > 0)
        emit('remove-toast', index);

}
</script>

<template>
    <ul class="tcl" v-if="props.errors.length > 0">
        <transition name="toast" v-for="(err, index) in props.errors" :key="index">
            <li class="tc" :class="`t_${props.errors.length > 0 ? props.type : err.level}`" v-if="err">
                <div class="tcc" role="alert">
                    <div class="tbw">
                        <div class="ti">
                            <img :src="setImage(props.errors.length > 0 ? props.type : err.level)" alt="alert icon"
                                loading="eager" />
                        </div>
                        <div class="tb">
                            <p class="tt">
                                {{ (props.errors.length > 0 ? props.type : err.level) === 'error' ? 'Errore' : '' }}
                                {{ (props.errors.length > 0 ? props.type : err.level) === 'success' ? 'Successo' : '' }}
                                {{ (props.errors.length > 0 ? props.type : err.level) === 'info' ? 'Info' : '' }}
                            </p>
                            <p class="tm">{{ err.message }}</p>
                        </div>
                        <div class="ctb" @click.prevent="removeToast(index)">
                            <img src="@/assets/icons/buttons/x.svg" alt="close" loading="lazy" />
                        </div>
                    </div>
                </div>
            </li>
        </transition>
    </ul>
</template>

<style lang="scss" scoped>
.tcl {
    @include flexmin(end, end, column, null, .5rem);
    position: fixed;
    right: .5rem;
    bottom: .5rem;
    margin: auto;
    margin-bottom: .5rem;
    z-index: 6;

    .tc {
        width: 100%;
        pointer-events: none;
        font-weight: bold;

        @media screen and (min-width: 908px) {
            top: unset;
            transform: none;
            right: 3rem;
        }

        .tcc {
            max-width: 95%;
            border-radius: 6px;
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

            .tbw {
                display: flex;
            }

            .ti {
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

            .tb {
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

                .tt {
                    font-weight: bold;
                    text-align: start;
                    font-size: 1rem;
                    border-bottom: .4px solid black;
                    margin-bottom: .35rem;
                }

                .tm {
                    color: #000;
                    overflow-y: auto;
                    height: 100%;
                    text-align: start;
                    margin: 0;
                }
            }

            .ctb {
                align-content: center;
                text-align: center;
                max-width: 50px;
                background-color: #ebebeb;
                cursor: pointer;
                transition: all 0.3s linear;

                &:hover {
                    background-color: #a91826;
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
.t_error {
    .tcc {
        border-color: #a31220;
        color: #a31220;

        .ti {
            background-color: #a91826;
        }
    }
}

.t_info {
    .tcc {
        border-color: #a31220;
        color: #a31220;

        .ti {
            background-color: #f9d7da;
        }
    }
}

.t_success {
    .tcc {
        border-color: #026e02;
        color: #026e02;

        .ti {
            background-color: #04ac04;
        }
    }
}
</style>
