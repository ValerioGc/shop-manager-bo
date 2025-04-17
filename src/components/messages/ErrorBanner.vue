<script setup lang="ts">

const reloadPage = () => location.reload();

</script>

<template>
    <div class="error_banner_container">
        <div class="error_banner" role="alert">
            <div class="error_banner_header">
                <img src="@/assets/icons/alert/server_error.svg" alt="Errore" loading="lazy" />
                <h5>Errore!</h5>
            </div>
            <div class="message">
                <p>Si è verificato un errore durante il caricamento dei dati.</p>
                <button class="btn_custom btn_cust_secondary" type="button"
                    @click.prevent="reloadPage()">Ricarica</button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.error_banner_container {
    @extend %fx_center;
    @extend %full_wh;
    margin-top: 5rem;
    position: absolute;
    top: 35%;
    left: 50%;
    transform: translate(-50%, -50%);
    backdrop-filter: blur(3px);
    z-index: var(--z_3);

    .error_banner {
        border: solid 0.4px #a60000ee;
        border-radius: var(--border_radius);
        padding: 1rem 1.25rem;
        background-color: var(--danger_color_light);
        color: var(--danger_color_dark);
        text-align: center;

        .error_banner_header {
            img {
                vertical-align: middle;
                margin-bottom: 0.5rem;
                height: 50px;
                width: 50px;
            }
        }

        .message {
            text-align: center;

            .btn_custom {
                margin: 1rem auto;
                background: rgba(255, 247, 247, 0.86);
            }
        }
    }
}
</style>
