<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { boStore } from '@/stores/boStore';
import { VueDraggable } from 'vue-draggable-plus'

interface OptionImage {
    url: string;
    file: File | null;
    order: number;
    id?: number;
}

interface ImagesOrderItem {
    url: string;
    filename: string | null;
    order: number;
}

const store = boStore();

const image_preview = ref<HTMLElement | null>(null)

const props = defineProps<{
    label: string;
    name: string;
    url: string[]; // array of image URLs to display in the gallery
    modelValue: File | string | null; // the model value of the input field (v-model)
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: File | string | null): void;
    (e: 'update:images', images: {
        existing: { url: string; file: null }[];
        new: File[];
        removed: string[];
        images_order: ImagesOrderItem[];
    }): void;
}>();

// Initialize imageUrl with the first URL from the props.url array (if available)
const imageUrl = ref<string | null>(props.url && props.url.length > 0 ? props.url[0] : null);
emit('update:modelValue', imageUrl.value);

const newImages = ref<File[]>([]);
const images = ref<OptionImage[]>([]);
const imagesOrder = ref<ImagesOrderItem[]>([]);
const hasFiles = computed(() => images.value.length > 0);

// Initialize the images array with the URL prop
if (props.url && props.url.length > 0) {
    images.value = props.url.map((url, index) => ({ url, file: null, order: index, id: index }));
    imagesOrder.value = images.value.map((img, index) => ({
        url: img.url,
        filename: img.file ? img.file.name : null,
        order: index
    }));
}

/**
 * Remove an image from the gallery.
 * @param index - The index of the image to remove.
 */
function removeImage(index: number): void {
    const currentImg = images.value[index];
    if (currentImg.file || currentImg.url) {
        // Ensure that store.selectedItem.images.removed is defined.
        if (!store.selectedItem.images.removed) {
            store.selectedItem.images.removed = [];
        }
        store.selectedItem.images.removed.push(currentImg.url);
        URL.revokeObjectURL(currentImg.url);
        // Remove the corresponding file from newImages.
        const offset = images.value.filter(img => img.file === null).length;
        newImages.value = newImages.value.filter((_, i) => i !== index - offset);
    }
    images.value.splice(index, 1);
    updateImagesOrder();
}

/**
 * Handle the file change event and add the new files to the images array.
 * @param event - The file change event.
 */
function handleFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files ? Array.from(target.files) : [];
    const newFiles = files.map((file, index) => {
        const url = URL.createObjectURL(file);
        return { url, file, order: images.value.length + index } as OptionImage;
    });
    newImages.value.push(...newFiles.map(fileObj => fileObj.file as File));
    images.value.push(...newFiles);
    updateImagesOrder();
}

// ********* Drag and Drop Management *********
function handleDragStart(): void {
    document.querySelector('.image_gallery_container')?.classList.add('dragging');
}

function handleDragEnd(): void {
    document.querySelector('.image_gallery_container')?.classList.remove('dragging');
    updateImagesOrder();
}

/**
 * Update the images order array with the new order and emit the update:images event.
 */
function updateImagesOrder(): void {
    const existing = images.value
        .filter(img => img.file === null)
        .map(img => ({ url: img.url, file: null }));
    const newFiles = images.value
        .filter(img => img.file !== null)
        .map(img => img.file as File);
    const removed = store.selectedItem.images.removed || [];
    imagesOrder.value = images.value.map((img, index) => ({
        url: img.file ? '' : img.url,
        filename: img.file ? img.file.name : null,
        order: index
    }));
    console.log('Images order:', imagesOrder.value);
    emit('update:images', { existing, new: newFiles, removed, images_order: imagesOrder.value });
}

onMounted(() => {
    imageUrl.value = props.url && props.url.length > 0 ? props.url[0] : null;
});

/**
 * Update the image URL when the model value changes.
 * Useful when modelValue is a File or a string URL.
 */
