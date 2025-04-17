// types/entity/Show.ts

import type MultiFileChange from './MultiFileChange';

export interface Show {
    label_ita: string;
    label_eng: string;
    description_ita: string;
    description_eng: string;
    start_date: string;
    end_date: string | null;
    location: string;
    link: string;
    image: File | null;
    image_url: string;
    removed_image: boolean;
    images: MultiFileChange;
    images_url: string[];
}
