<script setup lang="ts">
import { boStore } from "@/stores/boStore";
import { onMounted, ref } from "vue";

import SettingsSection from "@/components/layout/partials/SettingsSection.vue";

import MainLayout from "@/components/layout/MainLayout.vue";
import BoSectionTitle from "@/components/layout/layout_elements/BoSectionTitle.vue";
import InputCheckbox from "@/components/form_fields/partials/InputCheckbox.vue";
import InputText from "@/components/form_fields/partials/InputText.vue";
import InputImage from "@/components/form_fields/partials/InputImage.vue";
import LongText from "@/components/form_fields/partials/LongText.vue";
import InputNumber from "@/components/form_fields/partials/InputNumber.vue";

import CommonSpinner from "@/components/utils_components/placeholders/CommonSpinner.vue";
import MsgToast from "@/components/messages/MsgToast.vue";
import ErrorBanner from "@/components/messages/ErrorBanner.vue";
import type { FEConfig } from "@/types/entity/FEConfig";

const store = boStore();


/**
 * Configurazione del front end
 */
const config = ref<FEConfig>({
    pagination: {
        homeProductPagePagination: 0,
        productPagePagination: 0,
        showPageOldPagination: 0,
        searchProductPagination: 0,
    },
    settings: {
        websiteMaintenance: false,
        showHomeBanner: false,
        bannerImg: '',
        showHomeTitle: false,
        showHomeShowSection: false,
        enableShowBanner: false,
        showPageImg: '',
    },
    titles: {
        homeTitleText: {
            ita: '',
            eng: ''
        },
        faqPageTitle: {
            ita: '',
            eng: ''
        },
        showPageTitle: {
            ita: '',
            eng: ''
        },
        contactPageTitle: {
            ita: '',
            eng: ''
        },
        searchPageTitle: {
            ita: '',
            eng: ''
        },
        footerTitle: {
            ita: '',
            eng: ''
        }
    },
    text: {
        homePageDescriptionText: {
            ita: '',
            eng: ''
        },
        homePageShowsText: {
            ita: '',
            eng: ''
        },
        showsPageText: {
            ita: '',
            eng: ''
        },
        showOldPageText: {
            ita: '',
            eng: ''
        },
        showNextPageText: {
            ita: '',
            eng: ''
        },
        contactPageText: {
            ita: '',
            eng: ''
        },
        footerText: {
            ita: '',
            eng: ''
        }
    }
});

// ********** Dropdown Management **********
const selectedDropdown = ref<string | null>(null);
const selectedFile = ref<File | null>(null); // Selected banner file
const selectedShowPageFile = ref<File | null>(null);

/**
 * Manage file change event
 * @param event - File change event
 * @param field - Field for the file
 */
function handleFileChange(event: Event, field: string): void {
    const target = event.target as HTMLInputElement;
    const file = target.files ? target.files[0] : undefined;
    if (file) {
        if (field === 'bannerImg') {
            selectedFile.value = file;
            config.value.settings.bannerImg = URL.createObjectURL(file);
        } else if (field === 'showPageImg') {
            selectedShowPageFile.value = file;
            config.value.settings.showPageImg = URL.createObjectURL(file);
        }
    }
}

/**
 * Read the front end configuration
 * @returns {void}
 */
async function readConfig(): Promise<void> {
    await store.apiDispatcher(
        '/config/read',
        'GET',
        'config'
    )
        .then((res) => {
            if (res.status && res.status === 'error' || [500, 422, 404, 401, 503, 'error'].includes(res.status)) {
                store.showMessage(res.error, 7000, 'error');
                return;
            }

            config.value = res;
            store.showMessage('Configurazione caricata con successo', 3000, 'success');

            if (store.debug) console.log("Configurazione caricata: ", config.value);
        });
}

/**
 * Save the front end configuration
 * @returns {void}
 */
