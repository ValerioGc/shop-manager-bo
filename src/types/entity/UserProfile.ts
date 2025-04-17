export interface UserProfile {
    id?: string | null;
    name: string;
    email: string;
    image: File | null;
    image_url: string;
    password: string;
    password_confirmation: string;
    removed_image: boolean;
}
