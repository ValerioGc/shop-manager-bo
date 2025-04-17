<script setup lang="ts">
import { onMounted, ref } from "vue";
import { boStore } from "@/stores/boStore";

import MainLayout from "@/components/layout/MainLayout.vue";
import BoSectionTitle from "@/components/layout/layout_elements/BoSectionTitle.vue";
import TextPlaceholder from "@/components/utils_components/placeholders/TextPlaceholder.vue";
import CommonSpinner from "@/components/utils_components/placeholders/CommonSpinner.vue";
import ResultPlaceholder from "@/components/utils_components/placeholders/ResultsPlaceholder.vue";

import close_img from "@/assets/icons/buttons/x-lg.svg";
import down_img from "@/assets/icons/arrows/caret-down.svg";
import type { Product } from "@/types/entity/Product";

const store = boStore();

const products = ref<Product[]>([]);

/**
 * Get the latest products from the API
 * @returns {void}
 */
async function getProducts(): Promise<void> {
    store.apiDispatcher(
        '/product/paginate?page=1&limit=7&orderBy=updated_at&order=desc',
        "GET",
        "product",
        {}
    ).then(response => {
        products.value = (response as Response).data;
    });
}

interface Response {
    data: Product[];
}

const openMenu = ref(true);

function toggleMenu(): void {
    openMenu.value = !openMenu.value;
}

onMounted(() => {
    getProducts();
});
</script>

<template>
    <div>
        <MainLayout>
            <BoSectionTitle>
                <h1>Dashboard</h1>
            </BoSectionTitle>

            <hr />

            <div class="console_fast_container">
                <div class="console_container_head" @click.prevent="toggleMenu">
                    <BoSectionTitle>
                        <h2 :class="{ 'center': openMenu }"> Collegamenti rapidi </h2>
                    </BoSectionTitle>
                    <div class="close">
                        <img :src="openMenu ? close_img : down_img" alt="toggle" loading="eager" />
                    </div>
                </div>

                <hr v-if="openMenu" />

                <div class="fast_container" v-if="openMenu">
                    <RouterLink to="/backoffice/console/product/new" class="btn_es_custom">
                        Inserisci Prodotto
                    </RouterLink>
                    <RouterLink to="/backoffice/console/product/all" class="btn_es_custom">
                        Lista Prodotti
                    </RouterLink>
                    <RouterLink to="/backoffice/console/show/new" class="btn_es_custom">
                        Inserisci Fiera
                    </RouterLink>
                    <RouterLink to="/backoffice/console/product/category" class="btn_es_custom">
                        Associa Categorie Prodotti
                    </RouterLink>
                </div>
            </div>

            <div class="latest">

                <div class="last_header_products_container">
                    <BoSectionTitle>
                        <h2> Ultimi prodotti inseriti </h2>
                    </BoSectionTitle>

                    <div>
                        <RouterLink to="/backoffice/console/product/all" class="btn_custom btn_cust_primary">
                            Vedi tutti
                        </RouterLink>
                    </div>
                </div>

                <div class="last_products_container" v-if="store.apiStatus !== 'loading' && products.length > 0">
                    <table class="tab tab_striped ">
                        <thead>
                            <tr v-if="store.apiStatus !== 'loading'">
                                <th>Id</th>
                                <th>Nome</th>
                                <th>Azioni</th>
                            </tr>
                            <tr v-else>
                                <th v-for="i of 3" :key="i">
                                    <TextPlaceholder mode="sm" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(product, index) in products" :key="index">
                                <td>
                                    <span v-if="store.apiStatus !== 'loading'">
                                        {{ product.id }}
                                    </span>
                                    <TextPlaceholder v-else mode="md" />
                                </td>
                                <td>
                                    <span v-if="store.apiStatus !== 'loading'">
                                        {{ product.label_ita }}
                                    </span>
                                    <TextPlaceholder v-else mode="md" />
                                </td>
                                <td>
                                    <span v-if="store.apiStatus !== 'loading'">
                                        {{ product.formatted_updated_at }}
                                    </span>
                                    <TextPlaceholder v-else mode="md" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else-if="store.apiStatus === 'loading'" class="spinner_container">
                    <CommonSpinner mode="dots" />
                </div>
                <div v-else>
                    <ResultPlaceholder :btn="false" />
                </div>
            </div>

        </MainLayout>
    </div>
</template>

<style lang="scss" scoped>
.console_fast_container {
    padding: .75rem .25rem;
    margin: 2rem 0;
    border-radius: 6px;
    box-shadow: 0 0 8px -3px #7a7a7a5f;
    border: .25px solid #7a7a7a3c;
    background-color: #e4e4e4;

    @media screen and (min-width: 768px) {
        padding: .75rem;
    }

    @media screen and (min-width: 920px) {
        padding: 1rem;
    }

    .console_container_head {
        position: relative;
        cursor: pointer;

        h2 {
            letter-spacing: 1px;
            font-weight: bold;
            transition: all linear .3s;
            padding-right: 3rem;
            text-overflow: ellipsis;
            overflow: hidden;
            text-wrap: nowrap;
            cursor: pointer;

            &.center {
                text-align: center;
            }
        }

        .close {
            position: absolute;
            top: 0;
            right: 0;
            padding: .5rem;
            transition: all linear .3s;

            &:hover img {
                transform: scale(1.1);
                opacity: .8;
            }

            img {
                width: 1.5rem;
                height: 1.5rem;
            }
        }
    }

    .fast_container {
        @include flexmin(space-around, stretch, null, wrap, .7rem);

        @media screen and (min-width: 920px) {
            flex-wrap: nowrap;
        }
    }

    .btn_es_custom {
        width: calc(50% - 1rem);
        padding: 1rem;
        border-radius: 6px;
        background: var(--secondary-color);
        border: .5px solid #7a7a7a3c;
        align-content: center;
        display: block;
        text-align: center;
        box-shadow: 0 0 8px -3px #7a7a7a5f;
        color: white;
        transition: all linear .3s;
        text-decoration: none;
        font-weight: bold;

        @media screen and (min-width: 920px) {
            width: calc(100% / 4);
        }

        &:hover {
            transform: scale(1.025);
            text-decoration: none;
        }
    }
}

.latest {
    margin-top: 2.75rem;

    .last_header_products_container {
        @extend %fx_between_center;

        .btn_custom {
            padding: .35rem;
        }
    }

    .last_products_container {


        .tab {
            width: 100%;
            text-align: center;

            thead {
                tr {
                    font-weight: bold;
                }
            }

            td {
                align-content: center;
            }
        }
    }

    .spinner_container {
        width: 100%;
        text-align: center;
        align-content: center;
        margin: 2rem auto !important;
    }
}
</style>