async function saveConfig(): Promise<void> {
    selectedDropdown.value = null;
    const formData = new FormData();
    formData.append('config', JSON.stringify(config.value));

    if (selectedFile.value) {
        formData.append('bannerImg', selectedFile.value);
    }
    if (selectedShowPageFile.value) {
        formData.append('showPageImg', selectedShowPageFile.value);
    }
    if (store.debug)
        console.log([...formData.entries()]);

    try {
        await store.apiDispatcher(
            '/config/edit',
            'POST',
            'config',
            formData
        ).then((res) => {
            if (res.status && res.status === 'error') {
                store.showMessage(res.error, 7000, 'error');
                return;
            }

            store.showMessage('Configurazione salvata con successo', 7000, 'success');

            if (store.debug) console.log("Save successfull", res);
        });

    } catch (e) {
        if (store.debug) console.error(e);
    }
}

onMounted(async () => {
    readConfig();
});
</script>

<template>
    <MainLayout title="Fe settings">

        <MsgToast :errors="[]" type="success" />

        <div class="section_title_container">
            <BoSectionTitle>
                <h1>Impostazioni sito front end</h1>
            </BoSectionTitle>
            <a href="https://shop.com" target="_blank" alt="link sito web" class="btn_custom btn_cust_primary">
                <img src="@/assets/icons/aside/contact.svg" alt="link img" width="16" height="16" />
                Link Sito Web
            </a>
        </div>
        <hr />

        <div class="settings_form_container">
            <form class="form_cust custom_form" @submit.prevent="saveConfig()">

                <div class="maintenance_setting"
                    :class="{ 'disabled_section': store.apiStatus !== 'success' || store.api_statuses.config !== 'success' }">
                    <div>
                        <h2 class="form_label read_label" for="websiteMaintenance">Manutenzione sito front end</h2>
                    </div>
                    <InputCheckbox name="websiteMaintenance" label="Manutenzione sito"
                        v-model="config.settings.websiteMaintenance" :value="config.settings.websiteMaintenance"
                        :lblEnable="false" />
                </div>
                <!-- Homepage -->
                <SettingsSection sectionId="home_settings_form"
                    :isDisabled="store.apiStatus !== 'success' || store.api_statuses.config !== 'success'"
                    title="Pagina Home" :selectedDropdown="selectedDropdown"
                    @update:selectedDropdown="selectedDropdown = $event">
                    <table class="simple tab_striped">
                        <thead>
                            <tr>
                                <th>Paginazione</th>
                                <th>Elementi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <label for="homeProductPagePagination">Numero elementi lista Prodotti (Ultimi
                                        arrivi)</label>
                                </td>
                                <td class="pager_selector">
                                    <InputNumber name="homeProductPagePagination"
                                        v-model="config.pagination.homeProductPagePagination" :translate="false" />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <table class="simple tab_striped">
                        <thead class="setting_head">
                            <tr>
                                <th class="setting_head">Attiva</th>
                                <th class="setting_head">Sezione</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="checkbox_selector_container">
                                    <InputCheckbox name="home_banner" v-model="config.settings.showHomeBanner"
                                        :value="config.settings.showHomeBanner" :lblEnable="false" />
                                </td>
                                <td>
                                    <label for="home_banner">Visualizza Banner home</label>
                                </td>
                            </tr>
                            <tr>
                                <td class="checkbox_selector_container">
                                    <InputCheckbox name="home_title" v-model="config.settings.showHomeTitle"
                                        :value="config.settings.showHomeTitle" :lblEnable="false" />
                                </td>
                                <td>
                                    <label for="home_title">Visualizza Titolo</label>
                                </td>
                            </tr>
                            <tr>
                                <td class="checkbox_selector_container">
                                    <InputCheckbox name="home_carousel" v-model="config.settings.showHomeShowSection"
                                        :value="config.settings.showHomeShowSection" :lblEnable="false" />
                                </td>
                                <td>
                                    <label for="home_carousel">Visualizza Carousel Fiere</label>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="sections_subsetting">
                        <div class="home_banner_img_container">
                            <InputImage label="Banner homepage" name="home_banner_img" v-model="selectedFile"
                                :remove="true" :url="store.host + config.settings.bannerImg" :translate="false"
                                @change="(event: Event) => handleFileChange(event, 'bannerImg')" />
                        </div>
                        <div class="row_container">
                            <InputText ogText="" label="Titolo Home page" name="homePageTitle"
                                v-model="config.titles.homeTitleText.ita" :translate="false" class="home_title" />
                            <InputText :ogText="config.titles.homeTitleText.ita" label="Titolo Home page"
                                name="homePageTitle_eng" v-model="config.titles.homeTitleText.eng" :translate="true"
                                class="home_title" />
                        </div>

                        <div class="row_container">
                            <LongText ogText="" label=" Testo homepage descrizione" name="homePageDescriptionText"
                                v-model="config.text.homePageDescriptionText.ita" :translate="false" />
                            <LongText :ogText="config.text.homePageDescriptionText.ita"
                                label=" Testo homepage descrizione" name="homePageDescriptionText"
                                v-model="config.text.homePageDescriptionText.eng" :translate="true" />

                            <hr />

                            <LongText ogText="" label=" Testo homepage fiere" name="homePageShowsText"
                                v-model="config.text.homePageShowsText.ita" :translate="false" />
                            <LongText :ogText="config.text.homePageShowsText.ita" label=" Testo homepage fiere"
                                name="homePageShowsText" v-model="config.text.homePageShowsText.eng"
                                :translate="true" />
                        </div>
                    </div>
                </SettingsSection>

                <!-- Products -->
                <SettingsSection sectionId="product_settings_form" title="Pagina Prodotti"
                    :isDisabled="store.apiStatus !== 'success' || store.api_statuses.config !== 'success'"
                    :selectedDropdown="selectedDropdown" @update:selectedDropdown="selectedDropdown = $event">
                    <div class="sections_subsetting">
                        <table class="simple tab_striped">
                            <thead>
                                <tr>
                                    <th>Paginazione</th>
                                    <th>Elementi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <label for="productPagePagination">Numero elementi lista Prodotti</label>
                                    </td>
                                    <td class="pager_selector">
                                        <InputNumber name="productPagePagination"
                                            v-model="config.pagination.productPagePagination" :translate="false" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </SettingsSection>

                <!-- Shows -->
                <SettingsSection title="Pagina Fiere" sectionId="show_settings_form"
                    :isDisabled="store.apiStatus !== 'success' || store.api_statuses.config !== 'success'"
                    :selectedDropdown="selectedDropdown" @update:selectedDropdown="selectedDropdown = $event">
                    <table class="simple tab_striped">
                        <thead>
                            <tr>
                                <th>Paginazione</th>
                                <th>Elementi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <label for="showPageOldPagination">Numero elementi lista Fiere Passate</label>
                                </td>
                                <td class="pager_selector">
                                    <InputNumber name="showPageOldPagination"
                                        v-model="config.pagination.showPageOldPagination" :translate="false" />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <table class="simple tab_striped">
                        <thead class="setting_head">
                            <tr>
                                <th class="setting_head">Attiva</th>
                                <th class="setting_head">Sezione</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="checkbox_selector_container">
                                    <InputCheckbox name="show_banner" v-model="config.settings.enableShowBanner"
                                        :value="config.settings.enableShowBanner" :lblEnable="false" />
                                </td>
                                <td>
                                    <label for="show_banner">Visualizza Immagine banner Fiera</label>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="home_banner_img_container">
                        <InputImage label="Immagine pagina fiere" name="show_page_img" :remove="true"
                            :url="store.host + config.settings.showPageImg" v-model="selectedShowPageFile"
                            @change="(event: Event) => handleFileChange(event, 'showPageImg')" :translate="false" />
                    </div>

                    <div class="row_container">
                        <InputText ogText="" label=" Titolo Pagina Fiere" name="showPageTitle"
                            v-model="config.titles.showPageTitle.ita" :translate="false" class="home_title" />
                        <InputText :ogText="config.titles.showPageTitle.ita" label="Titolo Pagina Fiere"
                            name="showPageTitle_eng" v-model="config.titles.showPageTitle.eng" :translate="true"
                            class="home_title" />
                    </div>

                    <div class="sections_subsetting">
                        <LongText ogText="" label=" Testo pagina fiere" name="showPageText"
                            v-model="config.text.showsPageText.ita" :translate="false" />
                        <LongText :ogText="config.text.showsPageText.ita" label=" Testo pagina fiere"
                            name="showPageTextEng" v-model="config.text.showsPageText.eng" :translate="true" />

                        <hr />

                        <LongText ogText="" label="Testo sezione fiere passate" name="showOldPageText"
                            v-model="config.text.showOldPageText.ita" :translate="false" />
                        <LongText :ogText="config.text.showOldPageText.ita" label=" Testo sezione fiere passate"
                            name="showOldPageTextEng" v-model="config.text.showOldPageText.eng" :translate="true" />

                        <hr />

                        <LongText ogText="" label="Testo sezione fiere future" name="showNextPageText"
                            v-model="config.text.showNextPageText.ita" :translate="false" />
                        <LongText :ogText="config.text.showNextPageText.ita" label="Testo sezione fiere future"
                            name="showNextPageTextEng" v-model="config.text.showNextPageText.eng" :translate="true" />
                    </div>
                </SettingsSection>

                <!-- Contact Page -->
                <SettingsSection sectionId="contact_settings_form" title="Pagina Contatti"
                    :selectedDropdown="selectedDropdown"
                    :isDisabled="store.apiStatus !== 'success' || store.api_statuses.config !== 'success'"
                    @update:selectedDropdown="selectedDropdown = $event">

                    <div class="sections_subsetting">

                        <div class="row_container">
                            <InputText label="Titolo sezione contatti" name="contactPageTitle" ogText=""
                                v-model="config.titles.contactPageTitle.ita" :translate="false" class="home_title" />
                            <InputText label="Titolo sezione contatti" name="contactPageTitle_eng"
                                :ogText="config.titles.contactPageTitle.ita"
                                v-model="config.titles.contactPageTitle.eng" :translate="true" class="home_title" />
                        </div>

                        <hr />

                        <LongText ogText="" label="Testo pagina contatti" name="contactPageText"
                            v-model="config.text.contactPageText.ita" :translate="false" />
                        <LongText label="Testo pagina contatti" name="contactPageText"
                            :ogText="config.text.contactPageText.ita" v-model="config.text.contactPageText.eng"
                            :translate="true" />
                    </div>
                </SettingsSection>

                <!-- Search Page -->
                <SettingsSection sectionId="search_settings_form" title="Pagina Ricerca"
                    :isDisabled="store.apiStatus !== 'success' || store.api_statuses.config !== 'success'"
                    :selectedDropdown="selectedDropdown" @update:selectedDropdown="selectedDropdown = $event">
                    <div class="sections_subsetting">
                        <table class="simple tab_striped">
                            <thead>
                                <tr>
                                    <th>Paginazione</th>
                                    <th>Elementi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <label for="searchProductPagination">Numero elementi risultati Ricerca
                                            Prodotti</label>
                                    </td>
                                    <td class="pager_selector">
                                        <InputNumber name="searchProductPagination"
                                            v-model="config.pagination.searchProductPagination" :translate="false" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <InputText ogText="" label="Titolo Pagina ricerca" name="searchPageTitle"
                            v-model="config.titles.searchPageTitle.ita" :translate="false" class="home_title" />
                        <InputText :ogText="config.titles.searchPageTitle.ita" label="Titolo Pagina ricerca"
                            name="searchPageTitle_eng" v-model="config.titles.searchPageTitle.eng" :translate="true"
                            class="home_title" />
                    </div>
                </SettingsSection>

                <!-- Footer -->
                <SettingsSection sectionId="footer_settings_form" title="Footer Pagina"
                    :isDisabled="store.apiStatus !== 'success' || store.api_statuses.config !== 'success'"
                    :selectedDropdown="selectedDropdown" @update:selectedDropdown="selectedDropdown = $event">
                    <div class="sections_subsetting">
                        <div>
                            <InputText ogText="" label="Titolo sezione contatti" name="footerPageTitle"
                                v-model="config.titles.contactPageTitle.ita" :translate="false" class="home_title" />
                            <InputText :ogText="config.titles.contactPageTitle.ita" label="Titolo sezione contatti"
                                name="footerPageTitle_eng" v-model="config.titles.contactPageTitle.eng"
                                :translate="true" class="home_title" />
                        </div>
                        <div>
                            <InputText ogText="" label="Testo sub footer" name="footerPageText"
                                v-model="config.text.footerText.ita" :translate="false" class="home_title" />
                            <InputText :ogText="config.text.footerText.ita" label="Testo sub footer"
                                name="footerPageText_eng" v-model="config.text.footerText.eng" :translate="true"
                                class="home_title" />
                        </div>
                    </div>
                </SettingsSection>

                <!-- Save Button -->
                <div class="btn_custom_container">
                    <button class="btn_custom btn_cust_primary" role="button" type="submit"
                        :disabled="store.apiStatus !== 'success' || store.api_statuses.config !== 'success'">
                        <CommonSpinner :mode="'loader'" :size="'sm'" v-if="store.apiStatus === 'loading'" />
                        <span role="submit"> Salva </span>
                    </button>
                </div>

            </form>

            <ErrorBanner v-if="store.apiStatus === 'error' || store.api_statuses.config === 'error'" />
        </div>
    </MainLayout>
