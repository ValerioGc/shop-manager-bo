// types/entity/Product.ts

import type { Category } from './Category';
import type { Condition } from './Condition';
import type MultiFileChange from './MultiFileChange';

export interface Product {
    id: number;
    label_ita: string;
    label_eng: string;
    price: string;
    image_url?: string;
    draft: boolean;
    condition_id: number | null;
    in_evidence: boolean;
    deleting: boolean;
    creator: string;
    code: string;
    condition: Condition | null;
    description_eng?: string;
    description_ita?: string;
    images_url: string[];
    quantity: number | null;
    year: number | null;
    category?: Category[] | number[];
    formatted_updated_at: string;
    images?: MultiFileChange | null;
    created_at: string;
    categories: Category[] | number[];
    updated_at: string;
}
