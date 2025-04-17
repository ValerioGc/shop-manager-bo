<template>
    <div>
        <slot class="text_slot"></slot>
        <img src="@/assets/flags/eng.svg" alt="Flag of england" class="eng_flag" loading="lazy" />
    </div>
</template>

<style lang="scss" scoped>

    div {
        & > * {
            vertical-align: middle;
            display: inline-block;
        }

        .eng_flag {
            width: 22px;
            height: 22px;
            margin-left: .75rem;
        }

        .text_slot {
            display: inline-block;
        }
    }

</style>
