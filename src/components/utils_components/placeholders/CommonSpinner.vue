<script setup lang="ts">

interface Props {
    mode: string;
    size?: string;
}

const props = withDefaults(defineProps<Props>(), {
    size: 'md'
});

</script>

<template>

    <!-- Spinner -->
    <div class="spc" v-if="props.mode === 'spinner' || props.mode === 'ld'">
        <div :class="{ 'sm': props.size === 'sm', 'ld': props.mode === 'ld', 'sc': props.mode === 'spinner' }">
        </div>
    </div>

    <!-- Dots -->
    <div v-else-if="props.mode === 'dots'">
        <div class="ldng">
            <span class="ldngdt" v-for="i in 3" :key="i"></span>
        </div>
    </div>

</template>

<style lang="scss" scoped>
// ********* SPINNER *********
.spc {
    text-align: center;

    .sc:not(.sm) {
        width: 45px;
        background: conic-gradient(#0000 10%, #496ad4) content-box;
        height: 45px;
    }

    .sc {
        margin: auto;
        border-radius: 50%;
        padding: 1.1px;
        -webkit-mask: repeating-conic-gradient(#0000 0deg, #000 1deg 20deg, #0000 21deg 36deg), radial-gradient(farthest-side, #0000 calc(100% - 9px), #000 calc(100% - 9px));
        -webkit-mask-composite: destination-in;
        mask-composite: intersect;
        animation: spin 1s infinite steps(10);
    }

    .ld {
        padding: 8px;
        aspect-ratio: 1;
        border-radius: 50%;
        background: #25b09b;
        -webkit-mask: conic-gradient(#0000 10%, #000), linear-gradient(#000 0 0) content-box;
        mask: conic-gradient(#0000 10%, #000), linear-gradient(#000 0 0) content-box;
        -webkit-mask-composite: source-out;
        mask-composite: subtract;
        margin-right: .35rem;
        animation: l3 1s infinite linear;
    }

    @keyframes l3 {
        to {
            transform: rotate(1turn)
        }
    }

    .sm {
        width: 19px;
        height: 19px;
        background: conic-gradient(#0000 10%, white), content-box;
    }
}

@keyframes spin {
    to {
        transform: rotate(1turn);
    }
}

// ********* DOTS *********
.ldng {
    @extend %fx_center;
    @extend %full_wh;
    padding: 2rem;

    .ldngdt {
        display: block;
        height: 1rem;
        width: 1rem;
        margin: 0 0.75rem;
        border-radius: 50%;
        background-color: #808080;
        animation: dot 1s ease-in-out infinite;

        &:nth-of-type(2) {
            animation-delay: 0.2s;
        }

        &:nth-of-type(3) {
            animation-delay: 0.4s;
        }
    }
}

@keyframes dot {

    0%,
    100% {
        background-color: #496ad4;
        transform: scale(1);
    }

    50% {
        background-color: #588ce6;
        transform: scale(1.3);
    }
}
</style>
