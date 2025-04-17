<script setup lang="ts">

interface Props {
    mode: string;
    alig?: string | null;
    n?: number;
}

const props = withDefaults(defineProps<Props>(), {
    alig: null,
    n: 1,
});

</script>


<template>

    <div :class="{ 'm_a': !props.alig }" class="text_placeholder" v-if="props.mode === 'lg'"></div>
    <div :class="{ 'm_a': !props.alig }" class="text_placeholder md" v-if="props.mode === 'md'"></div>
    <div :class="{ 'm_a': !props.alig }" class="text_placeholder sm " v-else-if="props.mode === 'sm'"></div>
    <div :class="{ 'm_a': !props.alig }" class="text_placeholder xs " v-else-if="props.mode === 'xs'"></div>
    <div :class="{ 'm_a': !props.alig }" class="text_placeholder btn " v-else-if="props.mode === 'btn'"></div>
    <div :class="{ 'm_a': !props.alig }" class="text_placeholder block " v-else-if="props.mode === 'block'"></div>
    <div :class="{ 'm_a': !props.alig }" class="box wave" v-else-if="props.mode === 'box'"></div>
    <div :class="{ 'm_a': !props.alig }" class="group" v-else-if="props.mode === 'group'">
        <div v-for="i in props.n" :key="i" class="text_placeholder lg"></div>
    </div>

</template>

<style lang="scss" scoped>
.text_placeholder {
    margin: .35rem 0;
    display: block;
    min-height: 1.18rem;
    border-radius: 5px;
    cursor: wait;
    opacity: 0.75;
    background-color: #9b9b9b;
    width: 100%;
    mask-image: linear-gradient(130deg, #000 55%, #000000cc 75%, #000 95%);
    mask-size: 200% 100%;
    animation: wave 2s linear infinite;

    &.btn {
        width: 1.4rem;
        height: 1.4rem;
        display: inline-block;
        background-color: #656565;
    }

    &.block {
        width: 5rem;
    }

    &.sm {
        width: 50%;
        min-height: 1.1em;
    }

    &.md {
        width: 75%;
    }

    &.xs {
        width: 25%;
    }
}

.box {
    z-index: var(--z_2);
    background-color: rgb(145, 145, 145);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    animation: glow 2s ease-in-out infinite;
}

.group {
    margin: .75rem 0 !important;
    margin: .5rem 0;
}

// ********** ANIMATIONS **********
.wave {
    mask-image: linear-gradient(140deg, #000 55%, rgba(0, 0, 0, 0.8) 75%, #000 95%);
    mask-size: 200% 100%;
    animation: wave 2s linear infinite;
}

@keyframes glow {
    50% {
        opacity: 0.2;
    }
}

@keyframes wave {
    100% {
        -webkit-mask-position: -200% 0%;
        mask-position: -200% 0%;
    }
}


.m_a {
    margin: .35rem auto;
}
</style>