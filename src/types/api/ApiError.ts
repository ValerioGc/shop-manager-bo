// types/api/ApiError.ts

export interface ApiError {
    response: {
        status: number;
        data: Record<string, string[]>;
    };
    message?: string;
    name: string;
    code?: string;
}
