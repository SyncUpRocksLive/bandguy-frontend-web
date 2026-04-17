import { appState } from './State.svelte';

// Real auth implementation copied from shared
interface LoggedInStatus {
    isLoggedIn: boolean;
    userId: string;
    userProfileName: string;
    username: string;
    logInUrl?: string;
    logOutUrl?: string;
}

interface ApiResponseBase<T> {
	success: boolean;
	data?: T;
	errorMessage?: string;
}

const Log = console.log; // Placeholder logger

const GetAuthState = async (slide: boolean = false): Promise<LoggedInStatus | null> => {
	Log('verbose', 'Checking login state...');
	const data = await fetch(`/api/auth/loggedin`, { method: "GET", headers: { "Content-Type": "application/json" }});
	const response: ApiResponseBase<LoggedInStatus> = await data.json();
	Log('verbose', `Checking login state... ${data.status}`);
	if (data.status === 401 || !response.data || response.data.isLoggedIn === false || !response.data.userId || !response.data.username) {
		Log('verbose', 'Checking login state... Unauthorized');
		return null;
	}
	else if (!response.success) {
		Log('error', `Checking login state... unknown failure ${response.errorMessage}`);
		return null;
	}

	return response.data;
};

// src/auth.svelte.ts
class AuthService {
	// Use $state so the UI can react to login changes
	isAuthenticated = $state<boolean | null>(null); // null = "checking", true, or false
	user = $state<LoggedInStatus | null>(null);
	isChecking = $state(false);

	private intervalId: number | null = null;
	private loginUrl: string | null = null;
	private logoutUrl: string | null = null;

	constructor() {
		this.checkStatus();
		this.startPolling();
	}

	async checkStatus() {
		if (this.isChecking) {
			console.warn('Already checking auth status, skipping...');
			return;
		}

		this.isChecking = true;

		try {
			const loginState = await GetAuthState();

			// Update state
			this.isAuthenticated = loginState ? loginState.isLoggedIn : false;
			this.user = loginState ? {
				displayName: loginState.userProfileName,
				username: loginState.username,
				userId: loginState.userId
			} : null;

			appState.updateStore({
				user: this.user ? {
					displayName: this.user.displayName,
					username: this.user.username,
					userId: this.user.userId
				} : undefined
			});

			if (loginState) {
				this.loginUrl = loginState.logInUrl || null;
				this.logoutUrl = loginState.logOutUrl || null;
			}

			// If we were logged in and now we aren't, stop polling
			if (this.isAuthenticated === false) {
				this.stopPolling();
			}
		} catch (err) {
			this.isAuthenticated = false;
		} finally {
			this.isChecking = false;
		}
	}

	startPolling() {
		if (this.intervalId) return;
		// Check every 5 minutes (300,000 ms)
		this.intervalId = window.setInterval(() => this.checkStatus(), 300_000);
	}

	stopPolling() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	login(returnUrl?: string) {
		// Standard OIDC redirect
		const url = (this.loginUrl || '/api/auth/login') + (returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : '');
		console.log(`Redirecting to login: ${url}`);
		window.location.href = url;
	}

	logout() {
		// Standard OIDC redirect
		window.location.href = this.logoutUrl || '/api/auth/logout';
	}
}

export const auth = new AuthService();