watch(() => props.modelValue, (newVal) => {
    if (newVal instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imageUrl.value = e.target?.result as string;
        };
        reader.readAsDataURL(newVal);
    } else if (typeof newVal === 'string') {
        imageUrl.value = newVal;
    } else {
        imageUrl.value = null;
    }
});

/**
 * Update the images array when the URL prop changes and initialize the imagesOrder array.
 */
watch(() => props.url, (newUrls) => {
    if (newUrls && newUrls.length > 0) {
        images.value = newUrls.map((url, index) => ({ url, file: null, order: index, id: index }));
        imagesOrder.value = images.value.map((img, index) => ({
            url: img.url,
            filename: img.file ? img.file.name : null,
            order: index
        }));
    }
});
</script>

<template>
    <div>
        <div>
            <label for="form_file_multiple" class="label_title">{{ label }}</label>
            <input :disabled="store.apiStatus === 'loading'" name="form_file_multiple"
                :class="{ 'has_files': hasFiles }" class="form-control" type="file" accept="image/*"
                id="form_file_multiple" multiple @change="handleFileChange">
        </div>
        <div class="image_gallery_container" v-if="hasFiles">

            <VueDraggable ref="image_preview" v-model="images" class="image_gallery" @start="handleDragStart"
                @end="handleDragEnd" :animation="150" :delay="1" :ghost-class="'sortable-ghost'">
                <div v-for="(element, index) in images" :key="index" class="thumbnail">
                    <img :src="element.url" :alt="`Preview ${index}`" class="img_thumbnail">
                    <a class="btn_remove" @click.prevent="removeImage(index)" href="#">
                        <img src="@/assets/icons/buttons/x-circle-red.svg" alt="Remove" loading="lazy" />
                    </a>
                </div>
            </VueDraggable>

        </div>
    </div>
</template>

<style lang="scss" scoped>
.sortable-ghost {
    opacity: 0.3;
    border: 2px dashed #bbb;
    transition: transform 0.15s ease-in-out;
}

// *************** Input File Styles ***************
input {
    border: .4px solid #c2c2c2b1;
    border-radius: 6px;
    background-color: #ffffff;
    display: block;
    cursor: pointer;
    box-shadow: 0 0 6px -2px #606060c2;
    appearance: none;
    margin: .25rem 0;
    width: 100%;
    transition: linear .15s;

    &:hover {
        filter: brightness(0.9);
    }

    &::-webkit-file-name-text {
        background-color: red;
        color: red !important;
    }

    &::-webkit-file-upload-button {
        padding: .75rem;
        color: white;
        background-color: var(--secondary-color);
        border-top-left-radius: 6px;
        border: 1px solid var(--secondary-color);
        border-bottom-left-radius: 6px;
    }

    &.has_files {
        border-bottom-left-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
    }
}

// *************** Image Gallery Styles ***************
.image_gallery_container {
    background-color: #adadade8;
    box-shadow: 0 0 8px -2px #454545d9;
    padding: 1rem 0;
    border-radius: 6px;
    border-top-left-radius: 0;
    border-top-right-radius: 0 !important;
    border: .4px solid #424242cf;

    &.dragging {
        cursor: grabbing !important;
    }

    .image_gallery {
        @include flexmin(flex-start, center, null, wrap, 10px);
        list-style-type: none;
        padding: 1rem;

        .thumbnail {
            position: relative;

            cursor: grabbing;
            width: 120px;
            height: 120px;
            border-radius: 6px;
            background-color: #ffffff;
            object-fit: cover;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
            cursor: pointer;

            &:hover {
                filter: brightness(0.9);
            }

            .img_thumbnail {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .btn_remove {
                position: absolute;
                top: 0;
                right: 0;
                background-color: transparent;
                border: none;
                cursor: pointer;
                padding: 0.1rem;

                &:hover {
                    transform: scale(1.06);
                    filter: brightness(1);
                }

                img {
                    width: 25px;
                    height: 25px;
                }
            }
        }
    }
}
</style>
