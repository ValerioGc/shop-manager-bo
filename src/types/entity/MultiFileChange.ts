// types/entity/MultiFileChange.ts

export default interface MultiFileChange {
    existing: { url: string; file?: File | null; id?: number }[];
    new: File[];
    removed: string[];
    images_order: { url: string; filename: string | null; order: number }[];
}
