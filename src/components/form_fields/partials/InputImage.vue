<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

interface Props {
    label: string;
    name: string;
    url?: string;
    remove: boolean;
    modelValue: File | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: File | null): void;
}>();

const imageUrl = ref<string | null>(props.url ?? null);

/**
 * Handle file change event
 */
function handleFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files ? target.files[0] : null;
    if (file) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            imageUrl.value = e.target?.result as string;
            emit('update:modelValue', file);
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Remove image and emit null
 */
function removeImage(): void {
    imageUrl.value = null;
    emit('update:modelValue', null);
}

watch(() => props.modelValue, (newVal) => {
    if (newVal instanceof File) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            imageUrl.value = e.target?.result as string;
        };
        reader.readAsDataURL(newVal);
    } else if (typeof newVal === 'string') {
        imageUrl.value = newVal;
    } else {
        imageUrl.value = null;
    }
});

watch(() => props.url, (newUrl: string | undefined) => {
    imageUrl.value = newUrl ?? null;
});

onMounted(() => {
    imageUrl.value = props.url ?? null;
});

</script>

<template>
    <div class="input_image_container">
        <label :for="name" class="form_label">{{ label }}</label>
        <div class="file_upload">
            <input type="file" :id="name + label" accept="image/*" @change="handleFileChange" />
            <div v-if="imageUrl" class="image_preview ">
                <img :src="imageUrl" alt="Preview" loading="lazy" />
                <button class="btn_remove" @click.prevent="removeImage()" v-if="props.remove">
                    <img src="@/assets/icons/buttons/x-circle-red.svg" alt="Remove" loading="eager" />
                </button>
            </div>
            <span v-else class="upload_text">
                <img src="@/assets/icons/upload.svg" alt="Upload" loading="eager" />
                <p>
                    Carica immagine
                </p>
            </span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.input_image_container {
    text-align: center;

    label {
        display: block;
        font-weight: bold;
        padding-bottom: .35rem;
    }

    .file_upload {
        @extend %full_width;
        height: 200px;
        min-height: 100%;
        box-shadow: 0 0 5px #0000001a;
        border: var(--border_sm) #82828271;
        background-color: #c4c4c4;
        position: relative;
        display: inline-block;
        border-radius: 10px;
        padding: 0;
        margin: 0 auto;
        @extend %tx_center;

        @include breakpoint('sm') {
            width: 80%;
        }

        @include breakpoint('md') {
            width: 70%;
        }

        @include breakpoint('xl') {
            width: 60%;
        }

        &:hover {
            background-color: #cccccc;
            filter: brightness(.9);
        }

        input[type="file"] {
            @extend %full_wh;
            @include center('both', 'absolute', 'false', 0, 0);
            opacity: 0;
            cursor: pointer;
        }

        .upload_text {
            @include center('both', 'absolute', 'true', 0, 50%);
            @extend %full_width;
            @extend %tx_center;
            color: #ffffff;
            pointer-events: none;

            p {
                font-weight: bold;
                text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
            }

            img {
                width: 50px;
                height: 50px;
                margin-bottom: 10px;
                filter: invert(1);
            }
        }

        .image_preview {
            height: 100%;

            img {
                @extend %full_wh;
                border-radius: 10px;
                object-fit: cover;
            }

            .btn_remove {
                position: absolute;
                top: 10px;
                right: 10px;
                background: transparent;
                border: none;
                color: #ffffff;
                cursor: pointer;

                &:hover {
                    color: #ff0000;
                }

                img {
                    width: 30px;
                }
            }
        }
    }
}
</style>
