// types/entity/Category.ts

import type { Product } from './Product';

export interface Category {
    id?: number;
    label_ita: string;
    label_eng: string;
    type: number | null;
    parent_id: number | null;
    sub_categories?: Category[];
    parent: Category | null;
    categories?: Category[];
    products: Product[] | number[];
}
