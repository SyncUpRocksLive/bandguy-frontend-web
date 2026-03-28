
// TODO: MOVE THESE TO A SHARED LOCATION
export interface ApiResponseBase<T> {
    success: boolean;
    data?: T;
    errorMessage?: string;
}

export interface ApiResponse {
    success: boolean;
    errorMessage?: string;
}

export interface LoggedInStatus {
    isLoggedIn: boolean;
    userId: string;
    userProfileName: string;
    username: string;
    logInUrl?: string;
    logOutUrl?: string;
}