</template>

<style lang="scss" scoped>
.section_title_container {
    width: 100%;
    @extend %fx_between_center;
    gap: .5rem;
    flex-direction: row;

    @media screen and (max-width: 640px) {
        flex-direction: column;
    }

    .btn_custom {
        margin: 0;

        img {
            margin-right: .35rem;
            filter: invert(1);
        }
    }
}

input[type="text"],
textarea {
    margin-bottom: 1rem !important;
}

.home_banner_img_container {
    margin: 1.25rem auto;
}

hr {
    margin: 2rem 0 !important;
}

.row_container {
    margin-bottom: 1rem;
}

.maintenance_setting {
    @extend %fx_between_center;
    gap: .5rem;
    padding: 1rem;
    border-radius: var(--border_radius);
    box-shadow: 0 0 9px rgba(123, 123, 123, 0.812);
    background-color: #ffffff;

    &.disabled_section {
        cursor: wait !important;
        opacity: 0.5;

        &>div {
            pointer-events: none;
        }
    }


    .form_label {
        font-size: 1.5rem;
    }

    &:deep(.form_switch) {
        margin-bottom: 0;
        padding: 0;
    }
}

.settings_form_container {
    position: relative;
}

label {
    text-shadow: 0 0 4px #dbdbdbbd;
    color: black;
    font-weight: normal;
}

