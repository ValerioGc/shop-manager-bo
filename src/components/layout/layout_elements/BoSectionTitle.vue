<template>
    <div class="bo-section-title-container">
        <slot class="bo-section-title"></slot>
    </div>
</template>

<style lang="scss" >

    .bo-section-title-container > * {
        color: var(--secondary-color);
        text-shadow: .5px 0 .3px #4a4a4a;
    }

</style>
