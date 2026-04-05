export interface LoggedInStatus {
    isLoggedIn: boolean;
    userId: string;
    userProfileName: string;
    username: string;
    logInUrl?: string;
    logOutUrl?: string;
}