h2 {
    font-size: var(--fs_standard);
    font-weight: 600;
    color: var(--secondary-color);
    margin-bottom: 0;
}

.btn_custom_container {
    margin: auto;

    .btn_custom {
        @extend %fx_between_center;
        transition: all 0.3s linear;
        margin: 1rem auto 0.75rem;

        &:disabled {
            cursor: not-allowed;
            opacity: 0.6;
        }
    }
}

.form_cust {

    @extend %full_width;
    padding: 0.5rem;

    @include breakpoint('smp') {
        padding: 1rem;
    }

    @include breakpoint('md') {
        width: 90%;
        padding: 1.5rem;
    }

    @include breakpoint('lg') {
        width: 80%;
        padding: 1.75rem;
    }

    @include breakpoint('xxl') {
        width: 70%;
        padding: 2rem;
    }
}

.sections_subsetting {
    @include breakpoint('sm') {
        padding: 0.65rem;
    }
}

.home_title,
.map_address {
    width: 100%;
    margin: .75rem auto;

    @include breakpoint('sm') {
        width: 75%;
    }
}


.simple {
    width: 100%;

    tr td {
        padding: 0.5rem;
    }
}

table {
    margin-bottom: .5rem !important;
}

thead {
    text-align: center;

    th {
        font-weight: bold;
    }
}


tr {
    border-bottom-width: 0.5px !important;
    border-color: #000000;
    box-shadow: 1px 0 7px -6px rgb(182, 182, 182);

    td {
        align-content: center;
    }
}


thead {
    text-align: center;
    background-color: #1e78ff !important;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    color: #ffffff !important;
    text-shadow: 0 0 4px #3f3f3f8e;
}


hr {
    margin-bottom: 0.75rem;
    margin-top: 0;
}


.setting_head {
    background: none;
    color: white;
}

.checkbox_selector_container {
    width: 20%;
    text-align: center;
    align-content: center;
}

.pager_selector {
    width: 20%;
}
</style>
