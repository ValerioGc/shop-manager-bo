// types/entity/Contact.ts

export interface Contact {
    id?: number;
    label_ita: string;
    label_eng: string;
    link_value: string;
    image_url?: string;
    image: File | null;
}
