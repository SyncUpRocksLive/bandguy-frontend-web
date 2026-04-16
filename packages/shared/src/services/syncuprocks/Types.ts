export interface ApiResponseBase<T> {
    success: boolean;
    data?: T;
    errorMessage?: string;
}

export interface ApiResponse {
    success: boolean;
    errorMessage?: string;
}

